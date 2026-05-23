export interface TagsStepProgressHeaderProps {
    resolvedBrandColor: string;
    tagsHeading?: string;
    tagsSubheading?: string;
}

export function TagsStepProgressHeader({
    resolvedBrandColor,
    tagsHeading,
    tagsSubheading,
}: TagsStepProgressHeaderProps) {
    return (
        <>
            <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: resolvedBrandColor }} />
                <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: resolvedBrandColor }} />
                <div className="h-1.5 flex-1 bg-muted rounded-full dark:bg-[rgb(51,65,85)]" />
            </div>

            <div className="text-center space-y-0.5">
                <h2 className="text-xl font-bold text-foreground leading-snug">
                    {tagsHeading || "What did you like most?"}
                </h2>
                <p className="text-muted-foreground text-xs">
                    {tagsSubheading || "Tap to select what stood out"}
                </p>
            </div>
        </>
    );
}
