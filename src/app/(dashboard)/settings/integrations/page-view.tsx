import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { ZapierSignUpPrefill } from "@/components/integrations/zapier-workflow-embed";
import { Plug } from "lucide-react";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { loadIntegrationsPageData } from "./load-integrations-page-data";
import { IntegrationsPageHeader } from "./integrations-page-header";
import { IntegrationsReviewPlatformsSection } from "./integrations-review-platforms-section";
import {
    IntegrationsDeveloperApiSection,
    IntegrationsPosAutomationSection,
    IntegrationsWebsiteElementsSection,
} from "./integrations-pos-developer-sections";

/** Prefill for Zapier Quick Account Creation; it needs email plus first and last name. */
function zapierSignUpFromUser(user: User): ZapierSignUpPrefill {
    const meta = user.user_metadata ?? {};
    const [first, ...rest] = String(meta.full_name ?? "").trim().split(/\s+/);
    return {
        email: user.email ?? null,
        firstName: meta.first_name || first || null,
        lastName: meta.last_name || rest.join(" ") || null,
    };
}

export default async function IntegrationsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const data = await loadIntegrationsPageData();

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Plug}
                title="Add a business to manage integrations"
                description="Connect Google, Yelp, Facebook, and more once you have at least one business location in Zyene."
            />
        );
    }

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-10 overflow-x-hidden p-4 sm:p-6 lg:gap-10 lg:p-8">
            <IntegrationsPageHeader
                connectedCount={data.connectedCount}
                totalReviews={data.totalReviews}
            />
            <IntegrationsReviewPlatformsSection data={data} />
            <hr className="border-border/50" />
            <IntegrationsPosAutomationSection
                apiKey={data.apiKey}
                businessId={data.business.id}
                cloverConnection={data.cloverConnection}
                cloverConfigured={data.cloverConfigured}
                squareConnection={data.squareConnection}
                squareConfigured={data.squareConfigured}
            />
            <hr className="border-border/50" />
            <IntegrationsDeveloperApiSection data={data} zapierSignUp={zapierSignUpFromUser(user)} />
            <hr className="border-border/50" />
            <IntegrationsWebsiteElementsSection data={data} />
        </div>
    );
}
