/** @module api/_shared — Shared auth, error, and response helpers for API routes. */

export { requireUser } from "./auth";
export { ApiRouteError, toApiError } from "./errors";
export { apiOk, apiError } from "./responses";
export type { ApiSuccess, ApiFailure } from "./responses";
