export interface RatingStepBusinessHeaderProps {
    businessName: string;
    logoUrl?: string;
    initials: string;
    resolvedBrandColor: string;
    ratingSubtitle?: string;
}

export function RatingStepBusinessHeader({
    businessName,
    logoUrl,
    initials,
    resolvedBrandColor,
    ratingSubtitle,
}: RatingStepBusinessHeaderProps) {
    return (
        <div className="flex flex-col items-center gap-4">
            {logoUrl ? (
                <div className="rounded-full border-4 border-background overflow-hidden bg-background dark:bg-[rgb(30,41,59)] dark:border-[rgb(30,41,59)] size-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt={businessName} className="object-cover size-full" />
                </div>
            ) : (
                <div
                    className="rounded-2xl flex items-center justify-center shadow-lg text-primary-foreground size-20"
                    style={{ backgroundColor: resolvedBrandColor }}
                >
                    <span className="text-2xl font-bold">{initials}</span>
                </div>
            )}
            <div className="text-center">
                <h1 className="text-xl font-bold text-foreground mb-1">{businessName}</h1>
                <p className="text-muted-foreground text-sm">{ratingSubtitle || "Your feedback means a lot to us!"}</p>
            </div>
        </div>
    );
}
