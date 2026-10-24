import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { getFileRepository, type FileRepository, type JobFileRow } from "../files";
import { isSupabaseRuntimeConfigured, SupabaseRestClient } from "../db/supabase-rest";
import { SafeRejectError } from "../rejects";
import { getJobRepository, type JobRepository, type JobRow } from ".";

export type QaReviewerKind = "agent" | "human";
export type QaReviewResult = "pass" | "fail";

export type QaReviewCheck = {
  name: string;
  pass: boolean;
  notes: string | null;
};

export type JobQaReviewRow = {
  id: string;
  accountId: string;
  jobId: string;
  fileId: string | null;
  reviewerKind: QaReviewerKind;
  reviewerId: string;
  checks: QaReviewCheck[];
  result: QaReviewResult;
  notes: string | null;
  createdAt: string;
};

export type QaReviewRepository = {
  insert(row: JobQaReviewRow): Promise<JobQaReviewRow>;
  listByJobId(jobId: string): Promise<JobQaReviewRow[]>;
};

export type QaOptions = {
  repository?: QaReviewRepository;
  jobRepository?: JobRepository;
  fileRepository?: FileRepository;
  now?: () => Date;
};

export type RecordQaReviewInput = {
  reviewer_kind?: unknown;
  reviewer_id?: unknown;
  result?: unknown;
  checks?: unknown;
  notes?: unknown;
  file_id?: unknown;
};

// Media deliverables need a human listening/viewing review before the job can
// become customer-ready. Legacy media_convert stays on the list so the real
// TCL repair path can never ship on a machine pass alone.
const humanReviewFamilies = new Set(["voice_audio", "create_design", "music_audio", "media_convert"]);

const MAX_CHECKS = 40;

type QaRepositorySnapshot = {
  reviews: JobQaReviewRow[];
};

export class InMemoryQaReviewRepository implements QaReviewRepository {
  protected readonly reviews = new Map<string, JobQaReviewRow>();

  async insert(row: JobQaReviewRow): Promise<JobQaReviewRow> {
    this.reviews.set(row.id, cloneReview(row));
    return cloneReview(row);
  }

  async listByJobId(jobId: string): Promise<JobQaReviewRow[]> {
    // Stable sort: rows created in the same millisecond keep insertion order.
    return Array.from(this.reviews.values())
      .filter((row) => row.jobId === jobId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(cloneReview);
  }

  dumpRowsForTests(): JobQaReviewRow[] {
    return Array.from(this.reviews.values()).map(cloneReview);
  }

  protected snapshot(): QaRepositorySnapshot {
    return {
      reviews: Array.from(this.reviews.values()).map(cloneReview)
    };
  }

  protected loadSnapshot(snapshot: QaRepositorySnapshot): void {
    this.reviews.clear();

    for (const review of snapshot.reviews) {
      this.reviews.set(review.id, cloneReview(review));
    }
  }
}

export class LocalFileQaReviewRepository extends InMemoryQaReviewRepository {
  private readonly filePath: string;
  private readonly lockDir: string;

  constructor(filePath: string) {
    super();
    this.filePath = resolve(filePath);
    this.lockDir = `${this.filePath}.lock`;
    this.loadFromDisk();
  }

  override async insert(row: JobQaReviewRow): Promise<JobQaReviewRow> {
    return this.withWriteLock(async () => {
      this.loadFromDisk();
      const result = await super.insert(row);
      this.persistToDisk();
      return result;
    });
  }

  override async listByJobId(jobId: string): Promise<JobQaReviewRow[]> {
    this.loadFromDisk();
    return super.listByJobId(jobId);
  }

  private loadFromDisk(): void {
    if (!existsSync(this.filePath)) {
      return;
    }

    const parsed = JSON.parse(readFileSync(this.filePath, "utf8")) as Partial<QaRepositorySnapshot>;
    this.loadSnapshot({
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : []
    });
  }

  private persistToDisk(): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    writeFileSync(tempPath, `${JSON.stringify(this.snapshot(), null, 2)}\n`, { mode: 0o600 });
    renameSync(tempPath, this.filePath);
  }

  private async withWriteLock<T>(action: () => Promise<T>): Promise<T> {
    const startedAt = Date.now();

    while (true) {
      try {
        mkdirSync(this.lockDir, { mode: 0o700 });
        break;
      } catch (error) {
        if (Date.now() - startedAt > 5000) {
          throw error;
        }

        await sleep(25);
      }
    }

    try {
      return await action();
    } finally {
      rmSync(this.lockDir, { force: true, recursive: true });
    }
  }
}

type SupabaseQaReviewRow = {
  id: string;
  account_id: string;
  job_id: string;
  file_id: string | null;
  reviewer_kind: QaReviewerKind;
  reviewer_id: string;
  checks: QaReviewCheck[];
  result: QaReviewResult;
  notes: string | null;
  created_at: string;
};

const qaReviewSelect = [
  "id",
  "account_id",
  "job_id",
  "file_id",
  "reviewer_kind",
  "reviewer_id",
  "checks",
  "result",
  "notes",
  "created_at"
].join(",");

export class SupabaseQaReviewRepository implements QaReviewRepository {
  private readonly client: SupabaseRestClient;

  constructor(client: SupabaseRestClient = SupabaseRestClient.fromEnv()) {
    this.client = client;
  }

  async insert(row: JobQaReviewRow): Promise<JobQaReviewRow> {
    const rows = await this.client.insert<SupabaseQaReviewRow>("app_public", "job_qa_reviews", toSupabaseReviewRow(row));
    return fromSupabaseReviewRow(requireOne(rows, "QA review insert returned no row."));
  }

  async listByJobId(jobId: string): Promise<JobQaReviewRow[]> {
    const rows = await this.client.get<SupabaseQaReviewRow>("app_public", "job_qa_reviews", {
      select: qaReviewSelect,
      job_id: `eq.${jobId}`,
      order: "created_at.asc"
    });
    return rows.map(fromSupabaseReviewRow);
  }
}

let defaultRepository: QaReviewRepository | null = null;

export function getQaReviewRepository(): QaReviewRepository {
  if (!defaultRepository) {
    const localRepositoryFile = getLocalQaRepositoryFile();
    defaultRepository = isSupabaseRuntimeConfigured()
      ? new SupabaseQaReviewRepository()
      : localRepositoryFile
        ? new LocalFileQaReviewRepository(localRepositoryFile)
        : new InMemoryQaReviewRepository();
  }

  return defaultRepository;
}

export function resetQaReviewRepositoryForTests(repository: QaReviewRepository = new InMemoryQaReviewRepository()): void {
  defaultRepository = repository;
}

export async function recordQaReview(
  jobId: string,
  input: RecordQaReviewInput,
  options: QaOptions = {}
): Promise<JobQaReviewRow> {
  const repository = options.repository ?? getQaReviewRepository();
  const job = await requireJob(jobId, options);
  const reviewerKind = normalizeReviewerKind(input.reviewer_kind);
  const reviewerId = normalizeBoundedText(input.reviewer_id, 1, 120);
  const result = normalizeResult(input.result);
  const checks = normalizeChecks(input.checks, result);
  const notes = normalizeOptionalText(input.notes, 2000);
  const file = await resolveReviewedFile(job, input.file_id, options);

  if (!file) {
    throw new SafeRejectError("qa_deliverable_missing", job.id);
  }

  const now = (options.now ?? (() => new Date()))().toISOString();

  return repository.insert({
    id: randomUUID(),
    accountId: job.accountId,
    jobId: job.id,
    fileId: file.id,
    reviewerKind,
    reviewerId,
    checks,
    result,
    notes,
    createdAt: now
  });
}

export async function listQaReviews(jobId: string, options: QaOptions = {}): Promise<JobQaReviewRow[]> {
  return (options.repository ?? getQaReviewRepository()).listByJobId(jobId);
}

export async function getLatestDeliverable(jobId: string, options: QaOptions = {}): Promise<JobFileRow | null> {
  return (await getLatestDeliverables(jobId, options))[0] ?? null;
}

export async function getLatestDeliverables(jobId: string, options: QaOptions = {}): Promise<JobFileRow[]> {
  const job = await requireJob(jobId, options);
  const files = await (options.fileRepository ?? getFileRepository()).listByJobId(job.accountId, job.id);
  const deliverables = files
    .filter((file) => file.purpose === "job_deliverable" && file.status !== "removed" && file.status !== "expired")
    .sort((left, right) => right.version - left.version || right.createdAt.localeCompare(left.createdAt));
  const version = deliverables[0]?.version;
  if (version == null) return [];
  return deliverables
    .filter((file) => file.version === version)
    .sort((left, right) => (left.optionIndex ?? 0) - (right.optionIndex ?? 0) || left.createdAt.localeCompare(right.createdAt));
}

export type CustomerReviewGateDecision =
  | { allowed: true }
  | { allowed: false; redirectToStudioReview: false; reason: "qa_deliverable_missing" | "qa_review_missing_or_failed" }
  | { allowed: false; redirectToStudioReview: true };

// The gate that keeps a bad or unreviewed artifact from ever becoming
// customer-ready: the latest deliverable must carry a passing QA review, the
// most recent review must not be a fail, and media deliverables additionally
// need a passing human review. A machine-pass-only media job is redirected to
// studio (human) review instead of customer review.
export async function evaluateCustomerReviewGate(job: JobRow, options: QaOptions = {}): Promise<CustomerReviewGateDecision> {
  const latest = await getLatestDeliverables(job.id, options);

  if (latest.length === 0) {
    return { allowed: false, redirectToStudioReview: false, reason: "qa_deliverable_missing" };
  }

  const optionFiles = latest.filter((file) => file.optionIndex != null);
  if (optionFiles.length > 0 && !isCompleteOptionSet(latest)) {
    return { allowed: false, redirectToStudioReview: false, reason: "qa_review_missing_or_failed" };
  }

  const allReviews = await listQaReviews(job.id, options);
  let needsHuman = false;

  for (const file of latest) {
    const reviews = allReviews.filter((review) => review.fileId === file.id);
    const latestReview = reviews.at(-1) ?? null;
    const latestAgent = reviews.filter((review) => review.reviewerKind === "agent").at(-1) ?? null;
    if (!latestReview || latestReview.result === "fail" || latestAgent?.result !== "pass") {
      return { allowed: false, redirectToStudioReview: false, reason: "qa_review_missing_or_failed" };
    }

    if (requiresHumanQaReview(job.serviceFamily)) {
      const latestHuman = reviews.filter((review) => review.reviewerKind === "human").at(-1) ?? null;

      if (!latestHuman) {
        needsHuman = true;
        continue;
      }

      if (latestHuman.result !== "pass") {
        return { allowed: false, redirectToStudioReview: false, reason: "qa_review_missing_or_failed" };
      }
    }
  }

  if (needsHuman) return { allowed: false, redirectToStudioReview: true };

  return { allowed: true };
}

export function isCompleteOptionSet(files: JobFileRow[]): boolean {
  if (files.length !== 3 && files.length !== 4) return false;
  return files.every((file, index) => file.optionIndex === index + 1);
}

export function requiresHumanQaReview(serviceFamily: string): boolean {
  return humanReviewFamilies.has(serviceFamily);
}

export function toSafeQaReview(review: JobQaReviewRow): {
  id: string;
  job_id: string;
  file_id: string | null;
  reviewer_kind: QaReviewerKind;
  reviewer_id: string;
  checks: QaReviewCheck[];
  result: QaReviewResult;
  notes: string | null;
  created_at: string;
} {
  return {
    id: review.id,
    job_id: review.jobId,
    file_id: review.fileId,
    reviewer_kind: review.reviewerKind,
    reviewer_id: review.reviewerId,
    checks: review.checks.map((check) => ({ ...check })),
    result: review.result,
    notes: review.notes,
    created_at: review.createdAt
  };
}

async function requireJob(jobId: string, options: QaOptions): Promise<JobRow> {
  const job = await (options.jobRepository ?? getJobRepository()).findJobById(jobId);

  if (!job) {
    throw new SafeRejectError("account_job_missing", jobId);
  }

  return job;
}

async function resolveReviewedFile(job: JobRow, fileIdInput: unknown, options: QaOptions): Promise<JobFileRow | null> {
  if (fileIdInput === undefined || fileIdInput === null || fileIdInput === "") {
    return getLatestDeliverable(job.id, options);
  }

  if (typeof fileIdInput !== "string" || !fileIdInput.trim()) {
    throw new SafeRejectError("validation_failed", job.id);
  }

  const file = await (options.fileRepository ?? getFileRepository()).getByAccountAndId(job.accountId, fileIdInput.trim());

  if (!file || file.jobId !== job.id || file.purpose !== "job_deliverable") {
    throw new SafeRejectError("validation_failed", job.id);
  }

  return file;
}

function normalizeReviewerKind(value: unknown): QaReviewerKind {
  if (value !== "agent" && value !== "human") {
    throw new SafeRejectError("validation_failed");
  }

  return value;
}

function normalizeResult(value: unknown): QaReviewResult {
  if (value !== "pass" && value !== "fail") {
    throw new SafeRejectError("validation_failed");
  }

  return value;
}

function normalizeChecks(value: unknown, result: QaReviewResult): QaReviewCheck[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value) || value.length > MAX_CHECKS) {
    throw new SafeRejectError("validation_failed");
  }

  const checks = value.map((candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new SafeRejectError("validation_failed");
    }

    const record = candidate as Record<string, unknown>;

    if (typeof record.pass !== "boolean") {
      throw new SafeRejectError("validation_failed");
    }

    return {
      name: normalizeBoundedText(record.name, 1, 120),
      pass: record.pass,
      notes: normalizeOptionalText(record.notes, 500)
    };
  });

  // A pass verdict cannot carry failing checks; that combination is exactly
  // how an unreviewed defect would slip through the gate.
  if (result === "pass" && checks.some((check) => !check.pass)) {
    throw new SafeRejectError("validation_failed");
  }

  return checks;
}

function normalizeBoundedText(value: unknown, minLength: number, maxLength: number): string {
  if (typeof value !== "string") {
    throw new SafeRejectError("validation_failed");
  }

  const normalized = value.trim();

  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new SafeRejectError("validation_failed");
  }

  return normalized;
}

function normalizeOptionalText(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string" || value.trim().length > maxLength) {
    throw new SafeRejectError("validation_failed");
  }

  return value.trim() || null;
}

function cloneReview(row: JobQaReviewRow): JobQaReviewRow {
  return {
    ...row,
    checks: row.checks.map((check) => ({ ...check }))
  };
}

function toSupabaseReviewRow(row: JobQaReviewRow): SupabaseQaReviewRow {
  return {
    id: row.id,
    account_id: row.accountId,
    job_id: row.jobId,
    file_id: row.fileId,
    reviewer_kind: row.reviewerKind,
    reviewer_id: row.reviewerId,
    checks: row.checks.map((check) => ({ ...check })),
    result: row.result,
    notes: row.notes,
    created_at: row.createdAt
  };
}

function fromSupabaseReviewRow(row: SupabaseQaReviewRow): JobQaReviewRow {
  return {
    id: row.id,
    accountId: row.account_id,
    jobId: row.job_id,
    fileId: row.file_id,
    reviewerKind: row.reviewer_kind,
    reviewerId: row.reviewer_id,
    checks: Array.isArray(row.checks) ? row.checks.map((check) => ({ ...check })) : [],
    result: row.result,
    notes: row.notes,
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

function getLocalQaRepositoryFile(env: NodeJS.ProcessEnv = process.env): string | null {
  const configured = env.WEBOT_LOCAL_QA_REPOSITORY_FILE?.trim();

  if (configured) {
    return configured;
  }

  if (env.NODE_ENV === "development" && env.WEBOT_DISABLE_LOCAL_QA_REPOSITORY_FILE !== "true") {
    return ".next/webot-local-qa-reviews.json";
  }

  return null;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}
