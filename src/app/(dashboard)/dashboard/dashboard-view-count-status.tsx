import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** A count that is either "all good" (green tick) or a problem to fix (amber/red warning). */
export function CountStatus({ count, okLabel, problemTone }: { count: number; okLabel: string; problemTone: "ok" | "bad" }) {
    if (count === 0) {
        return (
            <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="size-6" aria-hidden />
                <span className="text-2xl font-bold">0</span>
                <span className="text-sm font-semibold">{okLabel}</span>
            </div>
        );
    }
    return (
        <div className={cn("flex items-center gap-2", problemTone === "bad" ? "text-destructive" : "text-warning-foreground")}>
            <AlertTriangle className="size-6" aria-hidden />
            <span className="text-2xl font-bold tabular-nums">{count.toLocaleString("en-US")}</span>
            <span className="text-sm font-semibold">to fix</span>
        </div>
    );
}
