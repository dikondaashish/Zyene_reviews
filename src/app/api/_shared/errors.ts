export class ApiRouteError extends Error {
  status: number;
  code?: string;
  details?: string;

  constructor(message: string, options?: { status?: number; code?: string; details?: string }) {
    super(message);
    this.name = "ApiRouteError";
    this.status = options?.status ?? 500;
    this.code = options?.code;
    this.details = options?.details;
  }
}

/**
 * True for handled client-state failures ({@link ApiRouteError} wit status <
 * 500): "Business not found", "platform not connected", rate limits, etc.
 *
 * These are expected API responses, not faults to alert on. Catch blocks log
 * them at warn so the pino -> Sentry bridge (error/fatal only) does not open
 * an issue for every unauthenticated-but-authed user with no business.
 */
export function isHandledApiClientError(err: unknown): err is ApiRouteError {
  return err instanceof ApiRouteError && err.status < 500;
}

export function toApiError(err: unknown): { message: string; status: number; code?: string; details?: string } {
  if (err instanceof ApiRouteError) {
    return { message: err.message, status: err.status, code: err.code, details: err.details };
  }
  if (err instanceof Error) {
    return { message: err.message || "Internal Server Error", status: 500 };
  }
  return { message: "Internal Server Error", status: 500 };
}

