import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { SmartInsightsSuggestion, SmartInsightsTheme } from "./smart-insights-card-types";

interface SmartInsightsCardExamplesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examplesSuggestion: SmartInsightsSuggestion | null;
    exampleThemes: SmartInsightsTheme[];
}

export function SmartInsightsCardExamplesDialog({
    open,
    onOpenChange,
    examplesSuggestion,
    exampleThemes,
}: SmartInsightsCardExamplesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>What guests said</DialogTitle>
                    {examplesSuggestion ? (
                        <>
                            <p className="text-left text-sm font-medium text-foreground pt-1">
                                {examplesSuggestion.title}
                            </p>
                            <DialogDescription className="text-left">
                                {examplesSuggestion.description}
                            </DialogDescription>
                        </>
                    ) : null}
                </DialogHeader>
                <div className="space-y-6 pt-2">
                    {exampleThemes.map((theme, ti) => {
                        const quotes = theme.customerQuotes?.filter((q) => q.trim()) ?? [];
                        return (
                            <div key={`${theme.name}-${ti}`} className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">{theme.name}</span>
                                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-[rgb(51,65,85)] dark:text-[rgb(203,213,225)]">
                                        {theme.mentions} mentions
                                    </span>
                                </div>
                                {quotes.length > 0 ? (
                                    <ul className="space-y-2">
                                        {quotes.map((q, qi) => (
                                            <li
                                                key={qi}
                                                className="border-l-[3px] border-[rgba(64,86,66,0.45)] bg-[rgb(252,250,247)] py-2.5 pl-3 pr-3 text-[13px] leading-relaxed text-foreground/85 dark:border-[rgba(148,163,184,0.5)] dark:bg-[rgb(15,23,42)] dark:text-[rgb(226,232,240)]"
                                            >
                                                &ldquo;{q}&rdquo;
                                            </li>
                                        ))}
                                    </ul>
                                ) : theme.summaryQuote ? (
                                    <p className="border-l-[3px] border-border py-2 pl-3 text-[13px] italic text-muted-foreground">
                                        {theme.summaryQuote}
                                    </p>
                                ) : null}
                            </div>
                        );
                    })}
                    {examplesSuggestion &&
                        exampleThemes.length > 0 &&
                        !exampleThemes.some((t) => (t.customerQuotes?.length ?? 0) > 0) && (
                            <p className="text-xs text-muted-foreground">
                                Detailed quotes were not stored for these themes. Showing summaries from your
                                insights instead.
                            </p>
                        )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
