import { randomUUID } from "node:crypto";
import type { AccountContext } from "../auth/account";
import { isSupabaseRuntimeConfigured, SupabaseRestClient } from "../db/supabase-rest";

export type SafeRejectCode =
  | "invalid_request"
  | "unsupported_service"
  | "entitlement_required"
  | "quota_exceeded"
  | "rate_limit_exceeded"
  | "concurrency_limit_exceeded"
  | "job_not_found"
  | "job_not_cancelable"
  | "revision_unavailable"
  | "session_not_found"
  | "qa_review_required"
  | "file_not_found"
  | "unsupported_file"
  | "file_too_large"
  | "unsafe_request";

export type InternalRejectReason =
  | "validation_failed"
  | "service_not_in_catalog"
  | "missing_active_capability"
  | "monthly_quota_used"
  | "rate_limit_exceeded"
  | "concurrency_limit_reached"
  | "account_job_missing"
  | "terminal_status_cancel"
  | "terminal_status_revision"
  | "approval_unavailable"
  | "intake_session_missing"
  | "intake_session_closed"
  | "intake_confirm_unavailable"
  | "qa_deliverable_missing"
  | "qa_review_missing_or_failed"
  | "account_file_missing"
  | "file_purpose_invalid"
  | "file_type_blocked"
  | "file_size_exceeded"
  | "input_not_safe";

export type SafeReject = {
  code: SafeRejectCode;
  message: string;
  action: string;
  httpStatus: 400 | 403 | 404 | 409 | 413 | 422 | 429;
};

export type RejectRow = {
  id: string;
  accountId: string | null;
  apiKeyId: string | null;
  jobId: string | null;
  rejectCode: SafeRejectCode;
  customerSafeMessage: string;
  customerSafeAction: string;
  httpStatus: number;
  source: string;
  metadata?: Record<string, string>;
  createdAt: string;
};

export type RejectRepository = {
  insert(row: RejectRow): Promise<RejectRow>;
  listByAccountId(accountId: string): Promise<RejectRow[]>;
};

type SafeRejectErrorOptions = {
  retryAfterSeconds?: number | null;
  retryAt?: string | null;
};

type RecordRejectOptions = {
  repository?: RejectRepository;
  now?: () => Date;
  apiKeyId?: string | null;
  jobId?: string | null;
  source?: string;
  metadata?: Record<string, string>;
};

const safeRejects: Record<InternalRejectReason, SafeReject> = {
  validation_failed: {
    code: "invalid_request",
    message: "The request is missing required information or includes a value we cannot accept.",
    action: "Check the request fields and try again.",
    httpStatus: 400
  },
  service_not_in_catalog: {
    code: "unsupported_service",
    message: "That service is not available in the current catalog.",
    action: "Choose a listed service family and service option.",
    httpStatus: 422
  },
  missing_active_capability: {
    code: "entitlement_required",
    message: "This account does not have access to create this kind of job.",
    action: "Use an account with an active plan that includes this capability.",
    httpStatus: 403
  },
  monthly_quota_used: {
    code: "quota_exceeded",
    message: "This account has reached its current plan limit.",
    action: "Wait for the next billing period or choose a plan with more capacity.",
    httpStatus: 403
  },
  rate_limit_exceeded: {
    code: "rate_limit_exceeded",
    message: "This request is over the current rate limit.",
    action: "Wait briefly before trying again, or reduce request frequency.",
    httpStatus: 429
  },
  concurrency_limit_reached: {
    code: "concurrency_limit_exceeded",
    message: "This account already has the maximum number of active jobs for its current plan.",
    action: "Wait for an active job to finish before creating another job.",
    httpStatus: 429
  },
  account_job_missing: {
    code: "job_not_found",
    message: "Job not found.",
    action: "Check the job ID and account, then try again.",
    httpStatus: 404
  },
  terminal_status_cancel: {
    code: "job_not_cancelable",
    message: "This job can no longer be canceled.",
    action: "Review the current job status before requesting cancellation.",
    httpStatus: 409
  },
  terminal_status_revision: {
    code: "revision_unavailable",
    message: "A revision is not available for this job.",
    action: "Review the current job status and start a new request if needed.",
    httpStatus: 409
  },
  approval_unavailable: {
    code: "invalid_request",
    message: "Approval is not available for this job yet.",
    action: "Wait until the job is ready for customer review before approving it.",
    httpStatus: 409
  },
  intake_session_missing: {
    code: "session_not_found",
    message: "That conversation could not be found.",
    action: "Check the conversation and account, then try again.",
    httpStatus: 404
  },
  intake_session_closed: {
    code: "invalid_request",
    message: "This conversation is closed.",
    action: "Start a new request to keep going.",
    httpStatus: 409
  },
  intake_confirm_unavailable: {
    code: "invalid_request",
    message: "This conversation does not have a confirmed summary yet.",
    action: "Wait for the studio summary before confirming.",
    httpStatus: 409
  },
  qa_deliverable_missing: {
    code: "qa_review_required",
    message: "This job does not have a delivered file to review yet.",
    action: "Register the delivery before requesting customer review.",
    httpStatus: 409
  },
  qa_review_missing_or_failed: {
    code: "qa_review_required",
    message: "This delivery has not passed studio quality review yet.",
    action: "Record a passing quality review for the latest delivery first.",
    httpStatus: 409
  },
  account_file_missing: {
    code: "file_not_found",
    message: "File not found.",
    action: "Check the file ID and account, then try again.",
    httpStatus: 404
  },
  file_purpose_invalid: {
    code: "invalid_request",
    message: "The file purpose is not supported.",
    action: "Use a supported file purpose for this endpoint.",
    httpStatus: 400
  },
  file_type_blocked: {
    code: "unsupported_file",
    message: "That file type is not supported for upload.",
    action: "Use one of the supported document, image, audio, video, or text formats.",
    httpStatus: 422
  },
  file_size_exceeded: {
    code: "file_too_large",
    message: "That file is larger than the current upload limit.",
    action: "Upload a smaller file or split the work into smaller parts.",
    httpStatus: 413
  },
  input_not_safe: {
    code: "unsafe_request",
    message: "We cannot accept this request as written.",
    action: "Revise the request and try again.",
    httpStatus: 422
  }
};

export class SafeRejectError extends Error {
  readonly safeReject: SafeReject;
  readonly reason: InternalRejectReason;
  readonly jobId: string | null;
  readonly retryAfterSeconds: number | null;
  readonly retryAt: string | null;

  constructor(reason: InternalRejectReason, jobId: string | null = null, options: SafeRejectErrorOptions = {}) {
    const safeReject = mapReject(reason);
    super(safeReject.message);
    this.name = "SafeRejectError";
    this.reason = reason;
    this.safeReject = safeReject;
    this.jobId = jobId;
    this.retryAfterSeconds = normalizeRetryAfterSeconds(options.retryAfterSeconds);
    this.retryAt = options.retryAt ?? null;
  }
}

export class InMemoryRejectRepository implements RejectRepository {
  private readonly rows = new Map<string, RejectRow>();

  async insert(row: RejectRow): Promise<RejectRow> {
    this.rows.set(row.id, cloneRow(row));
    return cloneRow(row);
  }

  async listByAccountId(accountId: string): Promise<RejectRow[]> {
    return Array.from(this.rows.values())
      .filter((row) => row.accountId === accountId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(cloneRow);
  }

  dumpRowsForTests(): RejectRow[] {
    return Array.from(this.rows.values()).map(cloneRow);
  }
}

type SupabaseRejectRow = {
  id: string;
  account_id: string | null;
  api_key_id: string | null;
  job_id: string | null;
  reject_code: SafeRejectCode;
  customer_safe_message: string;
  customer_safe_action: string;
  http_status: number;
  source: string;
  metadata: Record<string, string>;
  created_at: string;
};

export class SupabaseRejectRepository implements RejectRepository {
  private readonly client: SupabaseRestClient;

  constructor(client: SupabaseRestClient = SupabaseRestClient.fromEnv()) {
    this.client = client;
  }

  async insert(row: RejectRow): Promise<RejectRow> {
    const rows = await this.client.insert<SupabaseRejectRow>("app_public", "rejects", toSupabaseRow(row));
    return fromSupabaseRow(requireOne(rows, "Reject insert returned no row."));
  }

  async listByAccountId(accountId: string): Promise<RejectRow[]> {
    const rows = await this.client.get<SupabaseRejectRow>("app_public", "rejects", {
      select: rejectSelect,
      account_id: `eq.${accountId}`,
      order: "created_at.desc"
    });
    return rows.map(fromSupabaseRow);
  }
}

const rejectSelect = [
  "id",
  "account_id",
  "api_key_id",
  "job_id",
  "reject_code",
  "customer_safe_message",
  "customer_safe_action",
  "http_status",
  "source",
  "metadata",
  "created_at"
].join(",");

let defaultRepository: RejectRepository | null = null;

export function getRejectRepository(): RejectRepository {
  if (!defaultRepository) {
    defaultRepository = isSupabaseRuntimeConfigured()
      ? new SupabaseRejectRepository()
      : new InMemoryRejectRepository();
  }

  return defaultRepository;
}

export function resetRejectRepositoryForTests(repository: RejectRepository = new InMemoryRejectRepository()): void {
  defaultRepository = repository;
}

export function mapReject(reason: InternalRejectReason): SafeReject {
  return {
    ...safeRejects[reason]
  };
}

function normalizeRetryAfterSeconds(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(1, Math.ceil(value));
}

export async function recordReject(
  context: AccountContext | null,
  reason: InternalRejectReason,
  options: RecordRejectOptions = {}
): Promise<RejectRow> {
  const safeReject = mapReject(reason);
  const row: RejectRow = {
    id: randomUUID(),
    accountId: context?.account.id ?? null,
    apiKeyId: options.apiKeyId ?? null,
    jobId: options.jobId ?? null,
    rejectCode: safeReject.code,
    customerSafeMessage: safeReject.message,
    customerSafeAction: safeReject.action,
    httpStatus: safeReject.httpStatus,
    source: options.source ?? "api",
    metadata: { ...(options.metadata ?? {}) },
    createdAt: (options.now ?? (() => new Date()))().toISOString()
  };

  return (options.repository ?? getRejectRepository()).insert(row);
}

function cloneRow(row: RejectRow): RejectRow {
  return {
    ...row,
    metadata: { ...(row.metadata ?? {}) }
  };
}

function toSupabaseRow(row: RejectRow): SupabaseRejectRow {
  return {
    id: row.id,
    account_id: row.accountId,
    api_key_id: row.apiKeyId,
    job_id: row.jobId,
    reject_code: row.rejectCode,
    customer_safe_message: row.customerSafeMessage,
    customer_safe_action: row.customerSafeAction,
    http_status: row.httpStatus,
    source: row.source,
    metadata: row.metadata ?? {},
    created_at: row.createdAt
  };
}

function fromSupabaseRow(row: SupabaseRejectRow): RejectRow {
  return {
    id: row.id,
    accountId: row.account_id,
    apiKeyId: row.api_key_id,
    jobId: row.job_id,
    rejectCode: row.reject_code,
    customerSafeMessage: row.customer_safe_message,
    customerSafeAction: row.customer_safe_action,
    httpStatus: row.http_status,
    source: row.source,
    metadata: { ...(row.metadata ?? {}) },
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
