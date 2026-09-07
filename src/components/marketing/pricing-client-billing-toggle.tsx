"use client";

export function BillingToggle({ interval, onChange }: {
    interval: "month" | "year";
    onChange: (value: "month" | "year") => void;
}) {
    return (
        <fieldset className="shrink-0">
            <legend className="mb-2 text-sm font-medium">Billing period</legend>
            <div className="inline-flex rounded-xl border border-border bg-muted p-1">
                {([{ value: "month", label: "Monthly" }, { value: "year", label: "Yearly · Save 17%" }] as const).map(({ value, label }) => (
                    <label key={value} className="cursor-pointer">
                        <input type="radio" name="billing-period" value={value} checked={interval === value} onChange={() => onChange(value)} className="peer sr-only" />
                        <span className="block rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">{label}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
