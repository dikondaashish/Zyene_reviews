import { readableForeground } from "@/lib/design/contrast";
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
            <div className="flex items-center gap-2" role="img" aria-label="Step 2 of 3">
                <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: resolvedBrandColor, color: readableForeground(resolvedBrandColor) }} />
                <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: resolvedBrandColor, color: readableForeground(resolvedBrandColor) }} />
                <div className="h-1.5 flex-1 bg-muted rounded-full dark:bg-[rgb(51,65,85)]" />
            </div>

            <div className="text-center space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                    {tagsHeading || "What did you like most?"}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {tagsSubheading || "Choose one or more things that stood out"}
                </p>
            </div>
        </>
    );
}
