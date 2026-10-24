import { ZyeneReviewsLogoMark } from "@/components/brand/zyene-reviews-logo-mark";

/** The setup assistant talking to the owner: avatar, name, then the message in a speech bubble. */
export function OnboardingGuideMessage({ message }: { message: string }) {
    return (
        <div className="flex items-start gap-3" aria-live="polite">
            <ZyeneReviewsLogoMark size={36} className="rounded-full" />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Zyene assistant</p>
                <p className="mt-1 rounded-xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm">
                    {message}
                </p>
            </div>
        </div>
    );
}
