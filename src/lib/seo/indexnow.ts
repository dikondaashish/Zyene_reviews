import { logger } from "@/lib/logger";

const INDEXNOW_KEY = "b72e9354a8674d819712a48dc7b06b52";
const HOST = "www.zyenereviews.com";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Pings the IndexNow API to notify search engines of new or updated content.
 * @param urls Array of absolute URLs to index (e.g. ["https://www.zyenereviews.com/blog/new-post"])
 * @returns boolean indicating success
 */
export async function pingIndexNow(urls: string[]): Promise<boolean> {
    if (!urls || urls.length === 0) {
        logger.warn("pingIndexNow called with empty URL list");
        return false;
    }

    try {
        const payload = {
            host: HOST,
            key: INDEXNOW_KEY,
            keyLocation: KEY_LOCATION,
            urlList: urls,
        };

        const response = await fetch(INDEXNOW_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(
                { status: response.status, statusText: response.statusText, errorText },
                "IndexNow ping failed"
            );
            return false;
        }

        logger.info(`IndexNow ping successful for ${urls.length} URLs`);
        return true;
    } catch (error) {
        logger.error({ err: error }, "Exception during IndexNow ping");
        return false;
    }
}
