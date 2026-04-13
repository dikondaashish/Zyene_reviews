import type { ReactNode } from "react";

import { cn } from "@/lib/utils/index";

/**
 * Uppercase section label (DESIGN.md micro / caption style) for long settings forms.
 */
export function SettingsSectionLabel({
    children,
    className,
    id,
}: {
    children: ReactNode;
    className?: string;
    id?: string;
}) {
    return (
        <p
            id={id}
            className={cn(
                "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3",
                className
            )}
        >
            {children}
        </p>
    );
}
