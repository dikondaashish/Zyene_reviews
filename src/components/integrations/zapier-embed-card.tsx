import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandLogoTile } from "@/components/integrations/brand-logo-tile";
import { NEXT_PUBLIC_ZAPIER_CLIENT_ID } from "@/config/env";
import { ZapierWorkflowEmbed, type ZapierSignUpPrefill } from "./zapier-workflow-embed";

/**
 * Zapier card for the Integrations page. With `NEXT_PUBLIC_ZAPIER_CLIENT_ID` set
 * (our Zapier app is published and this domain is allowed), it embeds Zapier's
 * Workflow Element. Without it, it points to the webhook setup guide.
 */
export function ZapierEmbedCard({ signUp }: { signUp: ZapierSignUpPrefill }) {
    const clientId = NEXT_PUBLIC_ZAPIER_CLIENT_ID.trim();

    // The Workflow Element brings its own Zapier logo and tagline, so skip our header.
    if (clientId) {
        return (
            <Card className="overflow-hidden">
                <CardContent className="py-5">
                    <ZapierWorkflowEmbed clientId={clientId} signUp={signUp} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <div className="h-1 w-full bg-primary" />
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <BrandLogoTile domain="zapier.com" name="Zapier" />
                    <div>
                        <p className="text-base font-semibold">Zapier</p>
                        <p className="text-sm text-muted-foreground">
                            Connect Zyene to thousands of apps and automate review requests.
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-5">
                <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
                    <p className="text-sm text-muted-foreground">
                        Our one-click Zapier app is coming soon. Until then, any Zapier
                        trigger can send review requests through our webhook.
                    </p>
                    <Button asChild size="sm" variant="outline" className="shrink-0">
                        <Link href="/settings/integrations/zapier" className="inline-flex items-center gap-1.5">
                            Set up with a webhook
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
