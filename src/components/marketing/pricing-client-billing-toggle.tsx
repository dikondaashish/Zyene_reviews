"use client";

export function BillingToggle({
    interval,
    onChange,
}: {
    interval: "month" | "year";
    onChange: (v: "month" | "year") => void;
}) {
    return (
        <div className="flex items-center justify-center gap-4">
            <span
                className={`text-sm font-medium transition-colors ${
                    interval === "month" ? "text-foreground" : "text-muted-foreground"
                }`}
            >
                Monthly
            </span>
            <button
                type="button"
                onClick={() => onChange(interval === "month" ? "year" : "month")}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    interval === "year" ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                aria-pressed={interval === "year"}
                aria-label="Toggle billing interval"
            >
                <span
                    className={`inline-block transform rounded-full bg-white shadow-sm transition-transform ${ interval === "year" ? "translate-x-8" : "translate-x-1" } size-5`}
                />
            </button>
            <span
                className={`text-sm font-medium transition-colors ${
                    interval === "year" ? "text-foreground" : "text-muted-foreground"
                }`}
            >
                Annual
                <span className="ml-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                    Save 17%
                </span>
            </span>
        </div>
    );
}
