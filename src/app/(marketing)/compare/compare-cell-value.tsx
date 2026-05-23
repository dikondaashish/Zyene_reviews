import { Check, X } from "lucide-react";

export function CellValue({ value }: { value: boolean | string }) {
    if (value === true) return <Check className="text-primary mx-auto size-5" />;
    if (value === false) return <X className="text-muted-foreground/30 mx-auto size-5" />;
    return <span className="text-xs text-muted-foreground text-center block leading-tight">{value}</span>;
}
