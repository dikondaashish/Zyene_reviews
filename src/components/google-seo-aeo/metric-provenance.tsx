"use client";

import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * QA #35 — where a number came from, attached to the number itself.
 *
 * Every field arrives pre-formatted. Dates are rendered on the server and passed
 * as strings because `toLocaleString` resolves against the runtime's locale and
 * timezone, and a client formatting them again would hydrate to different text
 * than the server sent.
 */
export type ProvenanceRow = { label: string; value: string };

export function MetricProvenance({ title, rows }: { title: string; rows: ProvenanceRow[] }) {
    return (
        <Popover>
            <PopoverTrigger
                aria-label={`How ${title} was measured`}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none"
            >
                <Info className="size-4" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
                <p className="text-sm font-medium">{title}</p>
                <dl className="mt-3 space-y-2">
                    {rows.map((row) => (
                        <div key={row.label} className="flex justify-between gap-4 text-xs">
                            <dt className="text-muted-foreground shrink-0">{row.label}</dt>
                            <dd className="text-right font-medium break-words">{row.value}</dd>
                        </div>
                    ))}
                </dl>
            </PopoverContent>
        </Popover>
    );
}
