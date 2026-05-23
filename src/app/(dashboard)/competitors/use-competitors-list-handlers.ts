"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCompetitor } from "@/app/actions/competitor";
import { syncCompetitorWatchNow } from "@/app/actions/competitor-watch-sync";
import { generateCompetitorMarketBriefNow } from "@/app/actions/competitor-market-brief";
import type { Competitor } from "./competitors-types";
import type { Dispatch, SetStateAction } from "react";

type UseCompetitorsListHandlersArgs = {
    businessId: string;
    competitors: Competitor[];
    setCompetitors: Dispatch<SetStateAction<Competitor[]>>;
    setIsDeleting: Dispatch<SetStateAction<string | null>>;
    setDeleteConfirm: Dispatch<SetStateAction<string | null>>;
    setSyncWatchLoading: Dispatch<SetStateAction<boolean>>;
    setBriefGenLoading: Dispatch<SetStateAction<boolean>>;
};

export function useCompetitorsListHandlers({
    businessId,
    competitors,
    setCompetitors,
    setIsDeleting,
    setDeleteConfirm,
    setSyncWatchLoading,
    setBriefGenLoading,
}: UseCompetitorsListHandlersArgs) {
    const router = useRouter();

    const handleGenerateMarketBrief = async () => {
        setBriefGenLoading(true);
        try {
            const result = await generateCompetitorMarketBriefNow(businessId);
            if (result.success) {
                toast.success("Market positioning brief saved.");
                router.refresh();
            } else {
                toast.error(result.error || "Could not generate brief.");
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Could not generate brief.");
        } finally {
            setBriefGenLoading(false);
        }
    };

    const handleSyncCompetitorWatch = async () => {
        setSyncWatchLoading(true);
        try {
            const result = await syncCompetitorWatchNow(businessId);
            if (result.success) {
                toast.success(
                    `Synced ${result.scanned ?? 0} competitor(s)${
                        result.snapshots != null ? ` · ${result.snapshots} new snapshot(s)` : ""
                    }.`
                );
                router.refresh();
            } else {
                toast.error(result.error || "Sync failed.");
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Sync failed.");
        } finally {
            setSyncWatchLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const result = await deleteCompetitor(id, businessId);
            if (result.success) {
                setCompetitors(competitors.filter((c) => c.id !== id));
                toast.success("Competitor removed successfully.");
            } else {
                toast.error(result.error || "Failed to remove competitor.");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to remove competitor.");
        } finally {
            setIsDeleting(null);
            setDeleteConfirm(null);
        }
    };

    const handleAddCompetitor = (newCompetitor: Competitor) => {
        setCompetitors([newCompetitor, ...competitors]);
    };

    return {
        handleGenerateMarketBrief,
        handleSyncCompetitorWatch,
        handleDelete,
        handleAddCompetitor,
    };
}
