export type GoogleSyncMappedError = {
  status: number;
  message: string;
  details?: string;
  code?: string;
};

export function mapGoogleSyncError(error: unknown): GoogleSyncMappedError {
  const errAny = error as { code?: string; message?: string; userMessage?: string };
  const message = errAny?.message || (error instanceof Error ? error.message : String(error));

  if (errAny?.code === "CONFLICT") {
    return { status: 409, message: "Conflict: Google API resource state", code: "CONFLICT" };
  }

  if (errAny?.code === "RATE_LIMIT") {
    return { status: 429, message: "Rate limit exceeded", code: "RATE_LIMIT" };
  }

  if (errAny?.code === "GOOGLE_API_DISABLED" || message.includes("GOOGLE_API_DISABLED")) {
    return {
      status: 403,
      message: "Google My Business API is not enabled for this Cloud project.",
      details:
        "Use the link (same project as your OAuth client). Click Enable, then enable My Business Account Management and My Business Business Information APIs. Wait 2–5 minutes and try Sync again.",
      code: "GOOGLE_API_DISABLED",
    };
  }

  if (errAny?.code === "GOOGLE_GBP_ACCESS_PENDING" || message.includes("GOOGLE_GBP_ACCESS_PENDING")) {
    return {
      status: 403,
      message:
        "Google Business Profile API access or quota may still be pending. Submit Google’s access request if your quota is 0.",
      details: errAny.userMessage || message.replace(/^GOOGLE_GBP_ACCESS_PENDING:\s*/, ""),
      code: "GOOGLE_GBP_ACCESS_PENDING",
    };
  }

  if (errAny?.code === "GOOGLE_REVIEWS_FORBIDDEN" || message.includes("GOOGLE_REVIEWS_FORBIDDEN")) {
    return {
      status: 403,
      message:
        "Google blocked access to your reviews (403). Usually: enable Google My Business API in Google Cloud, use OAuth scope business.manage, and reconnect Google from Integrations.",
      details: message.replace(/^GOOGLE_REVIEWS_FORBIDDEN:\s*/, ""),
      code: "GOOGLE_REVIEWS_FORBIDDEN",
    };
  }

  if (message.includes("403") && message.toLowerCase().includes("forbidden")) {
    return {
      status: 403,
      message:
        "Google denied access when loading reviews. Enable Google My Business API for your OAuth project and reconnect Google with the Business Profile permission.",
      details: message,
      code: "GOOGLE_403_FORBIDDEN",
    };
  }

  if (message.includes("No Google Accounts")) {
    return { status: 400, message: "No Google Business Profile found.", code: "NO_GOOGLE_ACCOUNTS" };
  }

  if (message.includes("reconnect") || message.includes("refresh token")) {
    return {
      status: 401,
      message: "Authentication expired. Please reconnect Google.",
      details: message,
      code: "AUTH_EXPIRED",
    };
  }

  if (message === "Business not found" || message === "Google platform not connected") {
    return { status: 404, message: "Integration not found", code: "INTEGRATION_NOT_FOUND" };
  }

  return { status: 500, message: "Failed to sync reviews", details: message, code: "INTERNAL_ERROR" };
}

