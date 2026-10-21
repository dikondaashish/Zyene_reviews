import { logger } from "@/lib/logger";
import { exchangeCodeForToken, getLongLivedToken, graphFetch } from "@/services/facebook/client";
import { getPages } from "@/services/facebook/adapter";
import { saveFacebookConnectData } from "@/services/facebook/connect-session";

interface FacebookPermissionsResponse {
    data: { permission: string; status: string }[];
}

/** Logs which permissions the user granted or declined when Facebook returns no Pages. */
async function logNoPagesDiagnostics(userAccessToken: string, userId: string, businessId: string) {
    try {
        const { data } = await graphFetch<FacebookPermissionsResponse>({
            path: "/me/permissions",
            params: { access_token: userAccessToken },
        });
        const byStatus = (status: string) =>
            data.filter((p) => p.status === status).map((p) => p.permission);
        logger.warn(
            { userId, businessId, pageCount: 0, granted: byStatus("granted"), declined: byStatus("declined") },
            "[Facebook OAuth] /me/accounts returned no Pages",
        );
    } catch (err: unknown) {
        logger.warn({ err, userId, businessId, pageCount: 0 },
            "[Facebook OAuth] /me/accounts returned no Pages; permission lookup failed");
    }
}

export async function completeFacebookOAuth(
    code: string, redirectUri: string, userId: string, businessId: string,
): Promise<string | null> {
    const shortLived = await exchangeCodeForToken(code, redirectUri);
    const longLived = await getLongLivedToken(shortLived.access_token);
    const pages = await getPages(longLived.access_token);
    if (pages.length === 0) {
        await logNoPagesDiagnostics(longLived.access_token, userId, businessId);
        return null;
    }

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
