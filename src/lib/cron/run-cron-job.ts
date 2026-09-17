import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";
import { authorizeCronRequest } from "@/lib/cron/authorize-cron-request";
import {
  cronOccurrenceKey,
  type CronCadence,
} from "@/lib/cron/cron-occurrence";

type CronClaimAction =
  | "acquired"
  | "recovered"
  | "already_completed"
  | "already_running"
  | "attempts_exhausted"
  | "recovery_requires_review";

type CronClaim = {
  action: CronClaimAction;
  lease_token: string;
  attempt_count: number;
};

type RpcResult<T> = { data: T; error: { message?: string } | null };

export type CronJobContext = {
  occurrenceKey: string;
};

export type CronJobOptions = {
  name: string;
  cadence: CronCadence;
  leaseSeconds?: number;
  maxAttempts?: number;
  /** Set only where a stale rerun cannot repeat an irreversible side effect. */
  retryOnInterruption?: boolean;
};

type CronHandler = (context: CronJobContext) => Promise<Response>;

/**
 * Authenticates a cron call before opening any privileged resource, then uses a
 * database-backed lease to prevent duplicate or overlapping occurrences.
 */
export async function runCronJob(
  request: Request,
  options: CronJobOptions,
  handler: CronHandler,
): Promise<Response> {
  const authorization = authorizeCronRequest(request);
  if (authorization === "misconfigured") {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  if (authorization !== "authorized") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const occurrenceKey = cronOccurrenceKey(options.cadence);
  const db = createAdminClient();
  let claim: CronClaim;
  try {
    claim = await claimCronRun(db, options, occurrenceKey);
  } catch (error: unknown) {
    logger.error(
      { err: error, jobName: options.name, occurrenceKey },
      "Unable to claim cron job run",
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  if (claim.action !== "acquired" && claim.action !== "recovered") {
    logger.info(
      {
        jobName: options.name,
        occurrenceKey,
        action: claim.action,
        attempt: claim.attempt_count,
      },
      "Cron invocation skipped",
    );
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: claim.action,
    });
  }

  try {
    const response = await handler({ occurrenceKey });
    if (response.ok) {
      await finishCronRun(
        db,
        "complete_cron_job_run",
        options.name,
        occurrenceKey,
        claim.lease_token,
      );
    } else {
      await finishCronRun(
        db,
        "fail_cron_job_run",
        options.name,
        occurrenceKey,
        claim.lease_token,
        `http_${response.status}`,
      );
    }
    return response;
  } catch (error: unknown) {
    logger.error(
      { err: error, jobName: options.name, occurrenceKey },
      "Cron job failed",
    );
    try {
      await finishCronRun(
        db,
        "fail_cron_job_run",
        options.name,
        occurrenceKey,
        claim.lease_token,
        "exception",
      );
    } catch (finishError: unknown) {
      logger.error(
        { err: finishError, jobName: options.name, occurrenceKey },
        "Failed to record cron failure",
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

async function claimCronRun(
  db: ReturnType<typeof createAdminClient>,
  options: CronJobOptions,
  occurrenceKey: string,
): Promise<CronClaim> {
  const result = (await db.rpc(
    "claim_cron_job_run" as never,
    {
      p_job_name: options.name,
      p_occurrence_key: occurrenceKey,
      p_lease_seconds: options.leaseSeconds ?? 900,
      p_max_attempts: options.maxAttempts ?? 3,
      p_allow_retry: options.retryOnInterruption ?? true,
    } as never,
  )) as unknown as RpcResult<CronClaim[] | null>;

  if (result.error || !result.data?.[0]) {
    throw new Error(result.error?.message || "Unable to claim cron job run");
  }
  return result.data[0];
}

async function finishCronRun(
  db: ReturnType<typeof createAdminClient>,
  functionName: "complete_cron_job_run" | "fail_cron_job_run",
  jobName: string,
  occurrenceKey: string,
  leaseToken: string,
  failureCode?: string,
): Promise<void> {
  const result = (await db.rpc(
    functionName as never,
    {
      p_job_name: jobName,
      p_occurrence_key: occurrenceKey,
      p_lease_token: leaseToken,
      ...(failureCode ? { p_failure_code: failureCode } : {}),
    } as never,
  )) as unknown as RpcResult<boolean | null>;

  if (result.error || result.data !== true) {
    throw new Error(result.error?.message || "Unable to finalize cron job run");
  }
}
