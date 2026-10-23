import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SetupProgress } from "@/lib/automations/setup-progress";

/** One bar per setup step with a check mark, so the owner always sees how far along they are. */
export function AutomationSetupTracker({ progress }: { progress: SetupProgress }) {
    const complete = progress.next === null;
    return (
        <section aria-labelledby="automation-setup-title" className="rounded-xl border bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 id="automation-setup-title" className="ui-section-title">Automation setup</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {complete
                            ? "Everything is set up. Zyene is asking for reviews and handling replies for you."
                            : `${progress.doneCount} of ${progress.steps.length} done. Next: ${progress.next?.label.toLowerCase()}.`}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-semibold tabular-nums text-foreground" aria-label={`${progress.percent}% set up`}>
                        {progress.percent}%
                    </span>
                    {progress.next && (
                        <Button asChild size="sm">
                            <Link href={progress.next.href}>{progress.next.cta}<ArrowRight className="size-4" /></Link>
                        </Button>
                    )}
                </div>
            </div>
            <ol className="mt-5 grid gap-3 sm:grid-cols-5">
                {progress.steps.map((step) => (
                    <li key={step.id}>
                        <Link
                            href={step.href}
                            className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                            <span className="flex items-center gap-1.5 text-sm">
                                {step.done ? (
                                    <CheckCircle2 className="size-4 shrink-0 fill-success text-card" aria-hidden />
                                ) : (
                                    <Circle className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
                                )}
                                <span className={cn("truncate", step.done ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                                    {step.done ? step.doneLabel : step.label}
                                </span>
                                <span className="sr-only">{step.done ? "(done)" : "(not done)"}</span>
                            </span>
                            <span className={cn("mt-2 block h-1.5 rounded-full", step.done ? "bg-success" : "bg-muted")} aria-hidden />
                        </Link>
                    </li>
                ))}
            </ol>
        </section>
    );
}
