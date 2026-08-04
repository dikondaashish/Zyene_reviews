import type { ElementType, ReactNode } from "react";

/** Numbered step with an accent icon — used by the "How it works" card. */
export function HowItWorksStep({
    index,
    icon: Icon,
    iconWrapClass,
    title,
    description,
}: {
    index: number;
    icon: ElementType;
    iconWrapClass: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-3">
            <span className="mt-1 flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground ring-1 ring-border size-7">
                {index}
            </span>
            <div
                className={`mt-0.5 flex shrink-0 items-center justify-center rounded-lg ring-1 ${iconWrapClass} size-10`}
            >
                <Icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

/** Numbered list item — used by the "Configure your Zap" ordered list. */
export function SetupStep({
    index,
    title,
    body,
}: {
    index: number;
    title: string;
    body: ReactNode;
}) {
    return (
        <li className="flex gap-3">
            <span className="mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground ring-1 ring-border size-7">
                {index}
            </span>
            <div className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
        </li>
    );
}
