import Link from "next/link";
import { ArrowRight, Building2, MessageSquareOff, PlugZap, ChevronDown, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZyeneReviewsLogoLink } from "@/components/brand/zyene-reviews-logo-link";
import { InactivePageStarGame } from "@/components/public/inactive-page-star-game";

interface AccessErrorProps {
    type: "subscription" | "platform";
    businessName: string;
}

export function AccessError({ type, businessName }: AccessErrorProps) {
    const isSubscription = type === "subscription";
    const StatusIcon = isSubscription ? MessageSquareOff : PlugZap;

    return (
        <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8 sm:px-6 sm:py-12">
            <div className="w-full max-w-[480px] space-y-5">
                <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_40px_-16px_rgba(0,0,0,0.12)]" aria-labelledby="review-access-heading">
                    <div className="px-6 pb-7 pt-7 sm:px-8 sm:pt-8">
                        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <StatusIcon className="size-6" strokeWidth={1.5} aria-hidden="true" />
                        </div>
                        <div className="mb-3 flex flex-wrap items-center gap-2.5">
                            <p className="break-words text-sm font-semibold text-foreground">{businessName}</p>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                <span className="size-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
                                {isSubscription ? "Inactive" : "Setup needed"}
                            </span>
                        </div>
                        <h1 id="review-access-heading" className="max-w-sm text-balance text-[28px] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-[32px]">
                            {isSubscription ? "This review page is inactive" : "This review page isn’t ready yet"}
                        </h1>
                        <p className="mt-4 max-w-sm text-pretty text-sm leading-6 text-muted-foreground">
                            {isSubscription
                                ? "This business’s current plan doesn’t include public review collection."
                                : "This business hasn’t connected its Google Business Profile yet."}
                        </p>
                    </div>

                    <section className="border-t border-border bg-muted/20 px-6 py-6 sm:px-8" aria-labelledby="review-owner-heading">
                        <div className="mb-2 flex items-center gap-2">
                            <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                            <h2 id="review-owner-heading" className="text-sm font-semibold text-foreground">Are you the business owner?</h2>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {isSubscription
                                ? "Upgrade your subscription to activate this page and let customers share their experiences."
                                : "Connect your Google Business Profile to activate this page and start collecting customer reviews."}
                        </p>
                        <Button asChild className="mt-5 min-h-12 w-full justify-between gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90">
                            <Link href={isSubscription ? "https://app.zyenereviews.com/settings/billing" : "https://app.zyenereviews.com/onboarding"}>
                                {isSubscription ? "Upgrade subscription" : "Connect Google Profile"}
                                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                            </Link>
                        </Button>
                        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs leading-5 text-muted-foreground">
                            <LockKeyhole className="size-3" aria-hidden="true" /> Sign in to your business account to continue.
                        </p>
                    </section>
                    <details className="group border-t border-border">
                        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring sm:px-8 [&::-webkit-details-marker]:hidden">
                            Here to leave a review?
                            <ChevronDown className="size-4 shrink-0 group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <p className="px-6 pb-5 text-sm leading-6 text-muted-foreground sm:px-8">
                            Contact the business directly to share your feedback, or copy a message below to let the owner know this page needs activating.
                        </p>
                        <InactivePageStarGame businessName={businessName} />
                    </details>
                </article>

                <footer className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span>Powered by</span>
                    <ZyeneReviewsLogoLink href="https://zyenereviews.com" size={20} wordmarkClassName="text-sm" className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" />
                </footer>
            </div>
        </main>
    );
}
