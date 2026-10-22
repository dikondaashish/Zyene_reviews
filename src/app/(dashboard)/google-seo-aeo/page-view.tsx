import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { Building2, Plug } from "lucide-react";
import { loadGoogleSeoAeoPageData } from "./load-google-seo-aeo-page-data";
import { GoogleSeoAeoScoreAuditSection } from "./google-seo-aeo-score-audit-section";
import { GoogleSeoAeoBottomSection } from "./google-seo-aeo-bottom-section";
import { AeoVisibilitySection } from "./aeo-visibility-section";
import { SearchConsoleSection } from "./search-console-section";
import { ShareOfVoiceSection } from "./share-of-voice-section";
import { DataExportsSection } from "./data-exports-section";
import { CompetitorSnapshotSection } from "./competitor-snapshot-section";
import { GoogleSeoAeoSubnav } from "./google-seo-aeo-subnav";

export default async function GoogleSeoAeoPage() {
    const data = await loadGoogleSeoAeoPageData();

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Building2}
                title="Add a business to see your Google and AI visibility"
                description="This page looks at one location at a time. Create or select a business to get started."
            />
        );
    }

    if (data.kind === "no-platform") {
        return (
            <BusinessContextEmptyState
                icon={Plug}
                title="Connect Google Business Profile"
                description="Connect your Google Business Profile and we will score it, list what to fix in plain steps, and track how often AI assistants recommend you."
                hint=""
                primaryLabel="Connect Google"
                primaryHref="/settings/integrations"
                secondaryLabel="Back to dashboard"
                secondaryHref="/dashboard"
            />
        );
    }

    return (
        <div className="min-w-0 space-y-8 overflow-x-hidden p-4 md:p-8">
            <GoogleSeoAeoSubnav active="/google-seo-aeo" />
            <GoogleSeoAeoScoreAuditSection content={data.content} />
            {/*
             * Omitted entirely when the business has never been sampled. An empty
             * visibility card would read as "measured, and you are nowhere",
             * which is the opposite of "we have not looked yet".
             */}
            {data.content.aeoVisibility ? <AeoVisibilitySection content={data.content.aeoVisibility} /> : null}
            {data.content.searchConsole ? <SearchConsoleSection content={data.content.searchConsole} /> : null}
            {/* Comparison sits together: Google ratings first, then AI mentions. */}
            <CompetitorSnapshotSection content={data.content} />
            {data.content.shareOfVoice ? <ShareOfVoiceSection result={data.content.shareOfVoice} /> : null}
            <GoogleSeoAeoBottomSection content={data.content} />
            <DataExportsSection />
        </div>
    );
}
