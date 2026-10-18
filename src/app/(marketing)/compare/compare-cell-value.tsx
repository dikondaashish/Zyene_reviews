import { Check, X } from "lucide-react";

/** One comparison cell: an ink check, a muted cross, or plain text. Labels stay readable to screen readers. */
export function CellValue({ value }: { value: boolean | string }) {
    if (value === true) {
        return (
            <span className="inline-flex text-foreground">
                <Check className="size-5" aria-hidden="true" />
                <span className="sr-only">Included</span>
            </span>
        );
    }
    if (value === false) {
        return (
            <span className="inline-flex text-muted-foreground">
                <X className="size-5" aria-hidden="true" />
                <span className="sr-only">Not included</span>
            </span>
        );
    }
    return <span className="block leading-snug">{value}</span>;
}
