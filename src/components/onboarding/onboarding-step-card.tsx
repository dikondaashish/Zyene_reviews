import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Every onboarding screen is one of these: the same card as the dashboard sections
 * (title and subtitle over a divider, content, then actions in a footer), so setup
 * and the app feel like one product.
 */
export function OnboardingStepCard({
    title,
    description,
    headerAside,
    footer,
    children,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** Right of the title, e.g. a toggle or a status badge. */
    headerAside?: ReactNode;
    /** Actions row; put the main action last so it sits on the right. */
    footer?: ReactNode;
    children?: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
            <header className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div className="min-w-0">
                    {/* Display font on the words only; size stays on the shared page-title scale, like the dashboard title. */}
                    <h1 className="ui-page-title text-foreground"><span className="font-display">{title}</span></h1>
                    {description ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
                </div>
                {headerAside ? <div className="shrink-0">{headerAside}</div> : null}
            </header>
            {children ? <div className="px-5 py-5 sm:px-6">{children}</div> : null}
            {footer ? (
                <footer className="flex flex-col-reverse gap-2 border-t border-border bg-muted/40 px-5 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                    {footer}
                </footer>
            ) : null}
        </section>
    );
}

/** Same size and shape as the dashboard's header buttons. */
export const ONBOARDING_ACTION = "min-h-10 gap-2 rounded-lg px-4 text-sm font-semibold";
