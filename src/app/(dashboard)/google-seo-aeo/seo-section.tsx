import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SeoSectionProps = {
    id: string;
    title: string;
    description?: ReactNode;
    /** Inline next to the title: badges, provenance popovers. */
    meta?: ReactNode;
    /** Right-aligned in the header: buttons, counts. */
    actions?: ReactNode;
    className?: string;
    bodyClassName?: string;
    children: ReactNode;
};

/** One card shape for every block on the overview, so the page reads as a single system. */
export function SeoSection({
    id,
    title,
    description,
    meta,
    actions,
    className,
    bodyClassName,
    children,
}: SeoSectionProps) {
    return (
        <section aria-labelledby={id} className={cn("overflow-hidden rounded-xl border bg-card", className)}>
            <header className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 id={id} className="text-base font-semibold text-foreground">
                            {title}
                        </h2>
                        {meta}
                    </div>
                    {description ? (
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
            </header>
            <div className={bodyClassName}>{children}</div>
        </section>
    );
}
