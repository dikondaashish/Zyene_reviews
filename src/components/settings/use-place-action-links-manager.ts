"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type {
    PlaceActionLinksManagerProps,
    PlaceActionMetaType,
    PlaceLinkRow,
} from "./place-action-links-manager-types";
import { unwrapPlaceActionApiData } from "./place-action-links-manager-utils";

export function usePlaceActionLinksManager({ businessId, initialLinks }: PlaceActionLinksManagerProps) {
    const router = useRouter();
    const [links, setLinks] = useState<PlaceLinkRow[]>(initialLinks);
    const [types, setTypes] = useState<PlaceActionMetaType[]>([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [placeActionType, setPlaceActionType] = useState("");
    const [uri, setUri] = useState("");
    const [isPreferred, setIsPreferred] = useState(false);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        setLinks(initialLinks);
    }, [initialLinks]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setTypesLoading(true);
            try {
                const res = await fetch(
                    `/api/google/place-actions?businessId=${encodeURIComponent(businessId)}`,
                );
                const payload = await res.json();
                if (!res.ok) throw new Error(payload.error || "Failed to load link types");
                const data = unwrapPlaceActionApiData<{ types?: PlaceActionMetaType[] }>(payload);
                const list = data.types || [];
                if (!cancelled) {
                    setTypes(list);
                    setPlaceActionType((prev) => prev || list[0]?.placeActionType || "");
                }
            } catch (e: unknown) {
                if (!cancelled) {
                    toast.error(e instanceof Error ? e.message : "Failed to load types");
                }
            } finally {
                if (!cancelled) setTypesLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [businessId]);

    const displayForType = (t: string) => {
        const m = types.find((x) => x.placeActionType === t);
        return m?.displayName || t;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!placeActionType || !uri.trim()) {
            toast.error("Choose a link type and enter a URL");
            return;
        }
        setCreating(true);
        try {
            const res = await fetch("/api/google/place-actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId,
                    placeActionType,
                    uri: uri.trim(),
                    isPreferred,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create link");
            toast.success("Link added on Google");
            setUri("");
            setIsPreferred(false);
            router.refresh();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to create");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (linkId: string) => {
        setDeletingId(linkId);
        try {
            const res = await fetch("/api/google/place-actions", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ linkId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to remove link");
            toast.success("Link removed");
            router.refresh();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to remove");
        } finally {
            setDeletingId(null);
        }
    };

    return {
        links,
        types,
        typesLoading,
        placeActionType,
        setPlaceActionType,
        uri,
        setUri,
        isPreferred,
        setIsPreferred,
        creating,
        deletingId,
        displayForType,
        handleCreate,
        handleDelete,
    };
}
