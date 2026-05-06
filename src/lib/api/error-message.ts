/**
 * Parse error text from API JSON: our standard `{ success: false, error: string }`
 * or common `{ message: string }` shapes.
 */
export function readApiErrorMessage(body: unknown): string | undefined {
    if (!body || typeof body !== "object") return undefined;
    const r = body as Record<string, unknown>;
    if (typeof r.error === "string" && r.error.length > 0) return r.error;
    if (typeof r.message === "string" && r.message.length > 0) return r.message;
    return undefined;
}
