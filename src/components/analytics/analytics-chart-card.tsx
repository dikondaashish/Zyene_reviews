import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnalyticsChartCard({ title, description, icon: Icon, children, className }: {
    title: string; description: string; icon: LucideIcon; children: ReactNode; className?: string;
}) {
    return <section className={cn("min-w-0 rounded-xl border border-border bg-card", className)}>
        <header className="flex items-start gap-3 border-b border-border px-5 py-5 sm:px-6">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" strokeWidth={1.75} aria-hidden /></span>
            <div className="min-w-0 space-y-1.5">
                <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
                <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
        </header>
        <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>;
}
