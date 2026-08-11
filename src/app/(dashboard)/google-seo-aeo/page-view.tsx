import Link from "next/link";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadGoogleSeoAeoPageData } from "./load-google-seo-aeo-page-data";
import { GoogleSeoAeoScoreAuditSection } from "./google-seo-aeo-score-audit-section";
import { GoogleSeoAeoBottomSection } from "./google-seo-aeo-bottom-section";
import { AeoVisibilitySection } from "./aeo-visibility-section";
import { SearchConsoleSection } from "./search-console-section";
import { ShareOfVoiceSection } from "./share-of-voice-section";
import { DataExportsSection } from "./data-exports-section";
import { GoogleSeoAeoSubnav } from "./google-seo-aeo-subnav";

export default async function GoogleSeoAeoPage() {
    const data = await loadGoogleSeoAeoPageData();

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Building2}
                title="Add a business to run Google SEO/AEO audits"
                description="Google SEO/AEO is scoped to your active location. Create or select a business first."
            />
        );
    }

    if (data.kind === "no-platform") {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Google SEO/AEO</h2>
                <Card>
                    <CardContent className="py-8">
                        <p className="text-sm text-muted-foreground">
                            Connect Google Business Profile first to start SEO/AEO auditing.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/settings/integrations">Open Integrations</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-w-0 space-y-6 overflow-x-hidden p-4 md:p-8">
            <GoogleSeoAeoSubnav active="/google-seo-aeo" />
            <GoogleSeoAeoScoreAuditSection content={data.content} />
            {/*
             * Omitted entirely when the business has never been sampled. An empty
             * visibility card would read as "measured, and you are nowhere",
             * which is the opposite of "we have not looked yet".
             */}
            {data.content.aeoVisibility ? (
                <AeoVisibilitySection content={data.content.aeoVisibility} />
            ) : null}
            {data.content.shareOfVoice ? (
                <ShareOfVoiceSection result={data.content.shareOfVoice} />
            ) : null}
            {data.content.searchConsole ? (
                <SearchConsoleSection content={data.content.searchConsole} />
            ) : null}
            <GoogleSeoAeoBottomSection content={data.content} />
            <DataExportsSection />
        </div>
    );
}
