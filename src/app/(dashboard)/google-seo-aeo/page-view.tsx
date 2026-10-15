import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { Building2, Plug } from "lucide-react";
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
            <BusinessContextEmptyState
                icon={Plug}
                title="Connect Google Business Profile"
                description="We read your Google profile to score it, find what to fix, and track how AI answers mention you."
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
            {data.content.shareOfVoice ? <ShareOfVoiceSection result={data.content.shareOfVoice} /> : null}
            {data.content.searchConsole ? <SearchConsoleSection content={data.content.searchConsole} /> : null}
            <GoogleSeoAeoBottomSection content={data.content} />
            <DataExportsSection />
        </div>
    );
}
