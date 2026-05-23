"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchCampaignDetail, patchCampaignStatus } from "./campaign-detail-api";
import { buildCampaignFunnelStages, campaignMaxFunnel } from "./campaign-detail-funnel-utils";
import type { Campaign, ReviewRequest } from "./campaign-detail-types";
import { importCampaignCsvContacts, sendCampaignToContacts } from "./use-campaign-detail-send";

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

    const loadCampaign = (initial = false) => {
        fetchCampaignDetail(
            campaignId,
            (c, r) => {
                setCampaign(c);
                setRequests(r as ReviewRequest[]);
                if (initial) setLoading(false);
            },
            () => router.push("/campaigns"),
            () => {
                if (initial) setLoading(false);
            }
        );
    };

    useEffect(() => {
        setMounted(true);
        loadCampaign(true);
    }, [campaignId]);

    const toggleStatus = async () => {
        if (!campaign) return;
        const newStatus = campaign.status === "active" ? "paused" : "active";
        try {
            if (await patchCampaignStatus(campaign.id, newStatus)) {
                toast.success(`Campaign ${newStatus === "active" ? "activated" : "paused"}`);
                loadCampaign();
            }
        } catch {
            toast.error("Failed to update campaign");
        }
    };

    const sendToContacts = async () => {
        if (!campaign) return;
        await sendCampaignToContacts({
            campaign,
            addMode,
            contactName,
            contactPhone,
            contactEmail,
            bulkPhones,
            setSending,
            onSuccess: () => {
                setDialogOpen(false);
                setContactName("");
                setContactPhone("");
                setContactEmail("");
                setBulkPhones("");
                loadCampaign();
            },
        });
    };

    const handleCSVImport = async (contacts: { name?: string; email?: string; phone?: string }[]) => {
        if (!campaign) return;
        await importCampaignCsvContacts({
            campaign,
            contacts,
            setSending,
            onSuccess: () => {
                setCsvDialogOpen(false);
                loadCampaign();
            },
        });
    };

    const funnelStages = useMemo(() => buildCampaignFunnelStages(campaign), [campaign]);
    const maxFunnel = useMemo(() => campaignMaxFunnel(campaign), [campaign]);

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
