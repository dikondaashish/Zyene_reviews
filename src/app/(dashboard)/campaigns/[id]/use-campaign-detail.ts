"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle,
    Eye,
    MousePointerClick,
    Send,
} from "lucide-react";
import { toast } from "sonner";
import type { Campaign, FunnelStage, ReviewRequest } from "./campaign-detail-types";

export function useCampaignDetail(campaignId: string) {
    const router = useRouter();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [requests, setRequests] = useState<ReviewRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [csvDialogOpen, setCsvDialogOpen] = useState(false);

    const [contactName, setContactName] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [bulkPhones, setBulkPhones] = useState("");
    const [addMode, setAddMode] = useState<"single" | "bulk">("single");

    const fetchCampaign = async () => {
        try {
            const res = await fetch(`/api/campaigns/${campaignId}`);
            if (!res.ok) {
                router.push("/campaigns");
                return;
            }
            const data = await res.json();
            setCampaign(data.campaign);
            setRequests(data.requests || []);
        } catch {
            router.push("/campaigns");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchCampaign();
    }, [campaignId]);

    const toggleStatus = async () => {
        if (!campaign) return;
        const newStatus = campaign.status === "active" ? "paused" : "active";
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Campaign ${newStatus === "active" ? "activated" : "paused"}`);
                fetchCampaign();
            }
        } catch {
            toast.error("Failed to update campaign");
        }
    };

    const sendToContacts = async () => {
        if (!campaign) return;

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
            const res = await fetch(`/api/campaigns/${campaign.id}/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contacts }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || "Failed to send");
                return;
            }

            toast.success(`Sent: ${result.sent}, Skipped: ${result.skipped}, Failed: ${result.failed}`);
            setDialogOpen(false);
            setContactName("");
            setContactPhone("");
            setContactEmail("");
            setBulkPhones("");
            fetchCampaign();
        } catch {
            toast.error("Failed to send");
        } finally {
            setSending(false);
        }
    };

    const handleCSVImport = async (contacts: { name?: string; email?: string; phone?: string }[]) => {
        if (!campaign) return;

        setSending(true);
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contacts }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || "Failed to import");
                return;
            }

            toast.success(`Imported: ${result.sent}, Skipped: ${result.skipped}, Failed: ${result.failed}`);
            setCsvDialogOpen(false);
            fetchCampaign();
        } catch {
            toast.error("Failed to import");
        } finally {
            setSending(false);
        }
    };

    const funnelStages: FunnelStage[] = useMemo(() => {
        if (!campaign) return [];
        const totalCompleted = campaign.total_completed || campaign.total_reviews_received || 0;
        return [
            { label: "Sent", value: campaign.total_sent, icon: Send, color: "bg-primary" },
            { label: "Opened", value: campaign.total_opened, icon: Eye, color: "bg-chart-4" },
            { label: "Clicked", value: campaign.total_clicked, icon: MousePointerClick, color: "bg-primary" },
            { label: "Completed", value: totalCompleted, icon: CheckCircle, color: "bg-chart-2/100" },
        ];
    }, [campaign]);

    const maxFunnel = useMemo(
        () => Math.max(campaign?.total_sent ?? 0, 1),
        [campaign],
    );

    return {
        router,
        campaign,
        requests,
        loading,
        sending,
        mounted,
        dialogOpen,
        setDialogOpen,
        csvDialogOpen,
        setCsvDialogOpen,
        contactName,
        setContactName,
        contactPhone,
        setContactPhone,
        contactEmail,
        setContactEmail,
        bulkPhones,
        setBulkPhones,
        addMode,
        setAddMode,
        toggleStatus,
        sendToContacts,
        handleCSVImport,
        funnelStages,
        maxFunnel,
    };
}

export type CampaignDetailState = ReturnType<typeof useCampaignDetail>;
