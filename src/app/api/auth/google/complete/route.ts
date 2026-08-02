import { NextResponse } from "next/server";
import { z } from "zod";
import { completeGoogleIdentityLogin } from "@/services/auth/google-identity-completion";

const completionSchema = z.object({
    invite: z.string().trim().max(512).optional(),
    next: z.string().trim().max(2048).optional(),
});

export async function POST(request: Request) {
    const requestUrl = new URL(request.url);
    const requestOrigin = request.headers.get("origin");
    if (!requestOrigin || requestOrigin !== requestUrl.origin) {
        return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const parsed = completionSchema.safeParse({
            invite:
                formData.get("invite")?.toString() ||
                requestUrl.searchParams.get("invite") ||
                undefined,
            next: requestUrl.searchParams.get("next") || undefined,
        });
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid sign-in request" }, { status: 400 });
        }

        return completeGoogleIdentityLogin(
            request,
            parsed.data.invite || null,
            parsed.data.next || null,
        );
    } catch {
        return NextResponse.json({ error: "Invalid sign-in request" }, { status: 400 });
    }
}
