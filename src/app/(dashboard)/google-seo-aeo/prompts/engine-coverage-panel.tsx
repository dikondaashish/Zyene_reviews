import { Badge } from "@/components/ui/badge";
import type { EngineCoverage } from "./load-prompts-page-data";

/**
 * F1.10 coverage panel.
 *
 * Lists every catalogued engine including ones that cannot run, with the reason
 * — "Claude: Phase 2" is a more honest answer than silently omitting it. A user
 * comparing us to a competitor's engine list should see what we do not cover
 * and why, rather than being left to infer it from an absence.
 */

const STATE_LABEL: Record<string, { text: string; variant: "default" | "secondary" | "outline" }> = {
    available: { text: "Sampling", variant: "default" },
    not_implemented: { text: "Not yet built", variant: "outline" },
    not_configured: { text: "Needs credentials", variant: "secondary" },
    pricing_unconfirmed: { text: "Withheld — price unconfirmed", variant: "secondary" },
};

export function EngineCoveragePanel({ engines }: { engines: EngineCoverage[] }) {
    return (
        <ul className="space-y-3">
            {engines.map((engine) => {
                const label = STATE_LABEL[engine.state] ?? {
                    text: engine.state,
                    variant: "outline" as const,
                };
                return (
                    <li key={engine.id} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium">{engine.label}</p>
                            <p className="text-xs text-muted-foreground">{engine.reason}</p>
                        </div>
                        <Badge variant={label.variant} className="shrink-0 text-xs">
                            {label.text}
                        </Badge>
                    </li>
                );
            })}
        </ul>
    );
}
