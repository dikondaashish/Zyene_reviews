import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    /** Small line above the title, e.g. the workspace or a "back" link. */
    eyebrow?: ReactNode;
    /** Inline next to the title: counts, status badges. */
    titleAdornment?: ReactNode;
    actions?: ReactNode;
    actionsClassName?: string;
    className?: string;
    titleClassName?: string;
    titleId?: string;
}

/**
 * The one page title for a signed-in route. Renders the page's only h1
 * on the shared product scale (see `src/app/product-typography.css`), with a
 * fixed title → description gap and actions that stack under the title on
 * phones and sit to the right from `sm` up. Carries no outer margin: the
 * dashboard shell's section gap sets the space below it.
 */
export function PageHeader({
    title,
    description,
    eyebrow,
    titleAdornment,
    actions,
    actionsClassName,
    className,
    titleClassName,
    titleId,
}: PageHeaderProps) {
    const heading = (
        <h1 id={titleId} className={cn("ui-page-title min-w-0 break-words text-foreground", titleClassName)}>
            {title}
        </h1>
    );

    return (
        <header
            className={cn(
                "flex min-w-0 flex-col gap-[var(--page-header-actions-gap)] sm:flex-row sm:items-start sm:justify-between",
                className
            )}
        >
            <div className="min-w-0 flex-1">
                {eyebrow ? <div className="ui-meta mb-1 min-w-0 truncate text-muted-foreground">{eyebrow}</div> : null}
                {titleAdornment ? (
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                        {heading}
                        {titleAdornment}
                    </div>
                ) : (
                    heading
                )}
                {description ? (
                    <p className="ui-body-copy mt-[var(--page-header-title-gap)] max-w-2xl text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            {actions ? (
                <div className={cn("flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0", actionsClassName)}>
                    {actions}
                </div>
            ) : null}
        </header>
    );
}
