"use client";

import { Loader2 } from "lucide-react";

import { GoogleAccountAccessAccountsList } from "./google-account-access-accounts-list";
import { GoogleAccountAccessAdminsList } from "./google-account-access-admins-list";
import { useGoogleAccountAccessPanel } from "./use-google-account-access-panel";

export function GoogleAccountAccessPanel({ businessId }: { businessId: string }) {
    const { loading, accounts, admins, linkedLocationId } = useGoogleAccountAccessPanel(businessId);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                <Loader2 className="animate-spin size-4" />
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
            <GoogleAccountAccessAccountsList accounts={accounts} linkedLocationId={linkedLocationId} />
            <GoogleAccountAccessAdminsList admins={admins} />
        </div>
    );
}
