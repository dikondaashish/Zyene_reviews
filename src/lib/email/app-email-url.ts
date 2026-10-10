/** Email action links need an absolute production fallback, even without app env. */
export function appEmailUrl(path: string): string {
    const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://app.zyenereviews.com").replace(/\/$/, "");
    return `${origin}${path}`;
}
