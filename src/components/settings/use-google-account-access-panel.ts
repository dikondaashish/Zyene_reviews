"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { GoogleAccountSummary, GoogleAdminRow } from "./google-account-access-panel-types";
import { unwrapGoogleAccountAccessApiData } from "./google-account-access-panel-types";

export function useGoogleAccountAccessPanel(businessId: string) {
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<GoogleAccountSummary[]>([]);
    const [admins, setAdmins] = useState<GoogleAdminRow[]>([]);
    const [linkedLocationId, setLinkedLocationId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/google/account-access?businessId=${encodeURIComponent(businessId)}`,
                );
                const payload = await res.json();
                if (!res.ok) throw new Error(payload.error || "Failed to load");
                const data = unwrapGoogleAccountAccessApiData<{
                    accounts?: GoogleAccountSummary[];
                    admins?: GoogleAdminRow[];
                    linkedLocationId?: string | null;
                }>(payload);
                if (!cancelled) {
                    setAccounts(data.accounts || []);
                    setAdmins(data.admins || []);
                    setLinkedLocationId(data.linkedLocationId || null);
                }
            } catch (e: unknown) {
                if (!cancelled) {
                    toast.error(e instanceof Error ? e.message : "Failed to load account access");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [businessId]);

    return { loading, accounts, admins, linkedLocationId };
}
