import { Building2 } from "lucide-react";

type IndustryTrustBadgeProps = {
    label: string;
    variant?: "default" | "onDark";
};

export function IndustryTrustBadge({ label, variant = "default" }: IndustryTrustBadgeProps) {
    const className =
        variant === "onDark"
            ? "inline-flex items-center gap-2 text-xs font-semibold text-primary-foreground/90 bg-primary-foreground/10 border border-primary-foreground/20 px-3 py-1.5 rounded-full backdrop-blur-sm"
            : "inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-full";

    return (
        <div className={className}>
            <Building2 className="text-primary size-3.5" />
            {label}
        </div>
    );
}
