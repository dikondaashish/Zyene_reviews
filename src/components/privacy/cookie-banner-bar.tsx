"use client";

import { Button } from "@/components/ui/button";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

/**
 * First-visit notice for opt-in regions. Not modal: the page stays usable.
 * "Reject non-essential" and "Accept all" share one style and size so neither
 * choice is nudged; nothing optional runs until one of them is chosen.
 */
export function CookieBannerBar({
    onCustomize,
    onReject,
    onAccept,
}: {
    onCustomize: () => void;
    onReject: () => void;
    onAccept: () => void;
}) {
    return (
        <section
            role="region"
            aria-labelledby="cookie-banner-title"
            aria-describedby="cookie-banner-body"
            className="fixed inset-x-0 bottom-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 animate-in slide-in-from-bottom-5 duration-500"
        >
            <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-lg md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <h2 id="cookie-banner-title" className="text-sm font-semibold text-foreground">
                        Your privacy choices
                    </h2>
                    <p id="cookie-banner-body" className="mt-1 max-w-[520px] text-xs text-muted-foreground">
                        We use essential cookies to keep you signed in and secure. With your OK we&apos;d also use
                        cookies for extra features, analytics and ads measurement. Your choice applies across all
                        Zyene Reviews sites.{" "}
                        <a href={`${MARKETING_SITE_ORIGIN}/privacy#cookies`} className="underline underline-offset-2">
                            Cookie policy
                        </a>
                    </p>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:items-center">
                    <Button variant="ghost" className="col-span-2 min-h-11 sm:min-h-9" onClick={onCustomize}>
                        Customize
                    </Button>
                    <Button variant="outline" className="min-h-11 sm:min-h-9" onClick={onReject}>
                        Reject non-essential
                    </Button>
                    <Button variant="outline" className="min-h-11 sm:min-h-9" onClick={onAccept}>
                        Accept all
                    </Button>
                </div>
            </div>
        </section>
    );
}
