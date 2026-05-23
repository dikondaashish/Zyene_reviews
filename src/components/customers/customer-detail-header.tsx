"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomerDetailHeader({
    pageHeading,
    actions,
}: {
    pageHeading: string;
    actions: ReactNode;
}) {
    return (
        <header className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="min-w-0 space-y-1">
                <Link
                    href="/customers"
                    className={cn(
                        "group/back mb-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors",
                        "hover:text-foreground"
                    )}
                >
                    <ChevronLeft className="shrink-0 transition-transform group-hover/back:-translate-x-0.5 size-4" />
                    Customers
                </Link>
                <div className="flex items-center gap-2">
                    <div className="rounded-lg border border-primary/20 bg-primary/10 p-1.5">
                        <UserRound className="text-primary size-4" />
                    </div>
                    <h1 className="min-w-0 truncate text-xl font-bold tracking-tight text-foreground lg:text-2xl">
                        {pageHeading}
                    </h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    Contact profile, outreach, and activity ,  same data as your customer list.
                </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">{actions}</div>
        </header>
    );
}
