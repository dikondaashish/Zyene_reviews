"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Campaign } from "./campaigns-list-types";

export function useCampaignsList() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch("/api/campaigns");
            const data = await res.json();
            setCampaigns(data.campaigns || []);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const toggleStatus = async (campaign: Campaign) => {
        const newStatus = campaign.status === "active" ? "paused" : "active";
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Campaign ${newStatus === "active" ? "resumed" : "paused"}`);
                fetchCampaigns();
            } else {
                const errorData = await res.json();
                if (errorData.code === "EMAIL_NOT_VERIFIED") {
                    toast.error("Email verification required", {
                        description: "You must verify your email before activating campaigns.",
                        action: {
                            label: "Resend Email",
                            onClick: () => {
                                /* No-op: resend is handled by the banner flow. */
                            },
                        },
                    });
                } else {
                    toast.error(errorData.error || "Failed to update campaign");
                }
            }
        } catch {
            toast.error("Failed to update campaign");
        }
    };

    const deleteCampaign = async (id: string) => {
        try {
            const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Campaign deleted");
                fetchCampaigns();
            } else {
                toast.error("Failed to delete campaign");
            }
        } catch {
            toast.error("Failed to delete campaign");
        }
    };

    const getCompletedPercent = (c: Campaign) => {
        const completed = c.total_completed || c.total_reviews_received || 0;
        return c.total_sent > 0 ? Math.round((completed / c.total_sent) * 100) : 0;
    };

    const getOpenedPercent = (c: Campaign) =>
        c.total_sent > 0 ? Math.round((c.total_opened / c.total_sent) * 100) : 0;

    return {
        campaigns,
        loading,
        toggleStatus,
        deleteCampaign,
        getCompletedPercent,
        getOpenedPercent,
    };
}
