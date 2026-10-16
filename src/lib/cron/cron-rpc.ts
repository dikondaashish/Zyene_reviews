export type RpcError = { message?: string } | null;
export type RpcResult<T> = { data: T; error: RpcError; status?: number };

/** Waits before each retry; three attempts in total, well inside a cron run. */
const RETRY_DELAYS_MS = [500, 2000] as const;

/** Network and edge failures that clear on their own (DNS blips, resets, gateway errors). */
const TRANSIENT_MESSAGE_PATTERN =
  /<!doctype html|<html|fetch failed|network|socket hang up|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|timed? ?out/i;

/**
 * True when an RPC failed before Postgres answered. A database error (bad
 * argument, constraint) is final and is never retried.
 */
export function isTransientRpcFailure(result: RpcResult<unknown>): boolean {
  if (!result.error) return false;
  if (result.status !== undefined && (result.status === 0 || result.status >= 500)) return true;
  return TRANSIENT_MESSAGE_PATTERN.test(result.error.message ?? "");
}

/**
 * Turns an RPC error into a short message. An edge proxy error page (e.g. a
 * Cloudflare 1001 DNS page) arrives as a whole HTML document; keep its title.
 */
export function summarizeRpcError(error: RpcError, fallback: string): string {
  const message = error?.message?.trim();
  if (!message) return fallback;
  if (!/^<(?:!doctype|html)/i.test(message)) return message;
  const title = message.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
  return title ? `Upstream HTML error: ${title}` : "Upstream HTML error page";
}

/**
 * Runs a lease RPC, retrying only transient failures. Safe for the cron lease
 * functions: a retried claim that already landed comes back as "already_running"
 * and is skipped, and complete/fail are keyed by the lease token.
 */
export async function callCronRpc<T>(
  call: () => PromiseLike<RpcResult<T>>,
): Promise<RpcResult<T>> {
  let result = await call();
  for (const delayMs of RETRY_DELAYS_MS) {
    if (!isTransientRpcFailure(result)) break;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    result = await call();
  }
  return result;
}
