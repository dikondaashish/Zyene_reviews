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

export function toApiError(err: unknown): { message: string; status: number; code?: string; details?: string } {
  if (err instanceof ApiRouteError) {
    return { message: err.message, status: err.status, code: err.code, details: err.details };
  }
  if (err instanceof Error) {
    return { message: err.message || "Internal Server Error", status: 500 };
  }
  return { message: "Internal Server Error", status: 500 };
}

