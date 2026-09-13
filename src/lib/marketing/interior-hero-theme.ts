export type InteriorHeroTheme = "guidance" | "local" | "product";

const GUIDANCE_PATHS = [
    "/blog",
    "/help",
    "/privacy",
    "/resources",
    "/security",
    "/terms",
    "/tools",
];

const LOCAL_PATHS = [
    "/about",
    "/agencies",
    "/case-studies",
    "/contact",
    "/industries",
    "/partners",
    "/es/industries",
];

function matchesPath(pathname: string, paths: string[]): boolean {
    return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function getInteriorHeroTheme(pathname: string | null): InteriorHeroTheme | null {
    if (!pathname || pathname === "/" || pathname === "/growth" || pathname.startsWith("/growth/") || pathname.startsWith("/newsletter/")) {
        return null;
    }

    if (matchesPath(pathname, GUIDANCE_PATHS)) return "guidance";
    if (matchesPath(pathname, LOCAL_PATHS)) return "local";

    return "product";
}
