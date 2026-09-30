import { exchangeCodeForToken, getLongLivedToken } from "@/services/facebook/client";
import { getPages } from "@/services/facebook/adapter";
import { saveFacebookConnectData } from "@/services/facebook/connect-session";

export async function completeFacebookOAuth(
    code: string, redirectUri: string, userId: string, businessId: string,
): Promise<string | null> {
    const shortLived = await exchangeCodeForToken(code, redirectUri);
    const longLived = await getLongLivedToken(shortLived.access_token);
    const pages = await getPages(longLived.access_token);
    if (pages.length === 0) return null;

    return saveFacebookConnectData({
        userId,
        businessId,
        tokenExpiresIn: longLived.expires_in,
        pages: pages.map((page) => ({
            pageId: page.pageId,
            pageName: page.pageName,
            pageAccessToken: page.pageAccessToken,
        })),
    });
}
