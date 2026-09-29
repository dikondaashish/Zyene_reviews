import { Skeleton } from "@/components/ui/skeleton";

/** Also identifies dashboard placeholders rendered through a dialog portal. */
export function DashboardSkeleton(props: React.ComponentProps<typeof Skeleton>) {
    return <Skeleton {...props} data-dashboard-skeleton aria-hidden="true" />;
}
