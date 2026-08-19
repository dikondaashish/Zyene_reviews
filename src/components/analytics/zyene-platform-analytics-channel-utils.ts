import type { ReviewRequest } from "@/components/analytics/zyene-platform-analytics-types";
import { isOutboundRequest } from "@/lib/metrics/business-metrics";

export function normalizedChannel(
  r: ReviewRequest,
): "email" | "sms" | "link" | "both" {
  if (r.channel === "both") return "both";
  if (r.channel === "sms" || r.channel === "link") return r.channel;
  // Backward-compatible: public-link/QR tracking rows may be stored as email/manual
  // without customer identity when legacy DB constraints block channel=link inserts.
  if (r.channel === "email" && !isOutboundRequest(r)) return "link";
  return "email";
}
