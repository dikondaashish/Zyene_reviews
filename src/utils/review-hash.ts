import { createHash } from "crypto";
import type { GoogleReview } from "@/services/google/business-profile";

function stableStringify(value: unknown): string {
    if (value === null || value === undefined) return "null";

    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
    if (typeof value === "boolean") return value ? "true" : "false";

    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }

    if (typeof value === "object") {
        const obj = value as Record<string, unknown>;
        const keys = Object.keys(obj).sort();
        return `{${keys
            .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
            .join(",")}}`;
    }

    // functions/symbols/etc are not expected here; treat as null for stability
    return "null";
}

export function computeReviewHash(review: GoogleReview): string {
    const payload = {
        starRating: review.starRating,
        comment: review.comment ?? null,
        reviewReplyComment: review.reviewReply?.comment ?? null,
        reviewReplyUpdateTime: review.reviewReply?.updateTime ?? null,
    };

    const json = stableStringify(payload);
    return createHash("sha256").update(json).digest("hex");
}

export function hasReviewChanged(newHash: string, storedHash: string | null): boolean {
    if (!storedHash) return true;
    return newHash !== storedHash;
}

