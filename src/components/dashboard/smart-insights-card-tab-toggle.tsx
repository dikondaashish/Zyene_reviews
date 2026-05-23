interface SmartInsightsCardTabToggleProps {
    activeTab: "themes" | "suggestions";
    onTabChange: (tab: "themes" | "suggestions") => void;
}

export function SmartInsightsCardTabToggle({ activeTab, onTabChange }: SmartInsightsCardTabToggleProps) {
    return (
        <div className="flex items-center gap-2 mt-8 mb-6 relative z-10 bg-[rgb(244,236,224)] p-1 rounded-[12px] self-start inline-flex dark:bg-[rgb(30,41,59)] dark:ring-1 dark:ring-white/10">
            <button
                type="button"
                onClick={() => onTabChange("themes")}
                className={`px-4 py-1.5 rounded-[8px] text-[13px] font-semibold transition-colors ${
                    activeTab === "themes"
                        ? "bg-white text-foreground shadow-sm dark:bg-[rgb(51,65,85)] dark:text-[rgb(226,232,240)]"
                        : "text-muted-foreground hover:text-foreground dark:hover:text-[rgb(226,232,240)]"
                }`}
            >
                Key themes
            </button>
            <button
                type="button"
                onClick={() => onTabChange("suggestions")}
                className={`px-4 py-1.5 rounded-[8px] text-[13px] font-semibold transition-colors ${
                    activeTab === "suggestions"
                        ? "bg-white text-foreground shadow-sm dark:bg-[rgb(51,65,85)] dark:text-[rgb(226,232,240)]"
                        : "text-muted-foreground hover:text-foreground dark:hover:text-[rgb(226,232,240)]"
                }`}
            >
                Suggestions
            </button>
        </div>
    );
}
