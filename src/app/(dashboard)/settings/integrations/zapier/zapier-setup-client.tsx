import type { ReactNode } from "react";

import { ZapierHowItWorksCard } from "./zapier-how-it-works-card";
import { ZapierWebhookUrlCard } from "./zapier-webhook-url-card";
import { ZapierConfigureZapCard } from "./zapier-configure-zap-card";
import { ZapierHelpFooterCard } from "./zapier-help-footer-card";
import { DeveloperApiCard } from "@/components/integrations/developer-api-card";
import type { PublicApiKey } from "@/lib/api-keys/credentials";

interface ZapierSetupClientProps {
    appBaseUrl: string;
    apiKey: PublicApiKey | null;
    businessId: string;
    canManageApiKeys: boolean;
    children?: ReactNode;
}

export function ZapierSetupClient({
    appBaseUrl,
    apiKey,
    businessId,
    canManageApiKeys,
    children,
}: ZapierSetupClientProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-5">
            <ZapierHowItWorksCard />

            <div className="space-y-6 lg:col-span-3">
                <DeveloperApiCard
                    businessId={businessId}
                    apiKey={apiKey}
                    canManage={canManageApiKeys}
                />
                <ZapierWebhookUrlCard
                    appBaseUrl={appBaseUrl}
                    businessId={businessId}
                />
                <ZapierConfigureZapCard />
                {children}
                <ZapierHelpFooterCard />
            </div>
        </div>
    );
}
