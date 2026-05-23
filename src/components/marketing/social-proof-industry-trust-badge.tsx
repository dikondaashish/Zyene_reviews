import { Building2 } from "lucide-react";

export function IndustryTrustBadge({ label }: { label: string }) {
    return (
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-full">
            <Building2 className="text-primary size-3.5" />
            {label}
        </div>
    );
}
