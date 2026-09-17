import { Check, Minus } from "lucide-react";

export function FeatureAvailability({ value }: { value: boolean | string }) {
    if (typeof value === "string") return <span className="block text-center text-xs leading-relaxed text-muted-foreground">{value}</span>;
    const Icon = value ? Check : Minus;
    return (
        <span className={`relative flex justify-center ${value ? "text-primary" : "text-muted-foreground"}`}>
            <Icon className="size-5" aria-hidden="true" />
            <span className="sr-only">{value ? "Yes" : "No"}</span>
        </span>
    );
}
