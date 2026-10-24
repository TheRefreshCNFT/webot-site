import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import type { AccountContext } from "../auth/account";
import {
  isSupabaseRuntimeConfigured,
  normalizeSupabaseUrl,
  requireConfigValue,
  SupabaseRestClient
} from "../db/supabase-rest";
import { getAccountJob, isCustomerDeliveryVisible } from "../jobs";
import { recordReject, SafeRejectError } from "../rejects";

export type FilePurpose = "job_source" | "job_reference" | "job_deliverable";

export type JobFileRow = {
  id: string;
  accountId: string;
  jobId: string | null;
  intakeSessionId?: string | null;
  purpose: FilePurpose;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageProvider: FileStorageProvider;
  storageKey: string;
  status: JobFileStatus;
  version: number;
  optionIndex?: number | null;
  optionLabel?: string | null;
  retentionExpiresAt: string;
  createdAt: string;
};

export type FileStorageProvider = "placeholder" | "supabase_storage";
export type JobFileStatus = "pending_upload" | "uploaded" | "attached" | "delivered" | "expired" | "removed";

export type FileRepository = {
  insert(row: JobFileRow): Promise<JobFileRow>;
  listByAccountId(accountId: string): Promise<JobFileRow[]>;
  listByJobId(accountId: string, jobId: string): Promise<JobFileRow[]>;
  getByAccountAndId(accountId: string, fileId: string): Promise<JobFileRow | null>;
  listExpired(now: Date, limit: number): Promise<JobFileRow[]>;
  updateStatus(fileId: string, status: JobFileStatus): Promise<JobFileRow>;
  bindSessionFiles(accountId: string, intakeSessionId: string, jobId: string): Promise<JobFileRow[]>;
};

export type PresignInput = {
  purpose?: unknown;
  content_type?: unknown;
  size_bytes?: unknown;
  file_name?: unknown;
  job_id?: unknown;
  intake_session_id?: unknown;
  retention_days?: unknown;
};

type PresignOptions = {
  repository?: FileRepository;
  storage?: FileUploadPresigner;
  now?: () => Date;
};

export type FileUploadPresignResult = {
  provider: FileStorageProvider;
  method: "PUT";
  url: string;
  expiresAt: string;
  headers: Record<string, string>;
};

export type FileUploadPresigner = {
  createSignedUpload(input: {
    storageKey: string;
    contentType: string;
    sizeBytes: number;
    expiresAt: string;
  }): Promise<FileUploadPresignResult>;
};

export type FileDownloadSignResult = {
  provider: FileStorageProvider;
  method: "GET";
  url: string;
  expiresAt: string;
};

export type FileDownloadSigner = {
  createSignedDownload(input: {
    storageProvider: FileStorageProvider;
    storageKey: string;
    expiresAt: string;
  }): Promise<FileDownloadSignResult>;
};

export type FileStorageRemover = {
  removeObject(input: {
    storageProvider: FileStorageProvider;
    storageKey: string;
  }): Promise<void>;
};

export type FileStorageInspector = {
  readObject(input: {
    storageProvider: FileStorageProvider;
    storageKey: string;
    maxBytes: number;
  }): Promise<Uint8Array | null>;
};

export type FileCleanupResult = {
  scanned: number;
  expired: number;
  removed: number;
  dryRun: boolean;
  failures: Array<{
    fileId: string;
    reason: string;
  }>;
};

const allowedPurposes = new Set<FilePurpose>(["job_source", "job_reference", "job_deliverable"]);
const allowedContentTypes = new Set([
  "application/json",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "audio/aac",
  "audio/flac",
  "audio/midi",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "image/heic",
  "image/heif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "text/markdown",
  "text/plain",
  "video/mp4",
  "video/quicktime"
]);
const contentTypeAliases = new Map([
  ["application/ogg", "audio/ogg"],
  ["audio/wave", "audio/wav"],
  ["audio/x-aac", "audio/aac"],
  ["audio/x-flac", "audio/flac"],
  ["audio/x-m4a", "audio/mp4"],
  ["audio/x-wav", "audio/wav"],
  ["image/heic-sequence", "image/heic"],
  ["image/heif-sequence", "image/heif"]
]);
const maxSizeBytes = 25 * 1024 * 1024;

export class InMemoryFileRepository implements FileRepository {
  protected readonly rows = new Map<string, JobFileRow>();

  async insert(row: JobFileRow): Promise<JobFileRow> {
    this.rows.set(row.id, cloneRow(row));
    return cloneRow(row);
  }

  async listByAccountId(accountId: string): Promise<JobFileRow[]> {
    return Array.from(this.rows.values())
      .filter((row) => row.accountId === accountId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(cloneRow);
  }

  async listByJobId(accountId: string, jobId: string): Promise<JobFileRow[]> {
    return Array.from(this.rows.values())
      .filter((row) => row.accountId === accountId && row.jobId === jobId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(cloneRow);
  }

  async getByAccountAndId(accountId: string, fileId: string): Promise<JobFileRow | null> {
    const row = this.rows.get(fileId);
    return row && row.accountId === accountId ? cloneRow(row) : null;
  }

  async listExpired(now: Date, limit: number): Promise<JobFileRow[]> {
    return Array.from(this.rows.values())
      .filter((row) => row.status !== "removed" && new Date(row.retentionExpiresAt).getTime() <= now.getTime())
      .sort((left, right) => left.retentionExpiresAt.localeCompare(right.retentionExpiresAt))
      .slice(0, limit)
      .map(cloneRow);
  }

  async updateStatus(fileId: string, status: JobFileStatus): Promise<JobFileRow> {
    const row = this.rows.get(fileId);

    if (!row) {
      throw new Error("File row not found.");
    }

    const updated = {
      ...row,
      status
    };
    this.rows.set(fileId, updated);
    return cloneRow(updated);
  }

  async bindSessionFiles(accountId: string, intakeSessionId: string, jobId: string): Promise<JobFileRow[]> {
    const bound: JobFileRow[] = [];
    for (const row of this.rows.values()) {
      if (row.accountId === accountId && row.intakeSessionId === intakeSessionId && row.jobId === null
        && (row.status === "pending_upload" || row.status === "uploaded")) {
        const updated = {
          ...row,
          jobId,
          intakeSessionId: null,
          status: row.status === "uploaded" ? "attached" as const : "pending_upload" as const
        };
        this.rows.set(row.id, updated);
        bound.push(cloneRow(updated));
      }
    }
    return bound;
  }

  dumpRowsForTests(): JobFileRow[] {
    return Array.from(this.rows.values()).map(cloneRow);
  }
}

type FileRepositorySnapshot = {
  files: JobFileRow[];
};

export class LocalFileFileRepository extends InMemoryFileRepository {
  private readonly filePath: string;
  private readonly lockDir: string;

  constructor(filePath: string) {
    super();
    this.filePath = resolve(filePath);
    this.lockDir = `${this.filePath}.lock`;
    this.loadFromDisk();
  }

  override async insert(row: JobFileRow): Promise<JobFileRow> {
    return this.withWriteLock(async () => {
      this.loadFromDisk();
      const result = await super.insert(row);
      this.persistToDisk();
      return result;
    });
  }

  override async listByAccountId(accountId: string): Promise<JobFileRow[]> {
    this.loadFromDisk();
    return super.listByAccountId(accountId);
  }

  override async listByJobId(accountId: string, jobId: string): Promise<JobFileRow[]> {
    this.loadFromDisk();
    return super.listByJobId(accountId, jobId);
  }

  override async getByAccountAndId(accountId: string, fileId: string): Promise<JobFileRow | null> {
    this.loadFromDisk();
    return super.getByAccountAndId(accountId, fileId);
  }

  override async listExpired(now: Date, limit: number): Promise<JobFileRow[]> {
    this.loadFromDisk();
    return super.listExpired(now, limit);
  }

  override async updateStatus(fileId: string, status: JobFileStatus): Promise<JobFileRow> {
    return this.withWriteLock(async () => {
      this.loadFromDisk();
      const result = await super.updateStatus(fileId, status);
      this.persistToDisk();
      return result;
    });
  }

  override async bindSessionFiles(accountId: string, intakeSessionId: string, jobId: string): Promise<JobFileRow[]> {
    return this.withWriteLock(async () => {
      this.loadFromDisk();
      const result = await super.bindSessionFiles(accountId, intakeSessionId, jobId);
      this.persistToDisk();
      return result;
    });
  }

  private loadFromDisk(): void {
    this.rows.clear();

    if (!existsSync(this.filePath)) {
      return;
    }

    const parsed = JSON.parse(readFileSync(this.filePath, "utf8")) as Partial<FileRepositorySnapshot>;

    for (const file of Array.isArray(parsed.files) ? parsed.files : []) {
      this.rows.set(file.id, cloneRow(file));
    }
  }

  private persistToDisk(): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp-${process.pid}-${Date.now()}`;
    const snapshot: FileRepositorySnapshot = {
      files: Array.from(this.rows.values()).map(cloneRow)
    };
    writeFileSync(tempPath, `${JSON.stringify(snapshot, null, 2)}\n`);
    renameSync(tempPath, this.filePath);
  }

  private async withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
    await this.acquireLock();

    try {
      return await operation();
    } finally {
      rmSync(this.lockDir, { force: true, recursive: true });
    }
  }

  private async acquireLock(): Promise<void> {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      try {
        mkdirSync(this.lockDir);
        return;
      } catch (error) {
        if (!isFileExistsError(error)) {
          throw error;
        }

        await sleep(20);
      }
    }

    throw new Error("Timed out waiting for local file repository lock.");
  }
}

type SupabaseJobFileRow = {
  id: string;
  account_id: string;
  job_id: string | null;
  intake_session_id: string | null;
  purpose: FilePurpose;
  file_name: string;
  content_type: string;
  size_bytes: number;
  storage_provider: FileStorageProvider;
  storage_key: string;
  status: JobFileStatus;
  version: number;
  option_index: number | null;
  option_label: string | null;
  retention_expires_at: string;
  created_at: string;
};

export class SupabaseFileRepository implements FileRepository {
  private readonly client: SupabaseRestClient;

  constructor(client: SupabaseRestClient = SupabaseRestClient.fromEnv()) {
    this.client = client;
  }

  async insert(row: JobFileRow): Promise<JobFileRow> {
    const rows = await this.client.insert<SupabaseJobFileRow>("app_public", "job_files", toSupabaseRow(row));
    return fromSupabaseRow(requireOne(rows, "File insert returned no row."));
  }

  async listByAccountId(accountId: string): Promise<JobFileRow[]> {
    const rows = await this.client.get<SupabaseJobFileRow>("app_public", "job_files", {
      select: jobFileSelect,
      account_id: `eq.${accountId}`,
      order: "created_at.desc"
    });
    return rows.map(fromSupabaseRow);
  }

  async listByJobId(accountId: string, jobId: string): Promise<JobFileRow[]> {
    const rows = await this.client.get<SupabaseJobFileRow>("app_public", "job_files", {
      select: jobFileSelect,
      account_id: `eq.${accountId}`,
      job_id: `eq.${jobId}`,
      order: "created_at.desc"
    });
    return rows.map(fromSupabaseRow);
  }

  async getByAccountAndId(accountId: string, fileId: string): Promise<JobFileRow | null> {
    const rows = await this.client.get<SupabaseJobFileRow>("app_public", "job_files", {
      select: jobFileSelect,
      account_id: `eq.${accountId}`,
      id: `eq.${fileId}`,
      limit: "1"
    });
    return rows[0] ? fromSupabaseRow(rows[0]) : null;
  }

  async listExpired(now: Date, limit: number): Promise<JobFileRow[]> {
    const rows = await this.client.get<SupabaseJobFileRow>("app_public", "job_files", {
      select: jobFileSelect,
      retention_expires_at: `lte.${now.toISOString()}`,
      status: "not.eq.removed",
      order: "retention_expires_at.asc",
      limit: String(limit)
    });
    return rows.map(fromSupabaseRow);
  }

  async updateStatus(fileId: string, status: JobFileStatus): Promise<JobFileRow> {
    const rows = await this.client.update<SupabaseJobFileRow>("app_public", "job_files", {
      id: `eq.${fileId}`
    }, {
      status
    });
    return fromSupabaseRow(requireOne(rows, "File status update returned no row."));
  }

  async bindSessionFiles(accountId: string, intakeSessionId: string, jobId: string): Promise<JobFileRow[]> {
    const uploaded = await this.client.update<SupabaseJobFileRow>("app_public", "job_files", {
      account_id: `eq.${accountId}`,
      intake_session_id: `eq.${intakeSessionId}`,
      job_id: "is.null",
      status: "eq.uploaded"
    }, { job_id: jobId, intake_session_id: null, status: "attached" });
    const pending = await this.client.update<SupabaseJobFileRow>("app_public", "job_files", {
      account_id: `eq.${accountId}`,
      intake_session_id: `eq.${intakeSessionId}`,
      job_id: "is.null",
      status: "eq.pending_upload"
    }, { job_id: jobId, intake_session_id: null });
    return [...uploaded, ...pending].map(fromSupabaseRow);
  }
}

const jobFileSelect = [
  "id",
  "account_id",
  "job_id",
  "intake_session_id",
  "purpose",
  "file_name",
  "content_type",
  "size_bytes",
  "storage_provider",
  "storage_key",
  "status",
  "version",
  "option_index",
  "option_label",
  "retention_expires_at",
  "created_at"
].join(",");

let defaultRepository: FileRepository | null = null;
let defaultStorage: FileUploadPresigner | null = null;
let defaultDownloadSigner: FileDownloadSigner | null = null;
let defaultStorageRemover: FileStorageRemover | null = null;
let defaultStorageInspector: FileStorageInspector | null = null;

export function getFileRepository(): FileRepository {
  if (!defaultRepository) {
    const localRepositoryFile = getLocalFileRepositoryFile();
    defaultRepository = isSupabaseRuntimeConfigured()
      ? new SupabaseFileRepository()
      : localRepositoryFile
        ? new LocalFileFileRepository(localRepositoryFile)
        : new InMemoryFileRepository();
  }

  return defaultRepository;
}

export function getFileUploadPresigner(): FileUploadPresigner {
  if (!defaultStorage) {
    defaultStorage = isSupabaseStorageConfigured()
      ? new SupabaseStorageUploadPresigner()
      : new PlaceholderFileUploadPresigner();
  }

  if (process.env.NODE_ENV === "production" && defaultStorage instanceof PlaceholderFileUploadPresigner) {
    throw new Error("Production file upload storage is not configured.");
  }

  return defaultStorage;
}

export function getFileDownloadSigner(): FileDownloadSigner {
  if (!defaultDownloadSigner) {
    defaultDownloadSigner = isSupabaseStorageConfigured()
      ? new SupabaseStorageDownloadSigner()
      : new PlaceholderFileDownloadSigner();
  }

  if (process.env.NODE_ENV === "production" && defaultDownloadSigner instanceof PlaceholderFileDownloadSigner) {
    throw new Error("Production file download storage is not configured.");
  }

  return defaultDownloadSigner;
}

export function getFileStorageRemover(): FileStorageRemover {
  if (!defaultStorageRemover) {
    defaultStorageRemover = isSupabaseStorageConfigured()
      ? new SupabaseStorageObjectRemover()
      : new PlaceholderFileStorageRemover();
  }

  if (process.env.NODE_ENV === "production" && defaultStorageRemover instanceof PlaceholderFileStorageRemover) {
    throw new Error("Production file cleanup storage is not configured.");
  }

  return defaultStorageRemover;
}

export function getFileStorageInspector(): FileStorageInspector {
  if (!defaultStorageInspector) {
    defaultStorageInspector = isSupabaseStorageConfigured()
      ? new SupabaseStorageInspector()
      : new PlaceholderFileStorageInspector();
  }
  return defaultStorageInspector;
}

export function resetFileRepositoryForTests(repository: FileRepository = new InMemoryFileRepository()): void {
  defaultRepository = repository;
  defaultStorage = new PlaceholderFileUploadPresigner();
  defaultDownloadSigner = new PlaceholderFileDownloadSigner();
  defaultStorageRemover = new PlaceholderFileStorageRemover();
  defaultStorageInspector = new PlaceholderFileStorageInspector();
}

export function resetFileStorageForTests(storage: FileUploadPresigner = new PlaceholderFileUploadPresigner()): void {
  defaultStorage = storage;
}

export function resetFileDownloadSignerForTests(downloadSigner: FileDownloadSigner = new PlaceholderFileDownloadSigner()): void {
  defaultDownloadSigner = downloadSigner;
}

export function resetFileStorageRemoverForTests(storageRemover: FileStorageRemover = new PlaceholderFileStorageRemover()): void {
  defaultStorageRemover = storageRemover;
}

export function resetFileStorageInspectorForTests(inspector: FileStorageInspector = new PlaceholderFileStorageInspector()): void {
  defaultStorageInspector = inspector;
}

export class PlaceholderFileUploadPresigner implements FileUploadPresigner {
  async createSignedUpload(input: {
    storageKey: string;
    contentType: string;
    sizeBytes: number;
    expiresAt: string;
  }): Promise<FileUploadPresignResult> {
    const fileId = input.storageKey.split("/").at(-2) ?? input.storageKey;

    return {
      provider: "placeholder",
      method: "PUT",
      url: `https://upload.local.webot.invalid/v1/files/${fileId}`,
      expiresAt: input.expiresAt,
      headers: {
        "content-type": input.contentType,
        "x-webot-file-id": fileId,
        "x-webot-max-size": String(input.sizeBytes)
      }
    };
  }
}

export class PlaceholderFileDownloadSigner implements FileDownloadSigner {
  async createSignedDownload(input: {
    storageProvider: FileStorageProvider;
    storageKey: string;
    expiresAt: string;
  }): Promise<FileDownloadSignResult> {
    const fileId = input.storageKey.split("/").at(-2) ?? input.storageKey;

    return {
      provider: input.storageProvider,
      method: "GET",
      url: `https://download.local.webot.invalid/v1/files/${fileId}`,
      expiresAt: input.expiresAt
    };
  }
}

export class PlaceholderFileStorageRemover implements FileStorageRemover {
  async removeObject(): Promise<void> {
    return undefined;
  }
}

export class PlaceholderFileStorageInspector implements FileStorageInspector {
  async readObject(): Promise<null> {
    return null;
  }
}

export class SupabaseStorageInspector implements FileStorageInspector {
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly bucket: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: { supabaseUrl?: string; serviceRoleKey?: string; bucket?: string; fetchImpl?: typeof fetch } = {}) {
    this.supabaseUrl = normalizeSupabaseUrl(config.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    this.serviceRoleKey = requireConfigValue(config.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
    this.bucket = requireConfigValue(config.bucket ?? process.env.FILE_STORAGE_BUCKET, "FILE_STORAGE_BUCKET");
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async readObject(input: { storageProvider: FileStorageProvider; storageKey: string; maxBytes: number }): Promise<Uint8Array> {
    if (input.storageProvider !== "supabase_storage") {
      throw new Error("File inspection requires Supabase Storage.");
    }
    const response = await this.fetchImpl(`${this.supabaseUrl}/storage/v1/object/${encodeURIComponent(this.bucket)}/${encodeStoragePath(input.storageKey)}`, {
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        range: `bytes=0-${input.maxBytes}`
      }
    });
    if (!response.ok) {
      throw new Error(`Supabase Storage inspection failed with status ${response.status}.`);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > input.maxBytes) {
      throw new Error("Uploaded object exceeded its declared size during inspection.");
    }
    return bytes;
  }
}

type SupabaseSignedUploadResponse = {
  url?: unknown;
  signedURL?: unknown;
  signedUrl?: unknown;
};

type SupabaseSignedDownloadResponse = {
  url?: unknown;
  signedURL?: unknown;
  signedUrl?: unknown;
};

export class SupabaseStorageUploadPresigner implements FileUploadPresigner {
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly bucket: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: {
    supabaseUrl?: string;
    serviceRoleKey?: string;
    bucket?: string;
    fetchImpl?: typeof fetch;
  } = {}) {
    this.supabaseUrl = normalizeSupabaseUrl(config.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    this.serviceRoleKey = requireConfigValue(config.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
    this.bucket = requireConfigValue(config.bucket ?? process.env.FILE_STORAGE_BUCKET, "FILE_STORAGE_BUCKET");
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async createSignedUpload(input: {
    storageKey: string;
    contentType: string;
    sizeBytes: number;
    expiresAt: string;
  }): Promise<FileUploadPresignResult> {
    const response = await this.fetchImpl(`${this.supabaseUrl}/storage/v1/object/upload/sign/${encodeURIComponent(this.bucket)}/${encodeStoragePath(input.storageKey)}`, {
      method: "POST",
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        "content-type": "application/json",
        "x-upsert": "false"
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`Supabase Storage signed upload failed with status ${response.status}.`);
    }

    const body = await response.json() as SupabaseSignedUploadResponse;
    const signedPath = stringValue(body.url) ?? stringValue(body.signedURL) ?? stringValue(body.signedUrl);

    if (!signedPath) {
      throw new Error("Supabase Storage signed upload returned no URL.");
    }

    return {
      provider: "supabase_storage",
      method: "PUT",
      url: absolutizeStorageUrl(this.supabaseUrl, signedPath),
      expiresAt: input.expiresAt,
      headers: {
        "content-type": input.contentType,
        "x-webot-max-size": String(input.sizeBytes)
      }
    };
  }
}

export class SupabaseStorageDownloadSigner implements FileDownloadSigner {
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly bucket: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: {
    supabaseUrl?: string;
    serviceRoleKey?: string;
    bucket?: string;
    fetchImpl?: typeof fetch;
  } = {}) {
    this.supabaseUrl = normalizeSupabaseUrl(config.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    this.serviceRoleKey = requireConfigValue(config.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
    this.bucket = requireConfigValue(config.bucket ?? process.env.FILE_STORAGE_BUCKET, "FILE_STORAGE_BUCKET");
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async createSignedDownload(input: {
    storageProvider: FileStorageProvider;
    storageKey: string;
    expiresAt: string;
  }): Promise<FileDownloadSignResult> {
    if (input.storageProvider !== "supabase_storage") {
      throw new Error("Signed downloads require Supabase Storage.");
    }

    const expiresIn = Math.max(1, Math.floor((new Date(input.expiresAt).getTime() - Date.now()) / 1000));
    const response = await this.fetchImpl(`${this.supabaseUrl}/storage/v1/object/sign/${encodeURIComponent(this.bucket)}/${encodeStoragePath(input.storageKey)}`, {
      method: "POST",
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        expiresIn
      })
    });

    if (!response.ok) {
      throw new Error(`Supabase Storage signed download failed with status ${response.status}.`);
    }

    const body = await response.json() as SupabaseSignedDownloadResponse;
    const signedPath = stringValue(body.signedURL) ?? stringValue(body.signedUrl) ?? stringValue(body.url);

    if (!signedPath) {
      throw new Error("Supabase Storage signed download returned no URL.");
    }

    return {
      provider: "supabase_storage",
      method: "GET",
      url: absolutizeStorageUrl(this.supabaseUrl, signedPath),
      expiresAt: input.expiresAt
    };
  }
}

export class SupabaseStorageObjectRemover implements FileStorageRemover {
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly bucket: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: {
    supabaseUrl?: string;
    serviceRoleKey?: string;
    bucket?: string;
    fetchImpl?: typeof fetch;
  } = {}) {
    this.supabaseUrl = normalizeSupabaseUrl(config.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    this.serviceRoleKey = requireConfigValue(config.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
    this.bucket = requireConfigValue(config.bucket ?? process.env.FILE_STORAGE_BUCKET, "FILE_STORAGE_BUCKET");
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async removeObject(input: {
    storageProvider: FileStorageProvider;
    storageKey: string;
  }): Promise<void> {
    if (input.storageProvider !== "supabase_storage") {
      return undefined;
    }

    const response = await this.fetchImpl(`${this.supabaseUrl}/storage/v1/object/${encodeURIComponent(this.bucket)}/${encodeStoragePath(input.storageKey)}`, {
      method: "DELETE",
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`
      }
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Supabase Storage object delete failed with status ${response.status}.`);
    }
  }
}

export async function cleanupExpiredFiles(options: {
  repository?: FileRepository;
  storageRemover?: FileStorageRemover;
  now?: () => Date;
  limit?: number;
  dryRun?: boolean;
} = {}): Promise<FileCleanupResult> {
  const repository = options.repository ?? getFileRepository();
  const storageRemover = options.storageRemover ?? getFileStorageRemover();
  const now = (options.now ?? (() => new Date()))();
  const limit = normalizeCleanupLimit(options.limit);
  const expiredFiles = await repository.listExpired(now, limit);
  const result: FileCleanupResult = {
    scanned: expiredFiles.length,
    expired: 0,
    removed: 0,
    dryRun: Boolean(options.dryRun),
    failures: []
  };

  for (const file of expiredFiles) {
    try {
      if (options.dryRun) {
        continue;
      }

      if (file.status !== "expired") {
        await repository.updateStatus(file.id, "expired");
        result.expired += 1;
      }

      await storageRemover.removeObject({
        storageProvider: file.storageProvider,
        storageKey: file.storageKey
      });
      await repository.updateStatus(file.id, "removed");
      result.removed += 1;
    } catch (error) {
      result.failures.push({
        fileId: file.id,
        reason: error instanceof Error ? error.message : "Unknown cleanup error."
      });
    }
  }

  return result;
}

export async function listAccountJobFiles(
  context: AccountContext,
  jobId: string,
  options: {
    repository?: FileRepository;
  } = {}
): Promise<JobFileRow[]> {
  await getAccountJob(context, jobId);
  return (options.repository ?? getFileRepository()).listByJobId(context.account.id, jobId);
}

export async function listAccountFiles(
  context: AccountContext,
  options: {
    repository?: FileRepository;
  } = {}
): Promise<JobFileRow[]> {
  return (options.repository ?? getFileRepository()).listByAccountId(context.account.id);
}

export async function markAccountFileUploaded(
  context: AccountContext,
  fileId: string,
  options: {
    repository?: FileRepository;
    inspector?: FileStorageInspector;
    storageRemover?: FileStorageRemover;
  } = {}
): Promise<JobFileRow> {
  const repository = options.repository ?? getFileRepository();
  const file = await repository.getByAccountAndId(context.account.id, fileId);

  if (!file) {
    await reject(context, "account_file_missing");
    throw new Error("unreachable");
  }

  if (file.jobId) {
    await getAccountJob(context, file.jobId);
  }

  if (file.status === "removed" || file.status === "expired") {
    await reject(context, "validation_failed");
  }

  if (file.status === "uploaded" || file.status === "attached" || file.status === "delivered") {
    return file;
  }

  const bytes = await (options.inspector ?? getFileStorageInspector()).readObject({
    storageProvider: file.storageProvider,
    storageKey: file.storageKey,
    maxBytes: file.sizeBytes
  });
  if (bytes) {
    const detectedContentType = await detectUploadedContentType(bytes, file.contentType);
    if (bytes.byteLength !== file.sizeBytes || detectedContentType !== file.contentType) {
      await (options.storageRemover ?? getFileStorageRemover()).removeObject({
        storageProvider: file.storageProvider,
        storageKey: file.storageKey
      });
      await reject(context, "file_type_blocked", {
        submitted_content_type: boundedMetadataValue(file.contentType),
        detected_content_type: boundedMetadataValue(detectedContentType ?? "unknown"),
        file_extension: safeFileExtension(file.fileName)
      });
    }
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("Production upload inspection is not configured.");
  }

  return repository.updateStatus(file.id, "uploaded");
}

export async function createAccountFileDownload(
  context: AccountContext,
  fileId: string,
  options: {
    repository?: FileRepository;
    signer?: FileDownloadSigner;
    now?: () => Date;
  } = {}
): Promise<{
  file: JobFileRow;
  download: FileDownloadSignResult;
}> {
  const repository = options.repository ?? getFileRepository();
  const file = await repository.getByAccountAndId(context.account.id, fileId);

  if (!file) {
    await reject(context, "account_file_missing");
    throw new Error("unreachable");
  }

  const job = file.jobId ? await getAccountJob(context, file.jobId) : null;

  if (
    file.purpose !== "job_deliverable"
    || file.status !== "delivered"
    || !job
    || !isCustomerDeliveryVisible(job.status)
  ) {
    await reject(context, "validation_failed");
  }

  const nowDate = (options.now ?? (() => new Date()))();
  const expiresAt = new Date(nowDate.getTime() + 5 * 60 * 1000).toISOString();
  const download = await (options.signer ?? getFileDownloadSigner()).createSignedDownload({
    storageProvider: file.storageProvider,
    storageKey: file.storageKey,
    expiresAt
  });

  return {
    file,
    download
  };
}

export async function createPlaceholderPresign(
  context: AccountContext,
  input: PresignInput,
  options: PresignOptions = {}
): Promise<{
  file: JobFileRow;
  upload: {
    method: "PUT";
    url: string;
    expires_at: string;
    headers: Record<string, string>;
  };
}> {
  const normalized = await normalizeInput(context, input);
  const nowDate = (options.now ?? (() => new Date()))();
  const expiresAt = new Date(nowDate.getTime() + 15 * 60 * 1000).toISOString();
  const retentionExpiresAt = new Date(
    nowDate.getTime() + normalized.retentionDays * 24 * 60 * 60 * 1000
  ).toISOString();
  const fileId = randomUUID();
  const storageKey = `${context.account.id}/${normalized.jobId ?? "account"}/${fileId}/${normalized.fileName}`;
  const repository = options.repository ?? getFileRepository();
  const version = normalized.purpose === "job_deliverable" && normalized.jobId
    ? await nextDeliverableVersion(repository, context.account.id, normalized.jobId)
    : 1;
  const storage = options.storage ?? getFileUploadPresigner();
  const upload = await storage.createSignedUpload({
    storageKey,
    contentType: normalized.contentType,
    sizeBytes: normalized.sizeBytes,
    expiresAt
  });
  const file: JobFileRow = {
    id: fileId,
    accountId: context.account.id,
    jobId: normalized.jobId,
    intakeSessionId: normalized.intakeSessionId,
    purpose: normalized.purpose,
    fileName: normalized.fileName,
    contentType: normalized.contentType,
    sizeBytes: normalized.sizeBytes,
    storageProvider: upload.provider,
    storageKey,
    status: "pending_upload",
    version,
    retentionExpiresAt,
    createdAt: nowDate.toISOString()
  };
  const row = await repository.insert(file);

  return {
    file: row,
    upload: {
      method: upload.method,
      url: upload.url,
      expires_at: upload.expiresAt,
      headers: upload.headers
    }
  };
}

export function toSafeFile(file: JobFileRow): {
  id: string;
  account_id: string;
  job_id: string | null;
  intake_session_id: string | null;
  purpose: FilePurpose;
  file_name: string;
  content_type: string;
  size_bytes: number;
  status: JobFileStatus;
  version: number;
  option_index: number | null;
  option_label: string | null;
  retention_expires_at: string;
  created_at: string;
} {
  return {
    id: file.id,
    account_id: file.accountId,
    job_id: file.jobId,
    intake_session_id: file.intakeSessionId ?? null,
    purpose: file.purpose,
    file_name: file.fileName,
    content_type: file.contentType,
    size_bytes: file.sizeBytes,
    status: file.status,
    version: file.version,
    option_index: file.optionIndex ?? null,
    option_label: file.optionLabel ?? null,
    retention_expires_at: file.retentionExpiresAt,
    created_at: file.createdAt
  };
}

async function nextDeliverableVersion(repository: FileRepository, accountId: string, jobId: string): Promise<number> {
  const existing = await repository.listByJobId(accountId, jobId);
  const deliverables = existing.filter((row) => row.purpose === "job_deliverable");

  if (deliverables.length === 0) {
    return 1;
  }

  return Math.max(...deliverables.map((row) => row.version)) + 1;
}

async function normalizeInput(context: AccountContext, input: PresignInput): Promise<{
  purpose: FilePurpose;
  contentType: string;
  sizeBytes: number;
  fileName: string;
  jobId: string | null;
  intakeSessionId: string | null;
  retentionDays: number;
}> {
  const purpose = typeof input.purpose === "string" ? input.purpose.trim() : "";

  if (!allowedPurposes.has(purpose as FilePurpose)) {
    await reject(context, "file_purpose_invalid");
  }

  const submittedContentType = typeof input.content_type === "string" ? input.content_type.trim().toLowerCase() : "";
  const contentType = contentTypeAliases.get(submittedContentType) ?? submittedContentType;

  if (!allowedContentTypes.has(contentType)) {
    const submittedFileName = typeof input.file_name === "string" ? input.file_name.trim() : "";
    await reject(context, "file_type_blocked", {
      submitted_content_type: boundedMetadataValue(submittedContentType || "missing"),
      file_extension: safeFileExtension(submittedFileName)
    });
  }

  const sizeBytes = Number(input.size_bytes);

  if (!Number.isInteger(sizeBytes) || sizeBytes < 1) {
    await reject(context, "validation_failed");
  }

  if (sizeBytes > maxSizeBytes) {
    await reject(context, "file_size_exceeded");
  }

  const fileName = typeof input.file_name === "string" ? input.file_name.trim() : "";

  if (!/^[A-Za-z0-9][A-Za-z0-9._ -]{0,119}$/.test(fileName)) {
    await reject(context, "validation_failed");
  }

  const jobId = typeof input.job_id === "string" && input.job_id.trim() ? input.job_id.trim() : null;
  const intakeSessionId = typeof input.intake_session_id === "string" && input.intake_session_id.trim()
    ? input.intake_session_id.trim()
    : null;

  if (jobId && intakeSessionId) {
    await reject(context, "validation_failed");
  }

  if (jobId) {
    await getAccountJob(context, jobId);
  }

  const retentionDays = input.retention_days === undefined ? 7 : Number(input.retention_days);

  if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 30) {
    await reject(context, "validation_failed");
  }

  return {
    purpose: purpose as FilePurpose,
    contentType,
    sizeBytes,
    fileName,
    jobId,
    intakeSessionId,
    retentionDays
  };
}

async function reject(
  context: AccountContext,
  reason: ConstructorParameters<typeof SafeRejectError>[0],
  metadata: Record<string, string> = {}
): Promise<never> {
  await recordReject(context, reason, {
    source: "files_api",
    metadata
  });
  throw new SafeRejectError(reason);
}

function safeFileExtension(fileName: string): string {
  const match = /\.([A-Za-z0-9]{1,10})$/.exec(fileName);
  return match ? `.${match[1].toLowerCase()}` : "none";
}

function boundedMetadataValue(value: string): string {
  return value.slice(0, 160);
}

async function detectUploadedContentType(bytes: Uint8Array, expected: string): Promise<string | null> {
  if (["text/plain", "text/csv", "text/markdown", "application/json"].includes(expected)) {
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (/\0|[\u0001-\u0008\u000B\u000C\u000E-\u001F]/.test(text)) return null;
      if (expected === "application/json") JSON.parse(text);
      return expected;
    } catch {
      return null;
    }
  }
  const detected = await fileTypeFromBuffer(bytes);
  if (!detected) return null;
  if (expected === "application/vnd.ms-excel" && detected.mime === "application/x-cfb") return expected;
  return detected.mime;
}

function cloneRow(row: JobFileRow): JobFileRow {
  return {
    ...row,
    version: normalizeStoredVersion(row.version)
  };
}

function normalizeStoredVersion(value: number | undefined): number {
  return Number.isInteger(value) && (value as number) >= 1 ? (value as number) : 1;
}

function getLocalFileRepositoryFile(env: NodeJS.ProcessEnv = process.env): string | null {
  const configured = env.WEBOT_LOCAL_FILE_REPOSITORY_FILE?.trim();

  if (configured) {
    return configured;
  }

  if (env.NODE_ENV === "development" && env.WEBOT_DISABLE_LOCAL_FILE_REPOSITORY_FILE !== "true") {
    return ".next/webot-local-files.json";
  }

  return null;
}

function isFileExistsError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "EEXIST");
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function toSupabaseRow(row: JobFileRow): SupabaseJobFileRow {
  return {
    id: row.id,
    account_id: row.accountId,
    job_id: row.jobId,
    intake_session_id: row.intakeSessionId ?? null,
    purpose: row.purpose,
    file_name: row.fileName,
    content_type: row.contentType,
    size_bytes: row.sizeBytes,
    storage_provider: row.storageProvider,
    storage_key: row.storageKey,
    status: row.status,
    version: normalizeStoredVersion(row.version),
    option_index: row.optionIndex ?? null,
    option_label: row.optionLabel ?? null,
    retention_expires_at: row.retentionExpiresAt,
    created_at: row.createdAt
  };
}

function fromSupabaseRow(row: SupabaseJobFileRow): JobFileRow {
  return {
    id: row.id,
    accountId: row.account_id,
    jobId: row.job_id,
    intakeSessionId: row.intake_session_id,
    purpose: row.purpose,
    fileName: row.file_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    storageProvider: row.storage_provider,
    storageKey: row.storage_key,
    status: row.status,
    version: normalizeStoredVersion(row.version),
    optionIndex: row.option_index,
    optionLabel: row.option_label,
    retentionExpiresAt: row.retention_expires_at,
    createdAt: row.created_at
  };
}

function requireOne<Row>(rows: Row[], message: string): Row {
  const row = rows[0];

  if (!row) {
    throw new Error(message);
  }

  return row;
}

function isSupabaseStorageConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(isSupabaseRuntimeConfigured(env) && env.FILE_STORAGE_BUCKET);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function encodeStoragePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function absolutizeStorageUrl(supabaseUrl: string, signedPath: string): string {
  if (/^https?:\/\//i.test(signedPath)) {
    return signedPath;
  }

  if (signedPath.startsWith("/object/")) {
    return `${supabaseUrl}/storage/v1${signedPath}`;
  }

  return `${supabaseUrl}${signedPath.startsWith("/") ? "" : "/"}${signedPath}`;
}

function normalizeCleanupLimit(value: number | undefined): number {
  if (value === undefined) {
    return 100;
  }

  if (!Number.isInteger(value) || value < 1 || value > 1000) {
    throw new Error("Cleanup limit must be an integer between 1 and 1000.");
  }

  return value;
}
