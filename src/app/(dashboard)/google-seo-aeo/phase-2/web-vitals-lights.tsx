import { cn } from "@/lib/utils";
import { formatVital, rateVital, VITAL_LABEL, type VitalKey, type VitalRating } from "./web-vitals-view";

const DOT: Record<VitalRating, string> = {
    good: "bg-success",
    "needs-work": "bg-warning",
    poor: "bg-destructive",
    unknown: "bg-muted-foreground/30",
};
const WORD: Record<VitalRating, string> = { good: "good", "needs-work": "needs work", poor: "poor", unknown: "not measured" };

/** Three traffic lights per page; the exact figure is on hover for whoever wants it. */
export function WebVitalsLights({ lcp, cls, inp }: Record<VitalKey, number | null>) {
    const values = { lcp, cls, inp };
    return (
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {(Object.keys(values) as VitalKey[]).map((key) => {
                const rating = rateVital(key, values[key]);
                return (
                    <li key={key} className="inline-flex items-center gap-1.5" title={formatVital(key, values[key])}>
                        <span aria-hidden className={cn("size-2.5 rounded-full", DOT[rating])} />
                        {VITAL_LABEL[key]}
                        <span className="sr-only">: {WORD[rating]}</span>
                    </li>
                );
            })}
        </ul>
    );
}
