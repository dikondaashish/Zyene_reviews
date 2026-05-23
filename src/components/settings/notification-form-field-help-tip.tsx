"use client";

import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function NotificationFormFieldHelpTip({ label, children }: { label: string; children: ReactNode }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    className="inline-flex h-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={label}
                >
                    <CircleHelp className="size-4" strokeWidth={2} aria-hidden />
                </button>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                className="max-w-[min(320px,calc(100vw-2rem))] text-balance px-3 py-2.5 text-left text-xs font-normal leading-relaxed"
            >
                {children}
            </TooltipContent>
        </Tooltip>
    );
}
