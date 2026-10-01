import Link from "next/link";
import { ArrowRight, Building2, MessageSquareOff, PlugZap } from "lucide-react";
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
        <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-10 sm:px-6 sm:py-16">
            <div className="w-full max-w-lg space-y-6">
                <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm" aria-labelledby="review-access-heading">
                    <div className="px-6 pb-8 pt-9 text-center sm:px-10 sm:pt-10">
                        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                            <StatusIcon className="size-7" strokeWidth={1.5} aria-hidden="true" />
                        </div>
                        <p className="mb-3 break-words text-sm font-medium text-muted-foreground">{businessName}</p>
                        <h1 id="review-access-heading" className="text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                            {isSubscription ? "This review page is inactive" : "This review page isn’t ready yet"}
                        </h1>
                        <p className="mx-auto mt-4 max-w-sm text-pretty text-sm leading-6 text-muted-foreground">
                            Reviews aren’t available through this page right now.
                            You can contact the business directly to share your feedback.
                        </p>
                    </div>

                    <InactivePageStarGame businessName={businessName} />

                    <section className="border-t border-border bg-muted/30 px-6 py-6 sm:px-10 sm:py-7" aria-labelledby="review-owner-heading">
                        <div className="mb-2 flex items-center gap-2">
                            <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                            <h2 id="review-owner-heading" className="text-sm font-semibold text-foreground">Are you the business owner?</h2>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {isSubscription
                                ? "Your current plan doesn’t include public review collection. Upgrade to activate this page and start collecting customer reviews."
                                : "Connect your Google Business Profile to activate this page and start collecting customer reviews."}
                        </p>
                        <Button asChild className="mt-5 min-h-11 w-full gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90">
                            <Link href={isSubscription ? "https://app.zyenereviews.com/settings/billing" : "https://app.zyenereviews.com/onboarding"}>
                                {isSubscription ? "Upgrade subscription" : "Connect Google Profile"}
                                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                            </Link>
                        </Button>
                        <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Sign in to your business account to continue.</p>
                    </section>
                </article>

                <footer className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span>Powered by</span>
                    <ZyeneReviewsLogoLink href="https://zyenereviews.com" size={20} wordmarkClassName="text-sm" className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" />
                </footer>
            </div>
        </main>
    );
}
