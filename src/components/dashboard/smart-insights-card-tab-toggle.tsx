interface SmartInsightsCardTabToggleProps {
    activeTab: "themes" | "suggestions";
    onTabChange: (tab: "themes" | "suggestions") => void;
}

export function SmartInsightsCardTabToggle({ activeTab, onTabChange }: SmartInsightsCardTabToggleProps) {
    return (
        <div className="flex items-center gap-2 mt-8 mb-6 relative z-10 bg-secondary p-1 rounded-[12px] self-start inline-flex">
            <button
                type="button"
                aria-pressed={activeTab === "themes"}
                onClick={() => onTabChange("themes")}
                className={`min-h-11 px-4 py-2 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-[8px] text-[13px] font-semibold transition-colors ${
                    activeTab === "themes"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                Key themes
            </button>
            <button
                type="button"
                aria-pressed={activeTab === "suggestions"}
                onClick={() => onTabChange("suggestions")}
                className={`min-h-11 px-4 py-2 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-[8px] text-[13px] font-semibold transition-colors ${
                    activeTab === "suggestions"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                Suggestions
            </button>
        </div>
    );
}
