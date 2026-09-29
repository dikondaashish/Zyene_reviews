export function appSidebarNavItemIsActive(pathname: string, itemUrl: string) {
    if (itemUrl === "/dashboard") {
        return pathname === "/dashboard" || pathname === "/";
    }
    return pathname === itemUrl || pathname.startsWith(`${itemUrl}/`);
}
