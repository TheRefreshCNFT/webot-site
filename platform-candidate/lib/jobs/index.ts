import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import type { AccountContext } from "../auth/account";
import type { EntitlementRow, ServerDb } from "../db/server";
import { getServerDb } from "../db/server";
import { isSupabaseRuntimeConfigured, SupabaseRestClient } from "../db/supabase-rest";
import { recordReject, SafeRejectError } from "../rejects";
import { enforceConcurrency } from "../rate-limit/concurrency";
import {
  checkRateLimit,
  recordRateLimitEvent,
  type RateLimitEventRepository,
  type RateLimitPolicy
} from "../rate-limit";
import { recordUsage, type UsageLedgerRepository } from "../usage/ledger";
import { getAccountUsageSummary } from "../usage/quotas";
import { listGatedEntitlementRowsByAccountId } from "../entitlements";
import { findServiceOption, serviceFamilies } from "./catalog";
import { isLegacyServiceFamily } from "./legacy-catalog";
import { evaluateCustomerReviewGate, type QaReviewRepository } from "./qa";
import { recordJobFeedback, type JobFeedbackRepository } from "./feedback";
import type { FileRepository } from "../files";
import type { IntentBrief } from "../intake/brief";

export type JobStatus =
  | "queued"
  | "accepted"
  | "running"
  | "needs_review"
  | "ready_for_customer_review"
  | "completed"
  | "rejected"
  | "canceled";

const customerVisibleDeliveryStatuses = new Set<JobStatus>([
  "ready_for_customer_review",
  "completed"
]);

export function isCustomerDeliveryVisible(status: JobStatus): boolean {
  return customerVisibleDeliveryStatuses.has(status);
}

export type JobRow = {
  id: string;
  accountId: string;
  createdByUserId: string;
  apiKeyId: string | null;
  serviceFamily: string;
  serviceType: string;
  status: JobStatus;
  customerTitle: string;
  customerInstructions: string;
  idempotencyKey: string | null;
  entitlementSnapshot: EntitlementSnapshot;
  rejectCode: string | null;
  intentBrief?: IntentBrief | null;
  intakeSessionId?: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
};

export type JobEventType = JobStatus | "revision_requested";

export type JobEventRow = {
  id: string;
  accountId: string;
  jobId: string;
  eventType: JobEventType;
  customerSafeMessage: string;
  metadata: Record<string, string | number | boolean | null>;
  createdBy: "customer" | "system";
  idempotencyKey: string | null;
  createdAt: string;
};

export type EntitlementSnapshot = {
  entitlement_code: string;
  tier_family: string;
  tier_level: number;
  monthly_quota: number;
  api_access: boolean;
  dashboard_access: boolean;
  current_period_end: string;
};

export type CreateJobInput = {
  service_family?: unknown;
  service_type?: unknown;
  customer_title?: unknown;
  customer_instructions?: unknown;
  file_ids?: unknown;
  idempotency_key?: unknown;
};

export type ListJobsInput = {
  status?: unknown;
  service_family?: unknown;
  created_after?: unknown;
  created_before?: unknown;
  cursor?: unknown;
  limit?: unknown;
};

export type JobListFilters = {
  statuses: JobStatus[];
  serviceFamily: string | null;
  createdAfter: string | null;
  createdBefore: string | null;
  cursor: JobListCursor | null;
  limit: number;
};

export type JobListCursor = {
  createdAt: string;
  id: string;
};

export type JobRepository = {
  createJob(row: JobRow, initialEvent: JobEventRow): Promise<{ job: JobRow; inserted: boolean }>;
  findJobById(id: string): Promise<JobRow | null>;
  listJobsForAccount(accountId: string, filters: JobListFilters): Promise<JobRow[]>;
  findJobByIdForAccount(id: string, accountId: string): Promise<JobRow | null>;
  countActiveJobsForAccount(accountId: string, statuses: JobStatus[]): Promise<number>;
  listJobsByStatuses(statuses: JobStatus[], limit: number): Promise<JobRow[]>;
  listEventsByJobIdForAccount(jobId: string, accountId: string): Promise<JobEventRow[]>;
  listRecentEventsForAccount(accountId: string, limit: number): Promise<JobEventRow[]>;
  appendEvent(event: JobEventRow): Promise<{ event: JobEventRow; inserted: boolean }>;
  updateJob(row: JobRow): Promise<JobRow>;
};

export type JobOptions = {
  repository?: JobRepository;
  usageRepository?: UsageLedgerRepository;
  rateLimitEventRepository?: RateLimitEventRepository;
  rateLimitPolicy?: RateLimitPolicy;
  qaRepository?: QaReviewRepository;
  feedbackRepository?: JobFeedbackRepository;
  fileRepository?: FileRepository;
  db?: ServerDb;
  now?: () => Date;
};

export type FulfillmentTransitionInput = {
  id: string;
  status: unknown;
  message?: unknown;
  metadata?: unknown;
  idempotencyKey?: string | null;
  reopenCompleted?: unknown;
  reopenReason?: unknown;
  reopenOperator?: unknown;
};

const terminalStatuses = new Set<JobStatus>(["completed", "rejected", "canceled"]);
const allJobStatuses: JobStatus[] = [
  "queued",
  "accepted",
  "running",
  "needs_review",
  "ready_for_customer_review",
  "completed",
  "rejected",
  "canceled"
];
const allJobStatusSet = new Set<JobStatus>(allJobStatuses);
const internalTransitionTargets = new Set<JobStatus>([
  "accepted",
  "running",
  "needs_review",
  "ready_for_customer_review",
  "rejected",
  "canceled"
]);
const allowedInternalTransitions: Record<JobStatus, JobStatus[]> = {
  queued: ["accepted", "rejected", "canceled"],
  accepted: ["running", "needs_review", "ready_for_customer_review", "rejected", "canceled"],
  running: ["needs_review", "ready_for_customer_review", "rejected", "canceled"],
  needs_review: ["running", "ready_for_customer_review", "rejected", "canceled"],
  ready_for_customer_review: ["running", "needs_review", "rejected", "canceled"],
  completed: [],
  rejected: [],
  canceled: []
};
const blockedSafeEventMetadataKeyFragments = [
  "profile",
  "capability",
  "model",
  "runtime",
  "vendor",
  "prompt",
  "queue",
  "handoff",
  "implementation",
  "worker",
  "reviewrequirement"
];
const blockedSafeEventMetadataValues = new Set([
  "pending_model_selection",
  "selected_private_runtime",
  "gpt-oss:20b",
  "qwen3-vl:8b",
  "qwen3-coder:tuned",
  "qwen3.6-35b-a3b-max:latest",
  "DeepSeek-R1-Distill-Qwen-32B",
  "GLM-4.5-Air",
  "Devstral-Small-2-24B-Instruct",
  "FLUX.2-klein-4B",
  "Qwen-Image-Edit",
  "PaddleOCR-VL-1.6",
  "dots.ocr",
  "whisper-large-v3-turbo",
  "parakeet-tdt-0.6b-v3",
  "bge-m3:latest",
  "bge-reranker-v2-m3",
  "ModernBERT-base-nli",
  "human_review_required",
  "specialist_review_required",
  "customer_safe_status_only",
  "no_runtime_details_in_events",
  "source_material_checked_before_processing",
  "deliverables_reviewed_before_customer_ready",
  "content_and_design",
  "research_and_extraction",
  "media_preparation",
  "technical_delivery",
  "growth_planning",
  "decision_support",
  "career_preparation",
  "logistics_planning",
  "visual_and_creative",
  "documents_and_data",
  "research_and_briefs",
  "voice_and_audio",
  "Kokoro (mlx-audio)",
  "F5-TTS MLX",
  "whisper-cpp",
  "ComfyUI",
  "mflux",
  "Real-ESRGAN",
  "tesseract",
  "Poppler",
  "Scrapling",
  "DuckDB",
  "FFmpeg"
]);

type JobRepositorySnapshot = {
  jobs: JobRow[];
  events: JobEventRow[];
};

export class InMemoryJobRepository implements JobRepository {
  protected readonly jobs = new Map<string, JobRow>();
  protected readonly events = new Map<string, JobEventRow>();
  protected readonly jobIdempotencyIndex = new Map<string, string>();
  protected readonly eventIdempotencyIndex = new Map<string, string>();

  async createJob(row: JobRow, initialEvent: JobEventRow): Promise<{ job: JobRow; inserted: boolean }> {
    const idempotencyKey = row.idempotencyKey ? createAccountIndexKey(row.accountId, row.idempotencyKey) : null;
    const existingId = idempotencyKey ? this.jobIdempotencyIndex.get(idempotencyKey) : null;
    const existing = existingId ? this.jobs.get(existingId) : null;

    if (existing) {
      return {
        job: cloneJob(existing),
        inserted: false
      };
    }

    this.jobs.set(row.id, cloneJob(row));
    this.events.set(initialEvent.id, cloneEvent(initialEvent));

    if (idempotencyKey) {
      this.jobIdempotencyIndex.set(idempotencyKey, row.id);
    }

    if (initialEvent.idempotencyKey) {
      this.eventIdempotencyIndex.set(createAccountIndexKey(row.accountId, initialEvent.idempotencyKey), initialEvent.id);
    }

    return {
      job: cloneJob(row),
      inserted: true
    };
  }

  async findJobByIdForAccount(id: string, accountId: string): Promise<JobRow | null> {
    const row = this.jobs.get(id);
    return row && row.accountId === accountId ? cloneJob(row) : null;
  }

  async findJobById(id: string): Promise<JobRow | null> {
    const row = this.jobs.get(id);
    return row ? cloneJob(row) : null;
  }

  async listJobsForAccount(accountId: string, filters: JobListFilters): Promise<JobRow[]> {
    return Array.from(this.jobs.values())
      .filter((row) => row.accountId === accountId)
      .filter((row) => matchesJobFilters(row, filters))
      .sort(compareJobsForList)
      .slice(0, filters.limit + 1)
      .map(cloneJob);
  }

  async countActiveJobsForAccount(accountId: string, statuses: JobStatus[]): Promise<number> {
    const activeStatuses = new Set(statuses);

    return Array.from(this.jobs.values()).filter((row) => row.accountId === accountId && activeStatuses.has(row.status)).length;
  }

  async listJobsByStatuses(statuses: JobStatus[], limit: number): Promise<JobRow[]> {
    const wanted = new Set(statuses);

    return Array.from(this.jobs.values())
      .filter((row) => wanted.has(row.status))
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
      .slice(0, limit)
      .map(cloneJob);
  }

  async listEventsByJobIdForAccount(jobId: string, accountId: string): Promise<JobEventRow[]> {
    return Array.from(this.events.values())
      .filter((event) => event.accountId === accountId && event.jobId === jobId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(cloneEvent);
  }

  async listRecentEventsForAccount(accountId: string, limit: number): Promise<JobEventRow[]> {
    return Array.from(this.events.values())
      .filter((event) => event.accountId === accountId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit)
      .map(cloneEvent);
  }

  async appendEvent(event: JobEventRow): Promise<{ event: JobEventRow; inserted: boolean }> {
    const idempotencyKey = event.idempotencyKey ? createAccountIndexKey(event.accountId, event.idempotencyKey) : null;
    const existingId = idempotencyKey ? this.eventIdempotencyIndex.get(idempotencyKey) : null;
    const existing = existingId ? this.events.get(existingId) : null;

    if (existing) {
      return {
        event: cloneEvent(existing),
        inserted: false
      };
    }

    this.events.set(event.id, cloneEvent(event));

    if (idempotencyKey) {
      this.eventIdempotencyIndex.set(idempotencyKey, event.id);
    }

    return {
      event: cloneEvent(event),
      inserted: true
    };
  }

  async updateJob(row: JobRow): Promise<JobRow> {
    this.jobs.set(row.id, cloneJob(row));
    return cloneJob(row);
  }

  dumpJobsForTests(): JobRow[] {
    return Array.from(this.jobs.values()).map(cloneJob);
  }

  protected snapshot(): JobRepositorySnapshot {
    return {
      jobs: Array.from(this.jobs.values()).map(cloneJob),
      events: Array.from(this.events.values()).map(cloneEvent)
    };
  }

  protected loadSnapshot(snapshot: JobRepositorySnapshot): void {
    this.jobs.clear();
    this.events.clear();
    this.jobIdempotencyIndex.clear();
    this.eventIdempotencyIndex.clear();

    for (const job of snapshot.jobs) {
      this.jobs.set(job.id, cloneJob(job));

      if (job.idempotencyKey) {
        this.jobIdempotencyIndex.set(createAccountIndexKey(job.accountId, job.idempotencyKey), job.id);
      }
    }

    for (const event of snapshot.events) {
      this.events.set(event.id, cloneEvent(event));

      if (event.idempotencyKey) {
        this.eventIdempotencyIndex.set(createAccountIndexKey(event.accountId, event.idempotencyKey), event.id);
      }
    }
  }
}

export class LocalFileJobRepository extends InMemoryJobRepository {
  private readonly filePath: string;
  private readonly lockDir: string;

  constructor(filePath: string) {
    super();
    this.filePath = resolve(filePath);
    this.lockDir = `${this.filePath}.lock`;
    this.loadFromDisk();
  }

  override async createJob(row: JobRow, initialEvent: JobEventRow): Promise<{ job: JobRow; inserted: boolean }> {
    return this.withWriteLock(async () => {
      this.loadFromDisk();
      const result = await super.createJob(row, initialEvent);

      if (result.inserted) {
        this.persistToDisk();
      }

      return result;
    });
  }

  override async findJobByIdForAccount(id: string, accountId: string): Promise<JobRow | null> {
    this.loadFromDisk();
    return super.findJobByIdForAccount(id, accountId);
  }

  override async findJobById(id: string): Promise<JobRow | null> {
    this.loadFromDisk();
    return super.findJobById(id);
  }

  override async listJobsForAccount(accountId: string, filters: JobListFilters): Promise<JobRow[]> {
    this.loadFromDisk();
    return super.listJobsForAccount(accountId, filters);
  }

  override async countActiveJobsForAccount(accountId: string, statuses: JobStatus[]): Promise<number> {
    this.loadFromDisk();
    return super.countActiveJobsForAccount(accountId, statuses);
  }

  override async listJobsByStatuses(statuses: JobStatus[], limit: number): Promise<JobRow[]> {
    this.loadFromDisk();
    return super.listJobsByStatuses(statuses, limit);
  }

  override async listEventsByJobIdForAccount(jobId: string, accountId: string): Promise<JobEventRow[]> {
    this.loadFromDisk();
    return super.listEventsByJobIdForAccount(jobId, accountId);
  }

  override async listRecentEventsForAccount(accountId: string, limit: number): Promise<JobEventRow[]> {
    this.loadFromDisk();
    return super.listRecentEventsForAccount(accountId, limit);
  }

  override async appendEvent(event: JobEventRow): Promise<{ event: JobEventRow; inserted: boolean }> {
    return this.withWriteLock(async () => {
      this.loadFromDisk();
      const result = await super.appendEvent(event);

      if (result.inserted) {
        this.persistToDisk();
      }

      return result;
    });
  }

  override async updateJob(row: JobRow): Promise<JobRow> {
    return this.withWriteLock(async () => {
      this.loadFromDisk();
      const result = await super.updateJob(row);
      this.persistToDisk();
      return result;
    });
  }

  private loadFromDisk(): void {
    if (!existsSync(this.filePath)) {
      return;
    }

    const parsed = JSON.parse(readFileSync(this.filePath, "utf8")) as Partial<JobRepositorySnapshot>;
    this.loadSnapshot({
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
      events: Array.isArray(parsed.events) ? parsed.events : []
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

type SupabaseJobRow = {
  id: string;
  account_id: string;
  created_by_user_id: string | null;
  api_key_id: string | null;
  service_family: string;
  service_type: string;
  status: JobStatus;
  customer_title: string;
  customer_instructions: string;
  idempotency_key: string | null;
  entitlement_snapshot: EntitlementSnapshot;
  reject_code: string | null;
  intent_brief: IntentBrief | null;
  intake_session_id: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  completed_at: string | null;
};

type SupabaseJobEventRow = {
  id: string;
  account_id: string;
  job_id: string;
  event_type: JobEventType;
  customer_safe_message: string;
  metadata: Record<string, string | number | boolean | null>;
  created_by: "customer" | "system";
  idempotency_key: string | null;
  created_at: string;
};

export class SupabaseJobRepository implements JobRepository {
  private readonly client: SupabaseRestClient;

  constructor(client: SupabaseRestClient = SupabaseRestClient.fromEnv()) {
    this.client = client;
  }

  async createJob(row: JobRow, initialEvent: JobEventRow): Promise<{ job: JobRow; inserted: boolean }> {
    const queryOptions = row.idempotencyKey
      ? { onConflict: "account_id,idempotency_key", ignoreDuplicates: true }
      : {};
    const inserted = await this.client.insert<SupabaseJobRow>("app_public", "jobs", toSupabaseJobRow(row), queryOptions);

    if (inserted[0]) {
      await this.client.insert<SupabaseJobEventRow>("app_public", "job_events", toSupabaseEventRow(initialEvent), initialEvent.idempotencyKey
        ? { onConflict: "account_id,idempotency_key", ignoreDuplicates: true }
        : {});

      return {
        job: fromSupabaseJobRow(inserted[0]),
        inserted: true
      };
    }

    const existing = row.idempotencyKey
      ? await this.client.get<SupabaseJobRow>("app_public", "jobs", {
          select: jobSelect,
          account_id: `eq.${row.accountId}`,
          idempotency_key: `eq.${row.idempotencyKey}`,
          limit: "1"
        })
      : [];

    return {
      job: fromSupabaseJobRow(requireOne(existing, "Job idempotency row was not found.")),
      inserted: false
    };
  }

  async findJobByIdForAccount(id: string, accountId: string): Promise<JobRow | null> {
    const rows = await this.client.get<SupabaseJobRow>("app_public", "jobs", {
      select: jobSelect,
      id: `eq.${id}`,
      account_id: `eq.${accountId}`,
      limit: "1"
    });
    return rows[0] ? fromSupabaseJobRow(rows[0]) : null;
  }

  async findJobById(id: string): Promise<JobRow | null> {
    const rows = await this.client.get<SupabaseJobRow>("app_public", "jobs", {
      select: jobSelect,
      id: `eq.${id}`,
      limit: "1"
    });
    return rows[0] ? fromSupabaseJobRow(rows[0]) : null;
  }

  async listJobsForAccount(accountId: string, filters: JobListFilters): Promise<JobRow[]> {
    const query: Record<string, string> = {
      select: jobSelect,
      account_id: `eq.${accountId}`,
      order: "created_at.desc,id.desc",
      limit: String(filters.limit + 1)
    };

    if (filters.statuses.length > 0) {
      query.status = `in.(${filters.statuses.join(",")})`;
    }

    if (filters.serviceFamily) {
      query.service_family = `eq.${filters.serviceFamily}`;
    }

    const createdAfter = maxIsoString(filters.createdAfter, null);
    const upperBound = minIsoString(filters.createdBefore, filters.cursor?.createdAt ?? null);

    if (createdAfter && upperBound) {
      query.and = `(created_at.gte.${createdAfter},created_at.lte.${upperBound})`;
    } else if (createdAfter) {
      query.created_at = `gte.${createdAfter}`;
    } else if (upperBound) {
      query.created_at = `lte.${upperBound}`;
    }

    const rows = await this.client.get<SupabaseJobRow>("app_public", "jobs", query);
    return rows.map(fromSupabaseJobRow)
      .filter((row) => matchesJobFilters(row, filters))
      .sort(compareJobsForList)
      .slice(0, filters.limit + 1);
  }

  async countActiveJobsForAccount(accountId: string, statuses: JobStatus[]): Promise<number> {
    const rows = await this.client.get<{ count: number }>("app_public", "jobs", {
      select: "id",
      account_id: `eq.${accountId}`,
      status: `in.(${statuses.join(",")})`
    });
    return rows.length;
  }

  async listJobsByStatuses(statuses: JobStatus[], limit: number): Promise<JobRow[]> {
    if (statuses.length === 0) {
      return [];
    }

    const rows = await this.client.get<SupabaseJobRow>("app_public", "jobs", {
      select: jobSelect,
      status: `in.(${statuses.join(",")})`,
      order: "created_at.asc,id.asc",
      limit: String(limit)
    });
    return rows.map(fromSupabaseJobRow);
  }

  async listEventsByJobIdForAccount(jobId: string, accountId: string): Promise<JobEventRow[]> {
    const rows = await this.client.get<SupabaseJobEventRow>("app_public", "job_events", {
      select: jobEventSelect,
      job_id: `eq.${jobId}`,
      account_id: `eq.${accountId}`,
      order: "created_at.asc"
    });
    return rows.map(fromSupabaseEventRow);
  }

  async listRecentEventsForAccount(accountId: string, limit: number): Promise<JobEventRow[]> {
    const rows = await this.client.get<SupabaseJobEventRow>("app_public", "job_events", {
      select: jobEventSelect,
      account_id: `eq.${accountId}`,
      order: "created_at.desc",
      limit: String(limit)
    });
    return rows.map(fromSupabaseEventRow);
  }

  async appendEvent(event: JobEventRow): Promise<{ event: JobEventRow; inserted: boolean }> {
    const inserted = await this.client.insert<SupabaseJobEventRow>("app_public", "job_events", toSupabaseEventRow(event), event.idempotencyKey
      ? { onConflict: "account_id,idempotency_key", ignoreDuplicates: true }
      : {});

    if (inserted[0]) {
      return {
        event: fromSupabaseEventRow(inserted[0]),
        inserted: true
      };
    }

    const existing = event.idempotencyKey
      ? await this.client.get<SupabaseJobEventRow>("app_public", "job_events", {
          select: jobEventSelect,
          account_id: `eq.${event.accountId}`,
          idempotency_key: `eq.${event.idempotencyKey}`,
          limit: "1"
        })
      : [];

    return {
      event: fromSupabaseEventRow(requireOne(existing, "Job event idempotency row was not found.")),
      inserted: false
    };
  }

  async updateJob(row: JobRow): Promise<JobRow> {
    const rows = await this.client.update<SupabaseJobRow>("app_public", "jobs", {
      id: `eq.${row.id}`,
      account_id: `eq.${row.accountId}`
    }, toSupabaseJobRow(row));

    return fromSupabaseJobRow(requireOne(rows, "Job update returned no row."));
  }
}

const jobSelect = [
  "id",
  "account_id",
  "created_by_user_id",
  "api_key_id",
  "service_family",
  "service_type",
  "status",
  "customer_title",
  "customer_instructions",
  "idempotency_key",
  "entitlement_snapshot",
  "reject_code",
  "intent_brief",
  "intake_session_id",
  "created_at",
  "updated_at",
  "cancelled_at",
  "completed_at"
].join(",");
const jobEventSelect = [
  "id",
  "account_id",
  "job_id",
  "event_type",
  "customer_safe_message",
  "metadata",
  "created_by",
  "idempotency_key",
  "created_at"
].join(",");

let defaultRepository: JobRepository | null = null;

export function getJobRepository(): JobRepository {
  if (!defaultRepository) {
    const localRepositoryFile = getLocalJobRepositoryFile();
    defaultRepository = isSupabaseRuntimeConfigured()
      ? new SupabaseJobRepository()
      : localRepositoryFile
        ? new LocalFileJobRepository(localRepositoryFile)
        : new InMemoryJobRepository();
  }

  return defaultRepository;
}

export function resetJobRepositoryForTests(repository: JobRepository = new InMemoryJobRepository()): void {
  defaultRepository = repository;
}

export async function createJob(
  context: AccountContext,
  input: CreateJobInput,
  options: JobOptions = {}
): Promise<{ job: JobRow; inserted: boolean }> {
  const normalized = normalizeCreateInput(input);
  const catalogMatch = findServiceOption(normalized.serviceFamily, normalized.serviceType);

  if (!catalogMatch) {
    await reject(context, "service_not_in_catalog");
  }

  const db = options.db ?? getServerDb();
  const entitlement = await getUsableEntitlement(context, db);

  if (!entitlement) {
    await reject(context, "missing_active_capability");
    throw new SafeRejectError("missing_active_capability");
  }

  const usage = await getAccountUsageSummary(context, {
    db,
    repository: options.usageRepository
  });

  const route = "/api/v1/jobs";
  const rateLimit = await checkRateLimit(context, {
    apiKeyId: context.auth.apiKeyId ?? null,
    entitlement,
    policy: options.rateLimitPolicy,
    route,
    now: options.now
  });

  if (!rateLimit.allowed) {
    const retryAt = rateLimit.resetAt;
    const retryAfterSeconds = secondsUntil(retryAt, (options.now ?? (() => new Date()))());
    await recordRateLimitEvent(context, route, rateLimit.remaining.api_key === 0 ? "api_key_rate_limit" : "account_rate_limit", {
      apiKeyId: context.auth.apiKeyId,
      retryAfterSeconds,
      retryAt,
      repository: options.rateLimitEventRepository,
      now: options.now
    });
    await reject(context, "rate_limit_exceeded", null, {
      apiKeyId: context.auth.apiKeyId,
      retryAfterSeconds,
      retryAt
    });
  }

  if (usage.totals.remaining < 1) {
    await reject(context, "monthly_quota_used");
  }

  await enforceConcurrency(context, {
    apiKeyId: context.auth.apiKeyId ?? null,
    entitlement,
    repository: options.repository ?? getJobRepository(),
    eventRepository: options.rateLimitEventRepository,
    route,
    now: options.now
  });

  const now = (options.now ?? (() => new Date()))().toISOString();
  const jobId = randomUUID();
  const idempotencyKey = normalized.idempotencyKey;
  const job: JobRow = {
    id: jobId,
    accountId: context.account.id,
    createdByUserId: context.user.id,
    apiKeyId: context.auth.apiKeyId ?? null,
    serviceFamily: normalized.serviceFamily,
    serviceType: normalized.serviceType,
    status: "queued",
    customerTitle: normalized.customerTitle,
    customerInstructions: normalized.customerInstructions,
    idempotencyKey,
    entitlementSnapshot: toEntitlementSnapshot(entitlement),
    rejectCode: null,
    intentBrief: null,
    intakeSessionId: null,
    createdAt: now,
    updatedAt: now,
    cancelledAt: null,
    completedAt: null
  };
  const initialEvent = makeEvent(context, job.id, "queued", "Your request was received.", now, {
    service_family: job.serviceFamily,
    service_type: job.serviceType
  }, idempotencyKey ? `${idempotencyKey}:queued` : null);
  const result = await (options.repository ?? getJobRepository()).createJob(job, initialEvent);

  if (result.inserted) {
    await recordUsage(context, {
      apiKeyId: context.auth.apiKeyId ?? null,
      serviceFamily: result.job.serviceFamily,
      jobId: result.job.id,
      quantity: 1,
      unit: "job",
      entitlementCode: result.job.entitlementSnapshot.entitlement_code,
      idempotencyKey: idempotencyKey ? `${idempotencyKey}:usage:create` : `job:${result.job.id}:create`
    }, {
      repository: options.usageRepository,
      now: options.now
    });
  }

  return result;
}

export async function getAccountJob(context: AccountContext, id: string, options: JobOptions = {}): Promise<JobRow> {
  const job = await (options.repository ?? getJobRepository()).findJobByIdForAccount(id, context.account.id);

  if (!job) {
    await reject(context, "account_job_missing", id);
    throw new SafeRejectError("account_job_missing", id);
  }

  return job;
}

export async function listAccountJobs(
  context: AccountContext,
  input: ListJobsInput,
  options: JobOptions = {}
): Promise<{ jobs: JobRow[]; nextCursor: string | null }> {
  const filters = normalizeListInput(input);
  const rows = await (options.repository ?? getJobRepository()).listJobsForAccount(context.account.id, filters);
  const pageRows = rows.slice(0, filters.limit);
  const hasMore = rows.length > filters.limit;
  const last = pageRows.at(-1) ?? null;

  return {
    jobs: pageRows,
    nextCursor: hasMore && last ? encodeJobListCursor(last) : null
  };
}

// Latest meaningful fulfillment step per job, for honest status chips.
// "Neutral" steps (status answers, approval notes, stall reassurances) are
// skipped so they never mask the underlying lifecycle state.
const NEUTRAL_CUSTOMER_STEPS = new Set(["status_update", "approval_noted", "in_studio"]);

export function deriveLatestCustomerSteps(events: JobEventRow[]): Record<string, string> {
  const steps: Record<string, string> = {};
  const ordered = [...events].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  for (const event of ordered) {
    if (steps[event.jobId]) {
      continue;
    }

    const step = event.metadata?.customer_step;

    if (typeof step === "string" && step.length > 0 && !NEUTRAL_CUSTOMER_STEPS.has(step)) {
      steps[event.jobId] = step;
    }
  }

  return steps;
}

export async function latestCustomerStepsForAccount(
  context: AccountContext,
  options: JobOptions = {}
): Promise<Record<string, string>> {
  const repository = options.repository ?? getJobRepository();
  const events = await repository.listRecentEventsForAccount(context.account.id, 400);
  return deriveLatestCustomerSteps(events);
}

export async function listAccountJobEvents(
  context: AccountContext,
  id: string,
  options: JobOptions = {}
): Promise<JobEventRow[]> {
  await getAccountJob(context, id, options);
  return (options.repository ?? getJobRepository()).listEventsByJobIdForAccount(id, context.account.id);
}

export async function cancelAccountJob(
  context: AccountContext,
  id: string,
  idempotencyKey: string | null,
  options: JobOptions = {}
): Promise<{ job: JobRow; event: JobEventRow | null }> {
  const repository = options.repository ?? getJobRepository();
  const job = await getAccountJob(context, id, options);

  if (job.status === "canceled") {
    return {
      job,
      event: null
    };
  }

  if (job.status === "completed" || job.status === "rejected") {
    await reject(context, "terminal_status_cancel", id);
  }

  const now = (options.now ?? (() => new Date()))().toISOString();
  const event = makeEvent(
    context,
    id,
    "canceled",
    "Cancellation was recorded for this job.",
    now,
    {},
    idempotencyKey
  );
  const updated = await repository.updateJob({
    ...job,
    status: "canceled",
    updatedAt: now,
    cancelledAt: now
  });
  const eventResult = await repository.appendEvent(event);

  if (eventResult.inserted) {
    await recordUsage(context, {
      apiKeyId: context.auth.apiKeyId ?? null,
      serviceFamily: job.serviceFamily,
      jobId: job.id,
      quantity: -1,
      unit: "job",
      entitlementCode: job.entitlementSnapshot.entitlement_code,
      idempotencyKey: idempotencyKey ? `${idempotencyKey}:usage:cancel` : `job:${job.id}:cancel:${eventResult.event.id}`
    }, {
      repository: options.usageRepository,
      now: options.now
    });
  }

  return {
    job: updated,
    event: eventResult.event
  };
}

export async function requestJobRevision(
  context: AccountContext,
  id: string,
  instructions: unknown,
  idempotencyKey: string | null,
  options: JobOptions = {}
): Promise<{ job: JobRow; event: JobEventRow }> {
  const repository = options.repository ?? getJobRepository();
  const job = await getAccountJob(context, id, options);

  if (terminalStatuses.has(job.status)) {
    await reject(context, "terminal_status_revision", id);
  }

  const revisionInstructions = normalizeText(instructions, "Revision instructions", 1, 4000);
  const db = options.db ?? getServerDb();
  const entitlement = await getUsableEntitlement(context, db);

  if (!entitlement) {
    await reject(context, "missing_active_capability", id);
    throw new SafeRejectError("missing_active_capability", id);
  }

  const usage = await getAccountUsageSummary(context, {
    db,
    repository: options.usageRepository
  });

  if (usage.totals.remaining < 1) {
    await reject(context, "monthly_quota_used", id);
  }

  const now = (options.now ?? (() => new Date()))().toISOString();
  const updated = await repository.updateJob({
    ...job,
    status: "needs_review",
    updatedAt: now
  });
  const event = makeEvent(
    context,
    id,
    "needs_review",
    "Revision notes were received for this job.",
    now,
    {
      instruction_length: revisionInstructions.length
    },
    idempotencyKey
  );
  const eventResult = await repository.appendEvent(event);

  if (eventResult.inserted) {
    // Store the full revision text (not just its length) so fulfillment
    // agents see exactly what the customer asked to change.
    await recordJobFeedback(job, "customer", revisionInstructions, {
      repository: options.feedbackRepository,
      now: options.now
    });
    await recordUsage(context, {
      apiKeyId: context.auth.apiKeyId ?? null,
      serviceFamily: job.serviceFamily,
      jobId: job.id,
      quantity: 1,
      unit: "job",
      entitlementCode: entitlement.entitlementCode,
      idempotencyKey: idempotencyKey ? `${idempotencyKey}:usage:revision` : `job:${job.id}:revision:${eventResult.event.id}`
    }, {
      repository: options.usageRepository,
      now: options.now
    });
  }

  return {
    job: updated,
    event: eventResult.event
  };
}

export async function approveAccountJob(
  context: AccountContext,
  id: string,
  idempotencyKey: string | null,
  options: JobOptions = {}
): Promise<{ job: JobRow; event: JobEventRow | null }> {
  const repository = options.repository ?? getJobRepository();
  const job = await getAccountJob(context, id, options);

  if (job.status === "completed") {
    return {
      job,
      event: null
    };
  }

  if (job.status !== "ready_for_customer_review") {
    await reject(context, "approval_unavailable", id);
  }

  const now = (options.now ?? (() => new Date()))().toISOString();
  const updated = await repository.updateJob({
    ...job,
    status: "completed",
    updatedAt: now,
    completedAt: now
  });
  const event = makeEvent(
    context,
    id,
    "completed",
    "Customer approval was recorded. This job is complete.",
    now,
    {},
    idempotencyKey
  );
  const eventResult = await repository.appendEvent(event);

  return {
    job: updated,
    event: eventResult.event
  };
}

export async function transitionJobForFulfillment(
  input: FulfillmentTransitionInput,
  options: JobOptions = {}
): Promise<{ job: JobRow; event: JobEventRow | null }> {
  const repository = options.repository ?? getJobRepository();
  const requestedStatus = normalizeTransitionStatus(input.status);
  const job = await repository.findJobById(input.id);

  if (!job) {
    throw new SafeRejectError("account_job_missing", input.id);
  }

  if (job.status === requestedStatus) {
    return {
      job,
      event: null
    };
  }

  const reopen = normalizeReopenRequest(input);
  const isReopeningCompleted = job.status === "completed";

  if (isReopeningCompleted) {
    // The only path out of completed is the controlled internal repair path:
    // an explicit reopen flag, a non-empty reason, and an operator identity.
    if (!reopen || requestedStatus !== "needs_review") {
      throw new SafeRejectError("validation_failed", input.id);
    }
  } else {
    if (reopen) {
      throw new SafeRejectError("validation_failed", input.id);
    }

    if (!canTransitionInternally(job.status, requestedStatus)) {
      throw new SafeRejectError("validation_failed", input.id);
    }
  }

  let targetStatus = requestedStatus;
  let message = normalizeTransitionMessage(input.message, requestedStatus);
  let metadata = normalizeSafeMetadata(input.metadata);

  if (requestedStatus === "ready_for_customer_review") {
    // QA gate: a bad or unreviewed artifact can never become customer-ready.
    const gate = await evaluateCustomerReviewGate(job, {
      repository: options.qaRepository,
      jobRepository: repository,
      fileRepository: options.fileRepository,
      now: options.now
    });

    if (!gate.allowed) {
      if (!gate.redirectToStudioReview) {
        throw new SafeRejectError(gate.reason, input.id);
      }

      // Machine pass alone on a media deliverable: park the job for the
      // studio's human review instead of exposing it to the customer.
      targetStatus = "needs_review";
      message = "The delivery is ready for studio review.";
      metadata = normalizeSafeMetadata({
        ...metadata,
        studio_review: "pending"
      });
    }
  }

  if (isReopeningCompleted && reopen) {
    message = typeof input.message === "string" && input.message.trim()
      ? input.message.trim().slice(0, 500)
      : "The studio reopened this delivery for rework.";
    metadata = normalizeSafeMetadata({
      ...metadata,
      reopened: true,
      reopen_reason: reopen.reason,
      reopen_operator: reopen.operator
    });
  }

  const now = (options.now ?? (() => new Date()))().toISOString();

  if (targetStatus === job.status) {
    // A redirected transition landed on the current status (for example a
    // machine-pass-only review attempt while already in needs_review): keep
    // the status and still record the customer-safe event.
    const event = makeSystemEvent(job, targetStatus, message, now, metadata, input.idempotencyKey ?? null);
    const eventResult = await repository.appendEvent(event);

    return {
      job,
      event: eventResult.event
    };
  }

  const updated = await repository.updateJob({
    ...job,
    status: targetStatus,
    updatedAt: now,
    cancelledAt: targetStatus === "canceled" ? now : job.cancelledAt,
    completedAt: isReopeningCompleted ? null : job.completedAt
  });
  const event = makeSystemEvent(
    updated,
    targetStatus,
    message,
    now,
    metadata,
    input.idempotencyKey ?? null
  );
  const eventResult = await repository.appendEvent(event);

  return {
    job: updated,
    event: eventResult.event
  };
}

export type FulfillmentNoteInput = {
  message?: unknown;
  metadata?: unknown;
  idempotencyKey?: string | null;
};

// Appends a customer-safe system note to a non-terminal job's timeline
// without changing its status. Used by the fulfillment daemon's stall pass
// ("still in the studio") through the internal note route.
export async function appendFulfillmentSystemNote(
  id: string,
  input: FulfillmentNoteInput,
  options: JobOptions = {}
): Promise<{ job: JobRow; event: JobEventRow }> {
  const repository = options.repository ?? getJobRepository();
  const job = await repository.findJobById(id);

  if (!job) {
    throw new SafeRejectError("account_job_missing", id);
  }

  if (terminalStatuses.has(job.status)) {
    throw new SafeRejectError("validation_failed", id);
  }

  const message = typeof input.message === "string" ? input.message.trim().slice(0, 500) : "";

  if (!message) {
    throw new SafeRejectError("validation_failed", id);
  }

  const now = (options.now ?? (() => new Date()))().toISOString();
  const event = makeSystemEvent(
    job,
    job.status,
    message,
    now,
    normalizeSafeMetadata(input.metadata),
    input.idempotencyKey ?? null
  );
  const result = await repository.appendEvent(event);

  return {
    job,
    event: result.event
  };
}

function normalizeReopenRequest(input: FulfillmentTransitionInput): { reason: string; operator: string } | null {
  const flag = input.reopenCompleted;

  if (flag === undefined || flag === null || flag === false) {
    return null;
  }

  if (flag !== true) {
    throw new SafeRejectError("validation_failed", input.id);
  }

  const reason = typeof input.reopenReason === "string" ? input.reopenReason.trim() : "";
  const operator = typeof input.reopenOperator === "string" ? input.reopenOperator.trim() : "";

  if (!reason || reason.length > 500 || !operator || operator.length > 120) {
    throw new SafeRejectError("validation_failed", input.id);
  }

  return {
    reason,
    operator
  };
}

export function toSafeJob(job: JobRow): {
  id: string;
  account_id: string;
  service_family: string;
  service_type: string;
  status: JobStatus;
  customer_title: string;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  completed_at: string | null;
  links: {
    self: string;
    events: string;
    approve: string;
    cancel: string;
    revision: string;
  };
} {
  return {
    id: job.id,
    account_id: job.accountId,
    service_family: job.serviceFamily,
    service_type: job.serviceType,
    status: job.status,
    customer_title: job.customerTitle,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
    cancelled_at: job.cancelledAt,
    completed_at: job.completedAt,
    links: {
      self: `/api/v1/jobs/${job.id}`,
      events: `/api/v1/jobs/${job.id}/events`,
      approve: `/api/v1/jobs/${job.id}/approve`,
      cancel: `/api/v1/jobs/${job.id}/cancel`,
      revision: `/api/v1/jobs/${job.id}/revision`
    }
  };
}

export function toSafeJobEvent(event: JobEventRow): {
  id: string;
  job_id: string;
  event_type: JobEventType;
  message: string;
  metadata: Record<string, string | number | boolean | null>;
  created_by: JobEventRow["createdBy"];
  created_at: string;
} {
  return {
    id: event.id,
    job_id: event.jobId,
    event_type: event.eventType,
    message: event.customerSafeMessage,
    metadata: sanitizeSafeJobEventMetadata(event.metadata),
    created_by: event.createdBy,
    created_at: event.createdAt
  };
}

function sanitizeSafeJobEventMetadata(
  metadata: JobEventRow["metadata"]
): Record<string, string | number | boolean | null> {
  const safeMetadata: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (isBlockedSafeEventMetadataKey(key) || isBlockedSafeEventMetadataValue(value)) {
      continue;
    }

    safeMetadata[key] = value;
  }

  return safeMetadata;
}

function normalizeSafeMetadata(value: unknown): Record<string, string | number | boolean | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized: Record<string, string | number | boolean | null> = {};

  for (const [key, rawValue] of Object.entries(value)) {
    if (!/^[a-zA-Z0-9_.-]{1,60}$/.test(key)) {
      continue;
    }

    if (
      typeof rawValue === "string"
      || typeof rawValue === "number"
      || typeof rawValue === "boolean"
      || rawValue === null
    ) {
      normalized[key] = typeof rawValue === "string" ? rawValue.slice(0, 160) : rawValue;
    }
  }

  return sanitizeSafeJobEventMetadata(normalized);
}

function isBlockedSafeEventMetadataKey(key: string): boolean {
  const normalized = normalizeMetadataToken(key);
  const compact = normalized.replaceAll("_", "");

  return blockedSafeEventMetadataKeyFragments.some((fragment) => (
    normalized.includes(fragment) || compact.includes(fragment)
  ));
}

function isBlockedSafeEventMetadataValue(value: string | number | boolean | null): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = normalizeMetadataToken(value);
  const lowerValue = value.toLowerCase();

  return lowerValue.includes("service_profile.") || blockedSafeEventMetadataValues.has(normalized);
}

function normalizeMetadataToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function matchesJobFilters(row: JobRow, filters: JobListFilters): boolean {
  if (filters.statuses.length > 0 && !filters.statuses.includes(row.status)) {
    return false;
  }

  if (filters.serviceFamily && row.serviceFamily !== filters.serviceFamily) {
    return false;
  }

  if (filters.createdAfter && row.createdAt < filters.createdAfter) {
    return false;
  }

  if (filters.createdBefore && row.createdAt > filters.createdBefore) {
    return false;
  }

  if (filters.cursor && compareRowToCursor(row, filters.cursor) >= 0) {
    return false;
  }

  return true;
}

function compareJobsForList(left: JobRow, right: JobRow): number {
  const createdCompare = right.createdAt.localeCompare(left.createdAt);

  if (createdCompare !== 0) {
    return createdCompare;
  }

  return right.id.localeCompare(left.id);
}

function compareRowToCursor(row: JobRow, cursor: JobListCursor): number {
  const createdCompare = row.createdAt.localeCompare(cursor.createdAt);

  if (createdCompare !== 0) {
    return createdCompare;
  }

  return row.id.localeCompare(cursor.id);
}

function maxIsoString(left: string | null, right: string | null): string | null {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return left > right ? left : right;
}

function minIsoString(left: string | null, right: string | null): string | null {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return left < right ? left : right;
}

function normalizeCreateInput(input: CreateJobInput): {
  serviceFamily: string;
  serviceType: string;
  customerTitle: string;
  customerInstructions: string;
  idempotencyKey: string | null;
} {
  return {
    serviceFamily: normalizeText(input.service_family, "Service family", 1, 80),
    serviceType: normalizeText(input.service_type, "Service type", 1, 120),
    customerTitle: normalizeText(input.customer_title, "Customer title", 1, 120),
    customerInstructions: normalizeText(input.customer_instructions, "Customer instructions", 1, 8000),
    idempotencyKey: typeof input.idempotency_key === "string" && input.idempotency_key.trim()
      ? input.idempotency_key.trim().slice(0, 160)
      : null
  };
}

function normalizeListInput(input: ListJobsInput): JobListFilters {
  const statuses = normalizeStatuses(input.status);
  const serviceFamily = typeof input.service_family === "string" && input.service_family.trim()
    ? input.service_family.trim()
    : null;

  if (serviceFamily && !serviceFamiliesInclude(serviceFamily)) {
    throw new SafeRejectError("validation_failed");
  }

  const createdAfter = normalizeIsoTimestamp(input.created_after);
  const createdBefore = normalizeIsoTimestamp(input.created_before);
  const cursor = normalizeCursor(input.cursor);
  const limit = normalizeLimit(input.limit);

  if (createdAfter && createdBefore && createdAfter > createdBefore) {
    throw new SafeRejectError("validation_failed");
  }

  return {
    statuses,
    serviceFamily,
    createdAfter,
    createdBefore,
    cursor,
    limit
  };
}

function normalizeStatuses(value: unknown): JobStatus[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim()
      ? value.split(",")
      : [];
  const statuses = values.map((candidate) => String(candidate).trim()).filter(Boolean);

  for (const status of statuses) {
    if (!allJobStatusSet.has(status as JobStatus)) {
      throw new SafeRejectError("validation_failed");
    }
  }

  return Array.from(new Set(statuses)) as JobStatus[];
}

function normalizeLimit(value: unknown): number {
  if (value === undefined || value === null || value === "") {
    return 25;
  }

  const limit = typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new SafeRejectError("validation_failed");
  }

  return limit;
}

function normalizeIsoTimestamp(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new SafeRejectError("validation_failed");
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    throw new SafeRejectError("validation_failed");
  }

  return date.toISOString();
}

function normalizeCursor(value: unknown): JobListCursor | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new SafeRejectError("validation_failed");
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Record<string, unknown>;
    const createdAt = normalizeIsoTimestamp(parsed.created_at);
    const id = typeof parsed.id === "string" && parsed.id.trim() ? parsed.id.trim() : null;

    if (!createdAt || !id) {
      throw new Error("Invalid cursor.");
    }

    return {
      createdAt,
      id
    };
  } catch {
    throw new SafeRejectError("validation_failed");
  }
}

function encodeJobListCursor(job: JobRow): string {
  return Buffer.from(JSON.stringify({
    created_at: job.createdAt,
    id: job.id
  }), "utf8").toString("base64url");
}

function serviceFamiliesInclude(serviceFamily: string): boolean {
  // List filters accept retired family ids so accounts can still find their
  // historical jobs; creation stays limited to the current catalog.
  return serviceFamilies.some((family) => family.id === serviceFamily)
    || isLegacyServiceFamily(serviceFamily);
}

function normalizeText(value: unknown, _label: string, minLength: number, maxLength: number): string {
  if (typeof value !== "string") {
    throw new SafeRejectError("validation_failed");
  }

  const normalized = value.trim();

  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new SafeRejectError("validation_failed");
  }

  return normalized;
}

function normalizeTransitionStatus(value: unknown): JobStatus {
  if (typeof value !== "string" || !allJobStatusSet.has(value as JobStatus)) {
    throw new SafeRejectError("validation_failed");
  }

  const status = value as JobStatus;

  if (!internalTransitionTargets.has(status)) {
    throw new SafeRejectError("validation_failed");
  }

  return status;
}

function canTransitionInternally(current: JobStatus, target: JobStatus): boolean {
  return allowedInternalTransitions[current].includes(target);
}

function normalizeTransitionMessage(value: unknown, status: JobStatus): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim().slice(0, 500);
  }

  switch (status) {
    case "accepted":
      return "Your request was accepted and is being prepared.";
    case "running":
      return "Work is in progress.";
    case "needs_review":
      return "Work is being reviewed before customer handoff.";
    case "ready_for_customer_review":
      return "A reviewed delivery is ready for customer review.";
    case "rejected":
      return "This job cannot continue as submitted.";
    case "canceled":
      return "Cancellation was recorded for this job.";
    case "queued":
    case "completed":
      throw new SafeRejectError("validation_failed");
  }
}

export async function getUsableEntitlement(context: AccountContext, db: ServerDb): Promise<EntitlementRow | null> {
  // Holder-gated rows (holder_unlimited without current wallet eligibility)
  // are filtered out before any capability decision.
  const entitlements = (await listGatedEntitlementRowsByAccountId(context.account.id, { db })).filter(
    (entitlement) => entitlement.status === "active" || entitlement.status === "trialing"
  );

  if (context.auth.method === "api_key") {
    return entitlements.find((entitlement) => entitlement.apiAccess && entitlement.monthlyQuota > 0) ?? null;
  }

  return entitlements.find((entitlement) => (
    (entitlement.dashboardAccess || entitlement.apiAccess) && entitlement.monthlyQuota > 0
  )) ?? null;
}

function toEntitlementSnapshot(entitlement: EntitlementRow): EntitlementSnapshot {
  return {
    entitlement_code: entitlement.entitlementCode,
    tier_family: entitlement.tierFamily,
    tier_level: entitlement.tierLevel,
    monthly_quota: entitlement.monthlyQuota,
    api_access: entitlement.apiAccess,
    dashboard_access: entitlement.dashboardAccess,
    current_period_end: entitlement.currentPeriodEnd
  };
}

function makeEvent(
  context: AccountContext,
  jobId: string,
  eventType: JobEventType,
  message: string,
  createdAt: string,
  metadata: Record<string, string | number | boolean | null>,
  idempotencyKey: string | null
): JobEventRow {
  return {
    id: randomUUID(),
    accountId: context.account.id,
    jobId,
    eventType,
    customerSafeMessage: message,
    metadata: sanitizeSafeJobEventMetadata(metadata),
    createdBy: "customer",
    idempotencyKey,
    createdAt
  };
}

function makeSystemEvent(
  job: JobRow,
  eventType: JobEventType,
  message: string,
  createdAt: string,
  metadata: Record<string, string | number | boolean | null>,
  idempotencyKey: string | null
): JobEventRow {
  return {
    id: randomUUID(),
    accountId: job.accountId,
    jobId: job.id,
    eventType,
    customerSafeMessage: message,
    metadata: sanitizeSafeJobEventMetadata(metadata),
    createdBy: "system",
    idempotencyKey,
    createdAt
  };
}

async function reject(
  context: AccountContext,
  reason: ConstructorParameters<typeof SafeRejectError>[0],
  jobId: string | null = null,
  options: {
    apiKeyId?: string | null;
    retryAfterSeconds?: number | null;
    retryAt?: string | null;
  } = {}
): Promise<never> {
  await recordReject(context, reason, {
    apiKeyId: options.apiKeyId ?? context.auth.apiKeyId,
    jobId,
    source: "jobs_api"
  });
  throw new SafeRejectError(reason, jobId, {
    retryAfterSeconds: options.retryAfterSeconds,
    retryAt: options.retryAt
  });
}

function createAccountIndexKey(accountId: string, idempotencyKey: string): string {
  return `${accountId}:${idempotencyKey}`;
}

function getLocalJobRepositoryFile(env: NodeJS.ProcessEnv = process.env): string | null {
  const configured = env.WEBOT_LOCAL_JOB_REPOSITORY_FILE?.trim();

  if (configured) {
    return configured;
  }

  if (env.NODE_ENV === "development" && env.WEBOT_DISABLE_LOCAL_JOB_REPOSITORY_FILE !== "true") {
    return ".next/webot-local-jobs.json";
  }

  return null;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function secondsUntil(targetIso: string, now: Date): number {
  const targetMs = Date.parse(targetIso);

  if (!Number.isFinite(targetMs)) {
    return 1;
  }

  return Math.max(1, Math.ceil((targetMs - now.getTime()) / 1000));
}

function cloneJob(row: JobRow): JobRow {
  return {
    ...row,
    entitlementSnapshot: {
      ...row.entitlementSnapshot
    }
  };
}

function cloneEvent(row: JobEventRow): JobEventRow {
  return {
    ...row,
    metadata: {
      ...row.metadata
    }
  };
}

function toSupabaseJobRow(row: JobRow): SupabaseJobRow {
  return {
    id: row.id,
    account_id: row.accountId,
    created_by_user_id: looksLikeUuid(row.createdByUserId) ? row.createdByUserId : null,
    api_key_id: row.apiKeyId,
    service_family: row.serviceFamily,
    service_type: row.serviceType,
    status: row.status,
    customer_title: row.customerTitle,
    customer_instructions: row.customerInstructions,
    idempotency_key: row.idempotencyKey,
    entitlement_snapshot: { ...row.entitlementSnapshot },
    reject_code: row.rejectCode,
    intent_brief: row.intentBrief ?? null,
    intake_session_id: row.intakeSessionId ?? null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    cancelled_at: row.cancelledAt,
    completed_at: row.completedAt
  };
}

function fromSupabaseJobRow(row: SupabaseJobRow): JobRow {
  return {
    id: row.id,
    accountId: row.account_id,
    createdByUserId: row.created_by_user_id ?? `api_key:${row.api_key_id ?? "unknown"}`,
    apiKeyId: row.api_key_id,
    serviceFamily: row.service_family,
    serviceType: row.service_type,
    status: row.status,
    customerTitle: row.customer_title,
    customerInstructions: row.customer_instructions,
    idempotencyKey: row.idempotency_key,
    entitlementSnapshot: { ...row.entitlement_snapshot },
    rejectCode: row.reject_code,
    intentBrief: row.intent_brief ?? null,
    intakeSessionId: row.intake_session_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cancelledAt: row.cancelled_at,
    completedAt: row.completed_at
  };
}

function toSupabaseEventRow(row: JobEventRow): SupabaseJobEventRow {
  return {
    id: row.id,
    account_id: row.accountId,
    job_id: row.jobId,
    event_type: row.eventType,
    customer_safe_message: row.customerSafeMessage,
    metadata: { ...row.metadata },
    created_by: row.createdBy,
    idempotency_key: row.idempotencyKey,
    created_at: row.createdAt
  };
}

function fromSupabaseEventRow(row: SupabaseJobEventRow): JobEventRow {
  return {
    id: row.id,
    accountId: row.account_id,
    jobId: row.job_id,
    eventType: row.event_type,
    customerSafeMessage: row.customer_safe_message,
    metadata: { ...row.metadata },
    createdBy: row.created_by,
    idempotencyKey: row.idempotency_key,
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

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
