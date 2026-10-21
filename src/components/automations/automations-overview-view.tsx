import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { AutomationsOverview } from "@/services/automations/load-automations-overview";
import type { InboundSettings } from "@/services/enrollment/inbound-settings-api";
import { AutomationsSwitches } from "./automations-switches";
import { AutomationsActivity } from "./automations-activity";
import { InboundEnrollmentCard } from "./inbound-enrollment-card";

function StatCard({ title, value, detail, href }: { title: string; value: string | number; detail: string; href: string }) {
    return (
        <Link href={href} className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/40">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </Link>
    );
}

export function AutomationsOverviewView({
    businessId, overview, inbound, campaigns, canManage,
}: {
    businessId: string; overview: AutomationsOverview; inbound: InboundSettings;
    campaigns: { id: string; name: string; status: string }[]; canManage: boolean;
}) {
    const { counts, settings } = overview;
    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            <div>
                <h1 className="ui-page-title">Automations</h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    Everything that sends or replies for you: review requests, reminders, imports and review replies.
                </p>
            </div>

            {overview.actions.length > 0 && (
                <section aria-label="Needs your attention" className="space-y-2 rounded-lg border border-warning/40 bg-warning/5 p-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold"><AlertCircle className="size-4" />Needs your attention</h2>
                    <ul className="space-y-1 text-sm">
                        {overview.actions.map((a) => <li key={a.title}><Link className="underline" href={a.href}>{a.title}</Link></li>)}
                    </ul>
                </section>
            )}

            <AutomationsSwitches businessId={businessId} settings={settings} canManage={canManage} />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Active campaigns" value={counts.activeCampaigns} detail={`${counts.activeReminders} customers with reminders pending`} href="/campaigns" />
                <StatCard title="Scheduled next 7 days" value={counts.upcoming} detail="Queued requests, including quiet-hours delays" href="/requests" />
                <StatCard title="Reply rules" value={settings.replyRulesEnabled ? "On" : settings.autoReplyEnabled ? "Legacy auto-reply" : "Off"}
                    detail={`${counts.pendingApprovals} waiting for approval`} href={counts.pendingApprovals ? "/reviews/approvals" : "/settings/reply-rules"} />
                <StatCard title="Gradual imports" value={counts.activeImports} detail="Enrolling a few contacts per day" href="/campaigns" />
            </div>

            <InboundEnrollmentCard businessId={businessId} initial={inbound} campaigns={campaigns} canManage={canManage} />
            <AutomationsActivity overview={overview} />
        </div>
    );
}
