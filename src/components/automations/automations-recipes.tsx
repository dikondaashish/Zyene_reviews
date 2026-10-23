import Link from "next/link";
import { ChevronRight, Download, Mail, MessageSquareReply, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AutomationsOverview } from "@/services/automations/load-automations-overview";

type Recipe = {
    icon: LucideIcon;
    title: string;
    when: string;
    on: boolean;
    stat: string;
    href: string;
};

function replyStat(pending: number, settings: AutomationsOverview["settings"]): string {
    if (pending > 0) return `${pending} waiting for your approval`;
    if (settings.replyRulesEnabled) return "Nothing waiting for approval";
    // Only the single switch is on: say plainly which reviews are left without a reply.
    if (settings.autoReplyEnabled) {
        const min = settings.autoReplyMinRating;
        return `Replying to ${min === 5 ? "5★" : `${min}★ and up`} only · set reply rules to cover lower ratings`;
    }
    return "Set a rule for each star rating";
}

function buildRecipes({ counts, settings }: AutomationsOverview, invoiceEnrollmentOn: boolean): Recipe[] {
    const replyOn = settings.replyRulesEnabled || settings.autoReplyEnabled;
    return [
        {
            icon: Send,
            title: "Review requests and reminders",
            when: "When a customer joins a campaign, we ask them for a review by text or email, then send polite reminders.",
            on: counts.activeCampaigns > 0,
            stat: `${counts.activeCampaigns} active campaign${counts.activeCampaigns === 1 ? "" : "s"} · ${counts.activeReminders} customers getting reminders`,
            href: "/campaigns",
        },
        {
            icon: MessageSquareReply,
            title: "Replies to new reviews",
            when: "When a new review arrives, we write a reply in your voice. You choose which ones need your approval first.",
            on: replyOn,
            stat: replyStat(counts.pendingApprovals, settings),
            href: counts.pendingApprovals > 0 ? "/reviews/approvals" : "/settings/reply-rules",
        },
        {
            icon: Download,
            title: "Customer list imports",
            when: "When you upload a customer list, we invite a few people each day so nobody gets flooded.",
            on: counts.activeImports > 0,
            stat: `${counts.activeImports} import${counts.activeImports === 1 ? "" : "s"} in progress`,
            href: "/campaigns",
        },
        {
            icon: Mail,
            title: "Invoice email sign-ups",
            when: "When you copy us on an invoice email, that customer is added to a campaign for you.",
            on: invoiceEnrollmentOn,
            stat: invoiceEnrollmentOn ? "Watching your invoice emails" : "Set up below",
            href: "#invoice-enrollment",
        },
    ];
}

/** Each automation as a plain "when this happens, we do that" sentence with its live state. */
export function AutomationsRecipes({ overview, invoiceEnrollmentOn }: { overview: AutomationsOverview; invoiceEnrollmentOn: boolean }) {
    return (
        <section aria-labelledby="automation-recipes-title" className="overflow-hidden rounded-xl border bg-card">
            <header className="border-b border-border px-5 py-4 sm:px-6">
                <h2 id="automation-recipes-title" className="ui-section-title">What runs for you</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Each automation works on its own once it is on. Click one to change it.
                </p>
            </header>
            <ul className="divide-y divide-border">
                {buildRecipes(overview, invoiceEnrollmentOn).map((recipe) => (
                    <li key={recipe.title}>
                        <Link
                            href={recipe.href}
                            className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 px-5 py-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none sm:px-6"
                        >
                            <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground" aria-hidden>
                                <recipe.icon className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="ui-card-title text-foreground">{recipe.title}</h3>
                                    <span
                                        className={cn(
                                            "rounded-full px-2 py-0.5 text-xs font-medium",
                                            recipe.on ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        {recipe.on ? "On" : "Off"}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{recipe.when}</p>
                                <p className="mt-1 text-sm font-medium text-foreground">{recipe.stat}</p>
                            </div>
                            <ChevronRight
                                className="mt-2 size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                                aria-hidden
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
