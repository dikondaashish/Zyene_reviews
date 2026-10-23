export function appSidebarNavItemIsActive(pathname: string, itemUrl: string, matchUrls: string[] = []) {
    if (itemUrl === "/dashboard") {
        return pathname === "/dashboard" || pathname === "/";
    }
    return [itemUrl, ...matchUrls].some((url) => pathname === url || pathname.startsWith(`${url}/`));
}
