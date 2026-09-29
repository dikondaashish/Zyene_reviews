import { ChartNoAxesCombined } from "lucide-react";

export const chartAxis = { fontSize: 12, fill: "var(--muted-foreground)" };
export const chartTooltipStyle = {
    backgroundColor: "var(--popover)", color: "var(--popover-foreground)",
    border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px",
    fontSize: 12, boxShadow: "0 4px 16px color-mix(in srgb, var(--foreground) 8%, transparent)",
};
export function chartDate(value: string | number, full = false) {
    const date = new Date(typeof value === "number" ? value : `${value.slice(0, 10)}T00:00:00Z`);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(full ? { year: "numeric" } : {}), timeZone: "UTC" });
}
export function ChartEmpty({ message }: { message: string }) {
    return <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg bg-muted/50 px-6 text-center">
        <ChartNoAxesCombined className="size-7 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">{message}</p>
        <p className="max-w-64 text-xs leading-relaxed text-muted-foreground">Try a longer date range or another connected platform.</p>
    </div>;
}
export function ChartKey({ label, color }: { label: string; color: string }) {
    return <span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ background: color }} />{label}</span>;
}
