import type { ReactNode } from "react";

import { ZapierHowItWorksCard } from "./zapier-how-it-works-card";
import { ZapierWebhookUrlCard } from "./zapier-webhook-url-card";
import { ZapierConfigureZapCard } from "./zapier-configure-zap-card";
import { ZapierHelpFooterCard } from "./zapier-help-footer-card";

interface ZapierSetupClientProps {
    appBaseUrl: string;
    apiKey: string | null;
    businessId: string;
    children?: ReactNode;
}

export function ZapierSetupClient({
    appBaseUrl,
    apiKey,
    businessId,
    children,
}: ZapierSetupClientProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-5">
            <ZapierHowItWorksCard />

            <div className="space-y-6 lg:col-span-3">
                <ZapierWebhookUrlCard
                    appBaseUrl={appBaseUrl}
                    apiKey={apiKey}
                    businessId={businessId}
                />
                <ZapierConfigureZapCard />
                {children}
                <ZapierHelpFooterCard />
            </div>
        </div>
    );
}
