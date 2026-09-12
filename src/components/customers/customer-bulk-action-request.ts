import { z } from "zod";
import type { BulkActionPayload } from "@/components/customers/customer-management-types";

const outcomeSchema = z.object({
    success: z.boolean().optional(),
    sent: z.number().int().nonnegative().optional(),
    failed: z.number().int().nonnegative().optional(),
    skipped: z.number().int().nonnegative().optional(),
    failedIds: z.array(z.string()).optional(),
    skippedIds: z.array(z.string()).optional(),
    limitReached: z.boolean().optional(),
    error: z.string().optional(),
});

export async function executeCustomerBulkAction(payload: {
    ids: string[]; businessId: string; action: "delete" | "tag" | "request"; data?: BulkActionPayload;
}) {
    const response = await fetch("/api/customers/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const result = outcomeSchema.safeParse(await response.json().catch(() => null));
    if (!response.ok || !result.success || result.data.success === false) {
        throw new Error(result.success && result.data.error ? result.data.error : "Could not complete the action. Your selection has been kept.");
    }
    if (payload.action === "request" && (result.data.sent === undefined || result.data.failed === undefined)) {
        throw new Error("Could not confirm delivery. Check request history before trying again.");
    }
    return result.data;
}
