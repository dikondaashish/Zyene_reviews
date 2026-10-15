"use client";

import { Button } from "@/components/ui/button";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

/**
 * First-visit notice. Reject and Accept share one style and size so neither
 * choice is nudged (EDPB/ICO "equal prominence"); nothing non-essential runs
 * until one of them is clicked.
 */
export function CookieBannerBar({
    onManage,
    onReject,
    onAccept,
}: {
    onManage: () => void;
    onReject: () => void;
    onAccept: () => void;
}) {
    return (
        <section
            aria-label="Cookie consent"
            className="fixed inset-x-0 bottom-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500"
        >
            <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">We value your privacy</p>
                    <p className="mt-1 max-w-[520px] text-xs text-muted-foreground">
                        Essential cookies keep you signed in and secure. With your permission we also use analytics
                        (Google Analytics, error replays) and marketing (Meta Pixel, campaign attribution) cookies.
                        Your choice applies across all Zyene Reviews sites.{" "}
                        <a href={`${MARKETING_SITE_ORIGIN}/privacy#cookies`} className="underline underline-offset-2">
                            Cookie policy
                        </a>
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                    <Button variant="ghost" size="sm" onClick={onManage}>
                        Customize
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={onReject}>
                        Reject all
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={onAccept}>
                        Accept all
                    </Button>
                </div>
            </div>
        </section>
    );
}
