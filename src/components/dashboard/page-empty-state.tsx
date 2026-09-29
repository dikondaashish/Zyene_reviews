import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function PageEmptyState({ icon: Icon, title, description, children }: {
    icon: LucideIcon; title: string; description: string; children?: ReactNode;
}) {
    return (
        <section className="flex min-w-0 flex-col items-center rounded-2xl border border-border bg-card px-5 py-10 text-center sm:px-8 sm:py-12">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-6" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
            {children && <div className="mt-5 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">{children}</div>}
        </section>
    );
}
