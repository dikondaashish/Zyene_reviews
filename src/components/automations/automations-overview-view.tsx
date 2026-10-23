import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AutomationsOverview } from "@/services/automations/load-automations-overview";
import type { InboundSettings } from "@/services/enrollment/inbound-settings-api";
import type { SetupProgress } from "@/lib/automations/setup-progress";
import { AutomationSetupTracker } from "./automation-setup-tracker";
import { AutomationsSwitches } from "./automations-switches";
import { AutomationsActivity } from "./automations-activity";
import { AutomationsRecipes } from "./automations-recipes";
import { AutomationsStatusPanel } from "./automations-status-panel";
import { InboundEnrollmentCard } from "./inbound-enrollment-card";
import { GetReviewsTabs } from "@/components/dashboard/get-reviews-tabs";

/** Reads top to bottom as: is it working, what runs, how it sends, what happened. */
export function AutomationsOverviewView({
    businessId, overview, inbound, campaigns, canManage, setup,
}: {
    businessId: string; overview: AutomationsOverview; inbound: InboundSettings;
    campaigns: { id: string; name: string; status: string }[]; canManage: boolean;
    setup: SetupProgress | null;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-8 p-4 md:p-8">
            <GetReviewsTabs active="/automations" />
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="ui-page-title">Automations</h1>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                        The work Zyene does for you in the background: asking customers for reviews, following up, and replying to
                        reviews. Check here that everything is running.
                    </p>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                    <Link href="/automations/calendar"><CalendarDays className="size-4" aria-hidden />Calendar</Link>
                </Button>
            </header>

            {setup && <AutomationSetupTracker progress={setup} />}
            <AutomationsStatusPanel overview={overview} />
            <AutomationsRecipes overview={overview} invoiceEnrollmentOn={inbound.enabled && inbound.configured} />
            <AutomationsSwitches businessId={businessId} settings={overview.settings} canManage={canManage} />
            <AutomationsActivity overview={overview} />
            <InboundEnrollmentCard businessId={businessId} initial={inbound} campaigns={campaigns} canManage={canManage} />
        </div>
    );
}
