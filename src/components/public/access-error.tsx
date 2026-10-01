import { ChevronDown } from "lucide-react";
import { ZyeneReviewsLogoLink } from "@/components/brand/zyene-reviews-logo-link";
import { AccessErrorMascot } from "@/components/public/access-error-mascot";
import { AccessErrorOwner } from "@/components/public/access-error-owner";
import { InactivePageStarGame } from "@/components/public/inactive-page-star-game";

interface AccessErrorProps {
    type: "subscription" | "platform";
    businessName: string;
}

export function AccessError({ type, businessName }: AccessErrorProps) {
    const isSubscription = type === "subscription";

    return (
        <main data-app-palette className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-8 sm:px-6 sm:py-10">
            <div className="w-full max-w-[480px] space-y-5">
                <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-labelledby="review-access-heading">
                    <div className="px-6 pb-7 pt-6 text-center sm:px-8 sm:pt-7">
                        <div className="flex items-start justify-between gap-3 text-left">
                            <p className="min-w-0 break-words text-sm font-semibold leading-5 text-foreground">{businessName}</p>
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                <span className="size-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
                                {isSubscription ? "Inactive" : "Setup needed"}
                            </span>
                        </div>
                        <AccessErrorMascot />
                        <h1 id="review-access-heading" className="mx-auto max-w-[20ch] text-balance text-[28px] font-semibold leading-[1.2] tracking-tight text-foreground sm:text-[30px]">
                            {isSubscription ? "This review page is inactive" : "This review page isn’t ready yet"}
                        </h1>
                        <p className="mx-auto mt-3 max-w-[36ch] text-pretty text-sm leading-6 text-muted-foreground">
                            {isSubscription
                                ? "This page can’t collect reviews right now. The business owner can help get it ready."
                                : "A Google Business Profile still needs connecting. The business owner can help get this page ready."}
                        </p>
                    </div>

                    <AccessErrorOwner isSubscription={isSubscription} />
                    <details className="group border-t border-border">
                        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring sm:px-8 [&::-webkit-details-marker]:hidden">
                            Here to leave a review?
                            <ChevronDown className="size-4 shrink-0 group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <p className="px-6 pb-5 text-sm leading-6 text-muted-foreground sm:px-8">
                            You can still share feedback with the business directly. Let the owner know this page needs activating with a message below.
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
