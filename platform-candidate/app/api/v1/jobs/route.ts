import { NextResponse } from "next/server";
import { accountErrorBody, AccountResolutionError, resolveAccountContext } from "../../../../lib/auth/account";
import { csrfErrorBody, CsrfError, validateDashboardCsrf } from "../../../../lib/auth/csrf";
import { createJob, listAccountJobs, toSafeJob } from "../../../../lib/jobs";
import { getRequestId } from "../../../../lib/db/server";
import { recordReject, SafeRejectError } from "../../../../lib/rejects";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const context = await resolveAccountContext(request);
    const result = await listAccountJobs(context, queryInput(request));

    return NextResponse.json(
      {
        jobs: result.jobs.map(toSafeJob),
        pagination: {
          next_cursor: result.nextCursor
        }
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    return routeError(error, request);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let context = null;

  try {
    context = await resolveAccountContext(request);
    validateDashboardCsrf(request, context);
    const body = await readBody(request);
    const idempotencyKey = request.headers.get("idempotency-key");
    const result = await createJob(context, {
      ...body,
      idempotency_key: body.idempotency_key ?? idempotencyKey ?? undefined
    });

    return NextResponse.json(
      {
        job: toSafeJob(result.job),
        next_action: "Check job status or add source files if needed."
      },
      {
        status: result.inserted ? 201 : 200,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    if (context && error instanceof SafeRejectError && error.reason === "validation_failed") {
      await recordReject(context, error.reason, {
        jobId: error.jobId,
        source: "jobs_api"
      });
    }

    return routeError(error, request);
  }
}

function queryInput(request: Request): Record<string, unknown> {
  const search = new URL(request.url).searchParams;
  const statuses = search.getAll("status").flatMap((value) => value.split(","));

  return {
    status: statuses,
    service_family: search.get("service_family") ?? undefined,
    created_after: search.get("created_after") ?? undefined,
    created_before: search.get("created_before") ?? undefined,
    cursor: search.get("cursor") ?? undefined,
    limit: search.get("limit") ?? undefined
  };
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" ? body as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function routeError(error: unknown, request: Request): NextResponse {
  if (error instanceof AccountResolutionError) {
    return NextResponse.json(accountErrorBody(error), {
      status: error.status,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  if (error instanceof SafeRejectError) {
    const errorBody: {
      error: {
        code: string;
        message: string;
        action: string;
        request_id: string;
        retry_after_seconds?: number;
        retry_at?: string;
      };
    } = {
      error: {
        code: error.safeReject.code,
        message: error.safeReject.message,
        action: error.safeReject.action,
        request_id: getRequestId(request.headers)
      }
    };
    const headers: Record<string, string> = {
      "Cache-Control": "no-store"
    };

    if (error.retryAfterSeconds !== null) {
      errorBody.error.retry_after_seconds = error.retryAfterSeconds;
      headers["Retry-After"] = String(error.retryAfterSeconds);
    }

    if (error.retryAt !== null) {
      errorBody.error.retry_at = error.retryAt;
    }

    return NextResponse.json(
      errorBody,
      {
        status: error.safeReject.httpStatus,
        headers
      }
    );
  }

  if (error instanceof CsrfError) {
    return NextResponse.json(csrfErrorBody(error, getRequestId(request.headers)), {
      status: error.status,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  throw error;
}
