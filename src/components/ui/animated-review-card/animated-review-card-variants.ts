import { cva } from "class-variance-authority";
import type { ThemeColor } from "@/components/ui/animated-review-card/animated-review-card-types";

export const cardVariants = cva(
    "col-start-1 row-start-1 w-full max-w-full justify-self-center overflow-hidden rounded-xl border border-border bg-background shadow-sm sm:max-w-xl",
    {
        variants: {
            theme: {
                default: "border-border bg-background",
                primary: "bg-primary/5 border border-primary/20",
                elegant:
                    "border border-border bg-muted/60 text-foreground dark:bg-muted/40 dark:text-foreground",
                vibrant:
                    "border border-chart-1/40 bg-gradient-to-br from-chart-1 via-sync-action to-chart-5 text-primary-foreground dark:border-chart-1/30",
                minimal:
                    "border border-border bg-muted text-foreground dark:border-border dark:bg-muted dark:text-foreground",
            },
            cursor: {
                drag: "cursor-grab active:cursor-grabbing",
                click: "cursor-pointer",
            },
        },
    }
);

export const nameVariants = cva("text-base font-semibold leading-tight", {
    variants: {
        theme: {
            default: "text-foreground",
            primary: "text-primary",
            secondary: "text-secondary",
            elegant: "text-foreground",
            vibrant: "text-primary-foreground",
            minimal: "text-foreground dark:text-foreground",
        },
    },
});

export const textVariants = cva("text-start text-sm leading-relaxed text-foreground/90", {
    variants: {
        theme: {
            default: "",
            primary: "text-primary/90",
            elegant: "text-muted-foreground",
            vibrant: "text-primary-foreground/95",
            minimal: "text-muted-foreground dark:text-muted-foreground",
        },
    },
});

export const starColorVariants: Record<
    ThemeColor,
    {
        active: string;
        inactive: string;
    }
> = {
    default: {
        active: "text-chart-4 fill-current",
        inactive: "text-muted stroke-muted-foreground/20",
    },
    primary: {
        active: "text-primary",
        inactive: "text-primary/20",
    },
    elegant: {
        active: "text-foreground fill-current",
        inactive: "text-muted-foreground/50",
    },
    vibrant: {
        active: "text-primary-foreground fill-current",
        inactive: "text-primary-foreground/40",
    },
    minimal: {
        active: "text-foreground dark:text-foreground fill-current",
        inactive: "text-muted-foreground/40 dark:text-muted-foreground/60",
    },
};
