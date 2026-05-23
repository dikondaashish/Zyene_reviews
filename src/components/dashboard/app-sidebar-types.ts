import type * as React from "react";

export type AppSidebarNavItem = {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    tourTarget?: string;
};
