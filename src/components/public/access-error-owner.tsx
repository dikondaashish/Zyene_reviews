import Link from "next/link";
import { ArrowRight, Building2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessErrorOwner({ isSubscription }: { isSubscription: boolean }) {
    return (
        <section className="border-t border-border bg-canvas-elevated px-6 py-6 sm:px-8" aria-labelledby="review-owner-heading">
            <div className="mb-2 flex items-center gap-2">
                <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <h2 id="review-owner-heading" className="text-base font-semibold text-foreground">Are you the business owner?</h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
                {isSubscription
                    ? "Upgrade to a plan with review collection to activate this page and welcome customer feedback."
                    : "Connect your Google Business Profile to activate this page and start collecting customer feedback."}
            </p>
            <Button asChild className="mt-5 min-h-12 w-full justify-between gap-2 whitespace-normal rounded-lg px-4 text-[19px] font-bold text-primary-foreground transition-colors hover:brightness-95 motion-safe:active:scale-[0.98]">
                <Link href={isSubscription ? "https://app.zyenereviews.com/settings/billing" : "https://app.zyenereviews.com/onboarding"}>
                    {isSubscription ? "Upgrade to activate" : "Connect Google Profile"}
                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
            </Button>
            <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-xs leading-5 text-muted-foreground">
                <LockKeyhole className="mt-1 size-3 shrink-0" aria-hidden="true" />
                Sign in to your business account to continue.
            </p>
        </section>
    );
}
