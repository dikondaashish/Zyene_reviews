import { cn } from "@/lib/utils";

export interface TagsStepStaffSectionProps {
    staffNames: string[];
    selectedStaff: string[];
    resolvedBrandColor: string;
    onToggleStaff: (name: string) => void;
}

export function TagsStepStaffSection({
    staffNames,
    selectedStaff,
    resolvedBrandColor,
    onToggleStaff,
}: TagsStepStaffSectionProps) {
    if (staffNames.length === 0) return null;

    return (
        <div className="pt-3 border-t border-border dark:border-white/10">
            <p className="text-center text-sm font-medium text-foreground mb-2">
                Who served you?{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
            </p>
            <div className="flex flex-wrap justify-center gap-2">
                {staffNames.map((name) => (
                    <button
                        key={name}
                        type="button"
                        onClick={() => onToggleStaff(name)}
                        className={cn(
                            "flex items-center gap-1.5 px-3.5 py-2 min-h-10 rounded-full text-sm font-medium transition-all duration-200",
                            "border-2 active:scale-95",
                            selectedStaff.includes(name)
                                ? "text-primary-foreground dark:text-white dark:border-white/25 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.45)] scale-105 shadow-md"
                                : "bg-background text-muted-foreground border-border hover:bg-muted dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:hover:bg-[rgb(51,65,85)]"
                        )}
                        style={{
                            backgroundColor: selectedStaff.includes(name) ? resolvedBrandColor : undefined,
                            borderColor: selectedStaff.includes(name) ? resolvedBrandColor : undefined,
                        }}
                    >
                        <span>👤</span>
                        {name}
                    </button>
                ))}
            </div>
        </div>
    );
}
