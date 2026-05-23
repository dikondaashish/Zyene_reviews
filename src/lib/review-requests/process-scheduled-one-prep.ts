import type { SupabaseClient } from "@supabase/supabase-js";
import type { DueRow, PreparedScheduledSend } from "./scheduled-queue-types";
import { loadScheduledSendBusiness } from "./process-scheduled-one-prep-business";
import { validateScheduledSendContact } from "./process-scheduled-one-prep-contact";

export type { PreparedScheduledSend } from "./scheduled-queue-types";

export async function prepareScheduledSendRow(
    admin: SupabaseClient,
    row: DueRow,
    businessId: string,
    requestId: string,
): Promise<"failed" | PreparedScheduledSend> {
    const channel = (row.channel || "").toLowerCase();
    const b = await loadScheduledSendBusiness(admin, businessId, requestId, channel);
    if (b === "failed") return "failed";

    const contact = await validateScheduledSendContact(admin, row, b, businessId, requestId, channel);
    if (contact === "failed") return "failed";

    return {
        b,
        businessId,
        requestId,
        customerName: row.customer_name,
        ...contact,
    };
}
