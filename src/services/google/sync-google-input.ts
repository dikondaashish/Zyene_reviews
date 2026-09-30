import { z } from "zod";
import { ApiRouteError } from "@/app/api/_shared/errors";

const googleSyncSchema = z.object({
    businessId: z.string().trim().uuid().optional(),
    force: z.boolean().default(false),
});

export function parseGoogleSyncInput(input: unknown) {
    const parsed = googleSyncSchema.safeParse(input);
    if (!parsed.success) {
        throw new ApiRouteError("Invalid sync request", { status: 400, code: "INVALID_INPUT" });
    }
    return parsed.data;
}

export async function readGoogleSyncBody(request: Request) {
    const text = await request.text();
    let input: unknown = {};
    if (text.trim()) {
        try {
            input = JSON.parse(text);
        } catch {
            throw new ApiRouteError("Invalid sync request", { status: 400, code: "INVALID_INPUT" });
        }
    }
    return parseGoogleSyncInput(input);
}
