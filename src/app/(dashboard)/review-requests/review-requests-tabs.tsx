import Link from "next/link";
import { getReviewRequestsTabUrl } from "./review-requests-page-utils";

export function ReviewRequestsTabs({
    filterStatus,
    totalSent,
    totalOpened,
    totalClicked,
    totalConverted,
}: {
    filterStatus: string;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalConverted: number;
}) {
    const tabClass = (active: boolean) =>
        `shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:py-1.5 sm:text-sm ${
            active ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
        }`;

    return (
        <div className="min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="inline-flex min-w-max rounded-lg bg-muted p-1">
                <Link href={getReviewRequestsTabUrl("all")}>
                    <div className={tabClass(filterStatus === "all")}>All ({totalSent})</div>
                </Link>
                <Link href={getReviewRequestsTabUrl("pending")}>
                    <div className={tabClass(filterStatus === "pending")}>
                        Pending ({totalSent - totalOpened})
                    </div>
                </Link>
                <Link href={getReviewRequestsTabUrl("opened")}>
                    <div className={tabClass(filterStatus === "opened")}>
                        Opened ({totalOpened - totalClicked})
                    </div>
                </Link>
                <Link href={getReviewRequestsTabUrl("clicked")}>
                    <div className={tabClass(filterStatus === "clicked")}>
                        Clicked ({totalClicked - totalConverted})
                    </div>
                </Link>
            </div>
        </div>
    );
}
