"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type AccountSummary = {
    resourceName: string;
    accountName: string;
    type?: string;
    verificationState?: string;
    locationCount: number;
    locations: Array<{ name: string; title: string }>;
    isLinkedToZyeneReviews: boolean;
};

type AdminRow = {
    name?: string;
    admin?: string;
    role?: string;
    pendingInvitation?: boolean;
};

export function GoogleAccountAccessPanel({ businessId }: { businessId: string }) {
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<AccountSummary[]>([]);
    const [admins, setAdmins] = useState<AdminRow[]>([]);
    const [linkedLocationId, setLinkedLocationId] = useState<string | null>(null);

    const unwrapApiData = <T,>(payload: unknown): T => {
        const root = payload as { data?: T } & T;
        return (root?.data ?? root) as T;
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/google/account-access?businessId=${encodeURIComponent(businessId)}`
                );
                const payload = await res.json();
                if (!res.ok) throw new Error(payload.error || "Failed to load");
                const data = unwrapApiData<{
                    accounts?: AccountSummary[];
                    admins?: AdminRow[];
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

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading Google accounts…
            </div>
        );
    }

    if (accounts.length === 0 && admins.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No Google Business accounts returned for this connection. Reconnect Google from Integrations if this
                persists.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h5 className="text-sm font-medium">Accounts & locations</h5>
                <p className="text-xs text-muted-foreground">
                    OAuth token can access these Google Business Profile accounts. The row linked to Zyene Reviews is marked.
                    {linkedLocationId && (
                        <>
                            {" "}
                            Active location ID: <code className="text-xs bg-muted px-1 rounded">{linkedLocationId}</code>
                        </>
                    )}
                </p>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {accounts.map((acc) => (
                        <div
                            key={acc.resourceName}
                            className={`rounded-md border p-3 text-sm ${acc.isLinkedToZyeneReviews ? "border-primary/20 bg-primary/10" : ""}`}
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{acc.accountName}</span>
                                {acc.isLinkedToZyeneReviews && (
                                    <Badge variant="secondary" className="text-[10px]">
                                        Linked to Zyene Reviews
                                    </Badge>
                                )}
                                {acc.type && (
                                    <span className="text-xs text-muted-foreground">({acc.type})</span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {acc.locationCount} location{acc.locationCount === 1 ? "" : "s"}
                                {acc.verificationState ? ` · ${acc.verificationState}` : ""}
                            </p>
                            {acc.locations.length > 0 && (
                                <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
                                    {acc.locations.map((loc) => (
                                        <li key={loc.name} className="truncate">
                                            {loc.title}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {admins.length > 0 && (
                <div className="space-y-2">
                    <h5 className="text-sm font-medium">Account managers on linked account</h5>
                    <ul className="text-sm space-y-1 border rounded-md divide-y max-h-48 overflow-y-auto">
                        {admins.map((a, i) => (
                            <li key={a.name || i} className="px-3 py-2 flex flex-wrap gap-2 items-center">
                                <span className="font-mono text-xs break-all">{a.admin || a.name || "—"}</span>
                                {a.role && (
                                    <Badge variant="outline" className="text-[10px]">
                                        {a.role}
                                    </Badge>
                                )}
                                {a.pendingInvitation && (
                                    <Badge variant="secondary" className="text-[10px]">
                                        Pending
                                    </Badge>
                                )}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                        To add or remove managers, use{" "}
                        <a
                            href="https://business.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                        >
                            Google Business Profile
                        </a>
                        .
                    </p>
                </div>
            )}
        </div>
    );
}
