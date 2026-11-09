import { toast } from "sonner";
import { sendCampaignContacts, toastCampaignSendResult } from "./campaign-detail-api";
import type { Campaign } from "./campaign-detail-types";

/**
 * One contact per line: a line with "@" is an email, anything else a phone. Email-only
 * campaigns used to receive phone-only contacts here and silently drop every one.
 */
export function parseBulkContactLines(text: string): { phone?: string; email?: string }[] {
    return text.split("\n").map((line) => line.trim()).filter(Boolean)
        .map((line) => (line.includes("@") ? { email: line } : { phone: line }));
}

export async function sendCampaignToContacts(params: {
    campaign: Campaign;
    addMode: "single" | "bulk";
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    bulkPhones: string;
    onSuccess: () => void;
    setSending: (v: boolean) => void;
}) {
    const { campaign, addMode, contactName, contactPhone, contactEmail, bulkPhones, onSuccess, setSending } = params;

    let contacts: { name?: string; phone?: string; email?: string }[] = [];

    if (addMode === "single") {
        if (!contactPhone && !contactEmail) {
            toast.error("Enter a phone number or email");
            return;
        }
        contacts = [{ name: contactName || undefined, phone: contactPhone || undefined, email: contactEmail || undefined }];
    } else {
        contacts = parseBulkContactLines(bulkPhones);
        if (contacts.length === 0) {
            toast.error(campaign.channel === "email" ? "Enter at least one email address" : "Enter at least one phone number or email");
            return;
        }
    }

    setSending(true);
    try {
        const { ok, result } = await sendCampaignContacts(campaign.id, contacts);
        if (!ok) {
            toast.error(result.error || "Failed to send");
            return;
        }
        toastCampaignSendResult(result, "Sent");
        onSuccess();
    } catch {
        toast.error("Failed to send");
    } finally {
        setSending(false);
    }
}

export async function importCampaignCsvContacts(params: {
    campaign: Campaign;
    contacts: { name?: string; email?: string; phone?: string }[];
    onSuccess: () => void;
    setSending: (v: boolean) => void;
}) {
    const { campaign, contacts, onSuccess, setSending } = params;
    setSending(true);
    try {
        const { ok, result } = await sendCampaignContacts(campaign.id, contacts);
        if (!ok) {
            toast.error(result.error || "Failed to import");
            return;
        }
        toastCampaignSendResult(result, "Imported");
        onSuccess();
    } catch {
        toast.error("Failed to import");
    } finally {
        setSending(false);
    }
}
