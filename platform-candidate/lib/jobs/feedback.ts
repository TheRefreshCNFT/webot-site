import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { isSupabaseRuntimeConfigured, SupabaseRestClient } from "../db/supabase-rest";
import { SafeRejectError } from "../rejects";
import type { JobRow } from ".";

export type JobFeedbackSource = "customer" | "internal";

export type JobFeedbackRow = {
  id: string;
  accountId: string;
  jobId: string;
  source: JobFeedbackSource;
  body: string;
  createdAt: string;
};

export type JobFeedbackRepository = {
  insert(row: JobFeedbackRow): Promise<JobFeedbackRow>;
  listByJobId(jobId: string): Promise<JobFeedbackRow[]>;
};

export type FeedbackOptions = {
  repository?: JobFeedbackRepository;
  now?: () => Date;
};

export const JOB_FEEDBACK_MAX_LENGTH = 4000;

type FeedbackRepositorySnapshot = {
  feedback: JobFeedbackRow[];
};

export class InMemoryJobFeedbackRepository implements JobFeedbackRepository {
  protected readonly rows = new Map<string, JobFeedbackRow>();

  async insert(row: JobFeedbackRow): Promise<JobFeedbackRow> {
    this.rows.set(row.id, cloneFeedback(row));
    return cloneFeedback(row);
  }

  async listByJobId(jobId: string): Promise<JobFeedbackRow[]> {
    // Stable sort: rows created in the same millisecond keep insertion order.
    return Array.from(this.rows.values())
      .filter((row) => row.jobId === jobId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(cloneFeedback);
  }

  dumpRowsForTests(): JobFeedbackRow[] {
    return Array.from(this.rows.values()).map(cloneFeedback);
  }

  protected snapshot(): FeedbackRepositorySnapshot {
    return {
      feedback: Array.from(this.rows.values()).map(cloneFeedback)
    };
  }

  protected loadSnapshot(snapshot: FeedbackRepositorySnapshot): void {
    this.rows.clear();

    for (const row of snapshot.feedback) {
      this.rows.set(row.id, cloneFeedback(row));
    }
  }
}

export class LocalFileJobFeedbackRepository extends InMemoryJobFeedbackRepository {
  private readonly filePath: string;
  private readonly lockDir: string;

  constructor(filePath: string) {
    super();
    this.filePath = resolve(filePath);
    this.lockDir = `${this.filePath}.lock`;
    this.loadFromDisk();
  }

  override async insert(row: JobFeedbackRow): Promise<JobFeedbackRow> {
    return this.withWriteLock(async () => {
      this.loadFromDisk();
      const result = await super.insert(row);
      this.persistToDisk();
      return result;
    });
  }

  override async listByJobId(jobId: string): Promise<JobFeedbackRow[]> {
    this.loadFromDisk();
    return super.listByJobId(jobId);
  }

  private loadFromDisk(): void {
    if (!existsSync(this.filePath)) {
      return;
    }

    const parsed = JSON.parse(readFileSync(this.filePath, "utf8")) as Partial<FeedbackRepositorySnapshot>;
    this.loadSnapshot({
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : []
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

type SupabaseJobFeedbackRow = {
  id: string;
  account_id: string;
  job_id: string;
  source: JobFeedbackSource;
  body: string;
  created_at: string;
};

const feedbackSelect = [
  "id",
  "account_id",
  "job_id",
  "source",
  "body",
  "created_at"
].join(",");

export class SupabaseJobFeedbackRepository implements JobFeedbackRepository {
  private readonly client: SupabaseRestClient;

  constructor(client: SupabaseRestClient = SupabaseRestClient.fromEnv()) {
    this.client = client;
  }

  async insert(row: JobFeedbackRow): Promise<JobFeedbackRow> {
    const rows = await this.client.insert<SupabaseJobFeedbackRow>("app_public", "job_feedback", toSupabaseFeedbackRow(row));
    return fromSupabaseFeedbackRow(requireOne(rows, "Job feedback insert returned no row."));
  }

  async listByJobId(jobId: string): Promise<JobFeedbackRow[]> {
    const rows = await this.client.get<SupabaseJobFeedbackRow>("app_public", "job_feedback", {
      select: feedbackSelect,
      job_id: `eq.${jobId}`,
      order: "created_at.asc"
    });
    return rows.map(fromSupabaseFeedbackRow);
  }
}

let defaultRepository: JobFeedbackRepository | null = null;

export function getJobFeedbackRepository(): JobFeedbackRepository {
  if (!defaultRepository) {
    const localRepositoryFile = getLocalFeedbackRepositoryFile();
    defaultRepository = isSupabaseRuntimeConfigured()
      ? new SupabaseJobFeedbackRepository()
      : localRepositoryFile
        ? new LocalFileJobFeedbackRepository(localRepositoryFile)
        : new InMemoryJobFeedbackRepository();
  }

  return defaultRepository;
}

export function resetJobFeedbackRepositoryForTests(repository: JobFeedbackRepository = new InMemoryJobFeedbackRepository()): void {
  defaultRepository = repository;
}

export async function recordJobFeedback(
  job: Pick<JobRow, "id" | "accountId">,
  source: JobFeedbackSource,
  body: unknown,
  options: FeedbackOptions = {}
): Promise<JobFeedbackRow> {
  const repository = options.repository ?? getJobFeedbackRepository();
  const normalizedBody = normalizeFeedbackBody(body);
  const now = (options.now ?? (() => new Date()))().toISOString();

  return repository.insert({
    id: randomUUID(),
    accountId: job.accountId,
    jobId: job.id,
    source,
    body: normalizedBody,
    createdAt: now
  });
}

export async function listJobFeedback(jobId: string, options: FeedbackOptions = {}): Promise<JobFeedbackRow[]> {
  return (options.repository ?? getJobFeedbackRepository()).listByJobId(jobId);
}

function normalizeFeedbackBody(value: unknown): string {
  if (typeof value !== "string") {
    throw new SafeRejectError("validation_failed");
  }

  const normalized = value.trim();

  if (normalized.length < 1 || normalized.length > JOB_FEEDBACK_MAX_LENGTH) {
    throw new SafeRejectError("validation_failed");
  }

  return normalized;
}

function cloneFeedback(row: JobFeedbackRow): JobFeedbackRow {
  return {
    ...row
  };
}

function toSupabaseFeedbackRow(row: JobFeedbackRow): SupabaseJobFeedbackRow {
  return {
    id: row.id,
    account_id: row.accountId,
    job_id: row.jobId,
    source: row.source,
    body: row.body,
    created_at: row.createdAt
  };
}

function fromSupabaseFeedbackRow(row: SupabaseJobFeedbackRow): JobFeedbackRow {
  return {
    id: row.id,
    accountId: row.account_id,
    jobId: row.job_id,
    source: row.source,
    body: row.body,
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

function getLocalFeedbackRepositoryFile(env: NodeJS.ProcessEnv = process.env): string | null {
  const configured = env.WEBOT_LOCAL_FEEDBACK_REPOSITORY_FILE?.trim();

  if (configured) {
    return configured;
  }

  if (env.NODE_ENV === "development" && env.WEBOT_DISABLE_LOCAL_FEEDBACK_REPOSITORY_FILE !== "true") {
    return ".next/webot-local-job-feedback.json";
  }

  return null;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}
