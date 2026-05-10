import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plug } from "lucide-react";
import { siZapier } from "simple-icons";

import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { getAppBaseUrl } from "@/config/env";

import { ZapierSetupClient } from "./zapier-setup-client";
import { ZapierPartnerTilesCard } from "./zapier-partner-tiles-card";

/**
 * Dedicated Zapier setup page. The Integrations index has a small Zapier card;
 * this is the deep, step-by-step page linked from that card and from docs.
 *
 * The page is a Server Component so we can resolve the active business + API key
 * on the server, then hand off to a small Client Component for copy buttons.
 */
export default async function ZapierIntegrationPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    const { business } = await getActiveBusinessId();

    if (!business) {
        return (
            <BusinessContextEmptyState
                icon={Plug}
                title="Add a business to set up Zapier"
                description="Zapier sends review-request triggers into a specific business. Add or pick a business first."
            />
        );
    }

    // The same `api` platform row that the Integrations page reads. We can't
    // call the rich `getActiveBusinessId` helper just for this — read the
    // platform directly so this page works even after the cache cycles.
    const { data: apiPlatform } = await supabase
        .from("review_platforms")
        .select("external_id, sync_status")
        .eq("business_id", business.id)
        .eq("platform", "api")
        .maybeSingle();

    const apiKey =
        apiPlatform?.sync_status === "active" && apiPlatform?.external_id
            ? apiPlatform.external_id
            : null;

    const appBaseUrl = getAppBaseUrl();

    return (
        <div className="flex flex-1 flex-col gap-10 p-4 sm:p-6 lg:p-8">
            <div className="space-y-4">
                <Link
                    href="/integrations"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Integrations
                </Link>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-white shadow-sm ring-1 ring-border dark:bg-white">
                            <svg
                                role="img"
                                viewBox="0 0 24 24"
                                className="h-8 w-8"
                                aria-hidden
                            >
                                <title>{siZapier.title}</title>
                                <path fill={`#${siZapier.hex}`} d={siZapier.path} />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Zapier
                            </h1>
                            <p className="mt-1 max-w-2xl text-muted-foreground sm:text-base">
                                Connect 5,000+ apps. When a job finishes in your POS or CRM,
                                Zapier sends the customer details to Zyene and we send the
                                review request automatically.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ZapierSetupClient
                appBaseUrl={appBaseUrl}
                apiKey={apiKey}
                businessId={business.id}
            >
                <ZapierPartnerTilesCard />
            </ZapierSetupClient>
        </div>
    );
}
