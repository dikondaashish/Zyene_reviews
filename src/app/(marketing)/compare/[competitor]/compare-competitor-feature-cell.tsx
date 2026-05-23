import { Check, X } from "lucide-react";

export function FeatureCellValue({ value }: { value: boolean | string }) {
    if (value === true) return <Check className="h-5 w-5 text-primary mx-auto" />;
    if (value === false) return <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
    return <span className="text-xs text-muted-foreground text-center block leading-tight">{value}</span>;
}
