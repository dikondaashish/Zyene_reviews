import { toast } from "sonner";
import { sendCampaignContacts, toastCampaignSendResult } from "./campaign-detail-api";
import type { Campaign } from "./campaign-detail-types";

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
        const lines = bulkPhones.split("\n").filter((l) => l.trim());
        if (lines.length === 0) {
            toast.error("Enter at least one phone number");
            return;
        }
        contacts = lines.map((phone) => ({ phone: phone.trim() }));
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
