import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Store } from "lucide-react";

import { Button } from "@/components/ui/button";

type BusinessContextEmptyStateProps = {
    icon?: LucideIcon;
    title?: string;
    description: string;
    hint?: string;
    primaryLabel?: string;
    primaryHref?: string;
    secondaryLabel?: string;
    secondaryHref?: string;
};

/**
 * Shown when the user has no resolvable active business or no businesses at all.
 * Keeps CTAs and copy consistent across dashboard routes (Phase 2 UX).
 */
export function BusinessContextEmptyState({
    icon: Icon = Store,
    title = "No business selected",
    description,
    hint = "After you add a business, choose it from the menu in the header. Everything in the dashboard is scoped to that location.",
    primaryLabel = "Add a business",
    primaryHref = "/businesses/add",
    secondaryLabel = "View businesses",
    secondaryHref = "/businesses",
}: BusinessContextEmptyStateProps) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-none">
                <div className="mx-auto mb-5 flex items-center justify-center rounded-lg border border-primary/20 bg-primary/10 size-12">
                    <Icon className="text-primary size-6" aria-hidden />
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
                    {title}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {description}
                </p>
                {hint ? (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                        {hint}
                    </p>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={primaryHref}>{primaryLabel}</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                        <Link href={secondaryHref}>{secondaryLabel}</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

type TeamMembershipEmptyStateProps = {
    businessName?: string | null;
};

/**
 * Shown when the user is signed in but has no business_members row for the active business.
 */
export function TeamMembershipEmptyState({ businessName }: TeamMembershipEmptyStateProps) {
    const label = businessName?.trim() || "this business";

    return (
        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-none">
                <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
                    You don&apos;t have access to this team
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Your account isn&apos;t a member of <span className="font-medium text-foreground">{label}</span>{" "}
                    in Zyene. Ask an owner or admin to invite you, or switch to a business you belong to using the
                    menu in the header.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/businesses">View businesses</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                        <Link href="/dashboard">Back to dashboard</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
