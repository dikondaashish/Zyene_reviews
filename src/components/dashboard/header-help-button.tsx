"use client";

import { CircleHelp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function HeaderHelpButton() {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <a
                    href="https://www.zyenereviews.com/help"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Help (opens in a new tab)"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <CircleHelp className="size-5" aria-hidden="true" />
                </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">Help</TooltipContent>
        </Tooltip>
    );
}
