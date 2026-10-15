import Link from "next/link";
import { ArrowRight, Check, CircleDashed, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AuditFixAction, AuditItem } from "./google-seo-aeo-audit-utils";

type AuditCheckRowProps = {
    audit: AuditItem;
    action?: AuditFixAction;
    statusLabel: string;
};

export function AuditCheckRow({ audit, action, statusLabel }: AuditCheckRowProps) {
    const isPassing = audit.status === "pass";
    const needsAttention = audit.status === "fail";
    const isUnscored = !isPassing && !needsAttention;
    const Icon = isPassing ? Check : needsAttention ? TriangleAlert : CircleDashed;

    return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-3 px-5 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4 sm:px-6">
            <span
                aria-hidden="true"
                className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full sm:mt-0",
                    isPassing && "bg-success/10 text-success",
                    needsAttention && "bg-destructive/10 text-destructive",
                    isUnscored && "bg-muted text-muted-foreground",
                )}
            >
                <Icon className="size-3.5" />
            </span>
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="ui-card-title text-foreground">{audit.label}</h3>
                    {/* The list heading already says "fix" or "on track"; only unscored rows need a visible reason. */}
                    <span
                        className={cn(
                            isUnscored
                                ? "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                                : "sr-only",
                        )}
                    >
                        {statusLabel}
                    </span>
                </div>
                <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{audit.detail}</p>
            </div>
            {action ? (
                <Button
                    asChild
                    size="sm"
                    variant={needsAttention ? "default" : "outline"}
                    className="col-start-2 justify-self-start sm:col-start-auto"
                >
                    <Link href={action.href}>
                        {action.label}
                        <ArrowRight className="size-3.5" />
                    </Link>
                </Button>
            ) : null}
        </div>
    );
}
