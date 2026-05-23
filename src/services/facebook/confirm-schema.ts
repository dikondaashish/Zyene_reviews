import { z } from "zod";

export const facebookConfirmSchema = z.object({
    pageId: z.string().min(1).max(200),
});

export type FbConnectCookieData = {
    businessId: string;
    tokenExpiresIn?: number;
    pages: Array<{ pageId: string; pageName: string; pageAccessToken: string }>;
};
