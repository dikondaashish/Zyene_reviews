/**
 * Origin for external cron-job.org hits. Uses app.* in production even when
 * NEXT_PUBLIC_APP_URL points at marketing apex/www.
 */
export function cronAppBase() {
    const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com")
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "")
        .replace(/^www\./, "")
        .replace(/^app\./, "");

    if (root.includes("localhost")) {
        return (
            process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000"
        );
    }

    const canonical = `https://app.${root}`;
    const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    if (!configured) return canonical;

    try {
        const host = new URL(configured).hostname.toLowerCase();
        const rootHost = root.toLowerCase();
        if (host === rootHost || host === `www.${rootHost}`) {
            return canonical;
        }
    } catch {
        /* use configured below */
    }

    return configured;
}
