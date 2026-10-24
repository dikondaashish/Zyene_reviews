import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "./onboarding-preview-model";

/** Setup progress as a list that ticks off, so each step visibly builds something. */
export function OnboardingSetupChecklist({ items }: { items: ChecklistItem[] }) {
    const done = items.filter((i) => i.state === "done").length;
    return (
        <section aria-labelledby="setup-checklist-title" className="rounded-xl border border-border bg-card px-5 py-4">
            <div className="flex items-center justify-between">
                <h2 id="setup-checklist-title" className="ui-section-title text-foreground">Your Zyene setup</h2>
                <span className="text-xs tabular-nums text-muted-foreground">{done} of {items.length}</span>
            </div>
            <ul className="mt-3 space-y-2.5">
                {items.map((item) => (
                    <li key={item.label} className="flex items-center gap-2.5 text-sm">
                        <span
                            className={cn(
                                "grid size-5 shrink-0 place-items-center rounded-full border",
                                item.state === "done" && "border-success bg-success text-white",
                                item.state === "current" && "border-primary ring-2 ring-primary/20",
                                item.state === "todo" && "border-border",
                            )}
                            aria-hidden
                        >
                            {item.state === "done" && <Check className="size-3" />}
                        </span>
                        <span className={item.state === "todo" ? "text-muted-foreground" : "text-foreground"}>{item.label}</span>
                        <span className="sr-only">{item.state === "done" ? "(done)" : item.state === "current" ? "(in progress)" : ""}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

/** A taste of the product before paying: how a reply for this business reads. */
export function OnboardingExampleReply({ businessName }: { businessName: string }) {
    return (
        <section aria-labelledby="example-reply-title" className="rounded-xl border border-border bg-card px-5 py-4">
            <h2 id="example-reply-title" className="ui-section-title text-foreground">How I&apos;ll reply</h2>
            <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">A happy customer</span>
                    <span className="flex" aria-label="5 out of 5 stars">
                        {Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-3 text-warning" aria-hidden />)}
                    </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Great food and such friendly staff. We&apos;ll be back!</p>
            </div>
            <div className="mt-2 ml-4 rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2.5">
                <p className="text-xs font-medium text-foreground">Reply from {businessName}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Thank you so much! We&apos;re thrilled you enjoyed the food and our team. We can&apos;t wait to see you again soon.
                </p>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Example. Every reply is written for the review it answers.</p>
        </section>
    );
}
