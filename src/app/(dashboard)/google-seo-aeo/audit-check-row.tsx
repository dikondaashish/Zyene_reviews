import Link from "next/link";
import { ArrowUpRight, Check, CircleDashed, TriangleAlert } from "lucide-react";
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
    const Icon = isPassing ? Check : needsAttention ? TriangleAlert : CircleDashed;

    return (
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
            <span
                aria-hidden="true"
                className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full",
                    isPassing && "bg-success/10 text-success",
                    needsAttention && "bg-destructive/10 text-destructive",
                    !isPassing && !needsAttention && "bg-muted text-muted-foreground",
                )}
            >
                <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="font-medium text-foreground">{audit.label}</h3>
                    <span
                        className={cn(
                            "text-xs font-medium",
                            isPassing && "text-success",
                            needsAttention && "text-destructive",
                            !isPassing && !needsAttention && "text-muted-foreground",
                        )}
                    >
                        {statusLabel}
                    </span>
                </div>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{audit.detail}</p>
            </div>
            {action ? (
                <Button
                    asChild
                    size="sm"
                    variant={needsAttention ? "default" : "outline"}
                    className="shrink-0 self-start sm:self-auto"
                >
                    <Link href={action.href}>
                        {action.label}
                        <ArrowUpRight className="size-3.5" />
                    </Link>
                </Button>
            ) : null}
        </div>
    );
}
