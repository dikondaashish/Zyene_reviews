import type * as React from "react";

export type AppSidebarNavItem = {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    tourTarget?: string;
    /** Other route prefixes that count as this item, e.g. the pages under "Get reviews". */
    matchUrls?: string[];
};
