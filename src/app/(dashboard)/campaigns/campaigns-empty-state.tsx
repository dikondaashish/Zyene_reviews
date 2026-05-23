import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaigns/templates";
import { CampaignTemplateCard } from "@/components/campaigns/campaign-template-card";

export function CampaignsEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-br from-background to-primary/10 rounded-3xl border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 size-64" />
            <div className="absolute bottom-0 left-0 bg-chart-1/15/10 dark:bg-chart-1/10 rounded-full blur-3xl -ml-32 -mb-32 size-64" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                <div className="bg-gradient-to-tr from-primary to-primary/80 rounded-3xl flex items-center justify-center mb-8 rotate-3 transform transition-transform hover:rotate-0 duration-500 size-24">
                    <Megaphone className="text-primary-foreground size-12" />
                </div>

                <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
                    Your first review is just one campaign away
                </h3>

                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                    Automate your review requests and watch your reputation grow. Set up a campaign in minutes and let Zyene do the heavy lifting.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
                    <Button size="lg" className="h-14 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
                        <Link href="/campaigns/new">
                            <Plus className="mr-2 size-5" />
                            Launch New Campaign
                        </Link>
                    </Button>
                </div>

                <div className="mt-16 w-full max-w-4xl">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-px w-8 bg-primary/30" />
                        <span className="text-primary font-semibold uppercase tracking-wider text-xs">
                            Or Quick Start with a Template
                        </span>
                        <div className="h-px w-8 bg-primary/30" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                        {CAMPAIGN_TEMPLATES.map((template) => (
                            <CampaignTemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                </div>

                <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="bg-chart-2/100 rounded-full size-1.5" />
                        Automated SMS/Email
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary rounded-full size-1.5" />
                        Smart Triggers
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary rounded-full size-1.5" />
                        Real-time Tracking
                    </div>
                </div>
            </div>
        </div>
    );
}
