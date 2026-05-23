import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { generateQRCodeDataURL } from "@/lib/qr/generate-qr";
import { NextResponse } from "next/server";
import type { MemberOrgContext, NestedBusiness } from "@/types/member-context";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const [supabase, { id: businessId }] = await Promise.all([createClient(), params]);

    // Authenticate
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership via organization chain
    const { data: member } = await supabase
        .from("organization_members")
        .select(
            `
            organizations (
                businesses (id, slug)
            )
        `
        )
        .eq("user_id", user.id)
        .single();

    const memberTyped = member as unknown as MemberOrgContext;
    const business = memberTyped?.organizations?.businesses?.find(
        (b) => b.id === businessId
    );

    if (!business) {
        return NextResponse.json(
            { error: "Business not found" },
            { status: 404 }
        );
    }

    if (!business.slug) {
        return NextResponse.json(
            { error: "Business slug not set" },
            { status: 400 }
        );
    }

    // Fetch branding fields
    const { data: brandingData } = await supabase
        .from("businesses")
        .select("logo_url, brand_color, review_page_background_color")
        .eq("id", businessId)
        .single();

    // Build review URL
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = rootDomain.includes("localhost") ? "http" : "https";
    const reviewDomain = rootDomain.includes("localhost") ? "localhost:3000" : "www.collectratings.com";
    const reviewUrl = `${protocol}://${reviewDomain}/${business.slug}`;

    try {
        const qrCodeDataUrl = await generateQRCodeDataURL(reviewUrl);
        return NextResponse.json({
            qrCodeDataUrl,
            reviewUrl,
            logoUrl: brandingData?.logo_url ?? null,
            brandColor: brandingData?.brand_color ?? null,
            reviewPageBackgroundColor: brandingData?.review_page_background_color ?? null,
        });
    } catch (error) {
        logger.error({ err: error }, "QR generation error:");
        return NextResponse.json(
            { error: "Failed to generate QR code" },
            { status: 500 }
        );
    }
}
