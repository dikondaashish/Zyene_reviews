import { createAdminClient } from "@/lib/db/supabase/admin";
import { graphFetch } from "./client";

interface FacebookComment {
    id: string;
    from?: { id: string };
}

/**
 * Facebook review ids from /{pageId}/ratings are `open_graph_story` ids (digits, maybe `a_b`).
 * The sync's `${reviewerId}_${createdTime}` fallback is not a Graph object and cannot be commented on.
 */
export function isCommentableFacebookReviewId(externalId: string): boolean {
    return /^\d+(_\d+)?$/.test(externalId);
}

/** Page id + decrypted page access token for a connected Facebook platform. Service role only. */
async function loadPageCredentials(platformId: string): Promise<{ pageId: string; pageAccessToken: string }> {
    const admin = createAdminClient();
    const { data: platform, error } = await admin
        .from("review_platforms")
        .select("external_id, access_token")
        .eq("id", platformId)
        .eq("platform", "facebook")
        .maybeSingle();
    if (error || !platform?.external_id || !platform.access_token) {
        throw new Error("Facebook connection is missing. Reconnect Facebook.");
    }

    const { data: pageAccessToken, error: decryptError } = await admin.rpc("decrypt_token", {
        ciphertext: platform.access_token,
    });
    if (decryptError || !pageAccessToken) throw new Error("Facebook connection is missing. Reconnect Facebook.");

    return { pageId: platform.external_id, pageAccessToken: pageAccessToken as string };
}

/** The Page's own comment on a review, so edits update it instead of adding a second reply. */
async function findPageComment(storyId: string, pageId: string, pageAccessToken: string) {
    const { data } = await graphFetch<{ data: FacebookComment[] }>({
        path: `/${storyId}/comments`,
        params: { access_token: pageAccessToken, fields: "id,from", limit: "100" },
    });
    return data.find((comment) => comment.from?.id === pageId) ?? null;
}

function assertCommentable(externalId: string) {
    if (!isCommentableFacebookReviewId(externalId)) {
        throw new Error("This Facebook review can't be replied to from Zyene. Reply on Facebook instead.");
    }
}

/** Post (or update) the Page's public reply to a Facebook recommendation. */
export async function postFacebookReviewReply(platformId: string, externalId: string, text: string) {
    assertCommentable(externalId);
    const { pageId, pageAccessToken } = await loadPageCredentials(platformId);
    const existing = await findPageComment(externalId, pageId, pageAccessToken);

    await graphFetch({
        path: existing ? `/${existing.id}` : `/${externalId}/comments`,
        method: "POST",
        params: { access_token: pageAccessToken },
        body: { message: text },
    });
}

/** Remove the Page's reply from a Facebook recommendation (no-op when it is already gone). */
export async function deleteFacebookReviewReply(platformId: string, externalId: string) {
    assertCommentable(externalId);
    const { pageId, pageAccessToken } = await loadPageCredentials(platformId);
    const existing = await findPageComment(externalId, pageId, pageAccessToken);
    if (!existing) return;

    await graphFetch({
        path: `/${existing.id}`,
        method: "DELETE",
        params: { access_token: pageAccessToken },
    });
}
