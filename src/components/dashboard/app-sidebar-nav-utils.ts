export function appSidebarNavButtonClass(isActive: boolean) {
    return `
        h-11 rounded-xl px-2 transition-all duration-150
        ${isActive
            ? "bg-sidebar-accent text-primary font-semibold"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }
    `;
}

export function appSidebarNavItemIsActive(pathname: string, itemUrl: string) {
    if (itemUrl === "/dashboard") {
        return pathname === "/dashboard" || pathname === "/";
    }
    return pathname === itemUrl || pathname.startsWith(`${itemUrl}/`);
}
