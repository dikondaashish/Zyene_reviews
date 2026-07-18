import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { generateQRCodeDataURL } from "@/lib/qr/generate-qr";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const [supabase, { id: businessId }] = await Promise.all([createClient(), params]);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canAccess = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!canAccess) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("slug, logo_url, brand_color, review_page_background_color")
        .eq("id", businessId)
        .maybeSingle();

    if (businessError || !business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (!business.slug) {
        return NextResponse.json({ error: "Business slug not set" }, { status: 400 });
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = rootDomain.includes("localhost") ? "http" : "https";
    const reviewDomain = rootDomain.includes("localhost")
        ? "localhost:3000"
        : "www.collectratings.com";
    const reviewUrl = `${protocol}://${reviewDomain}/${business.slug}`;

    try {
        const qrCodeDataUrl = await generateQRCodeDataURL(reviewUrl);
        return NextResponse.json({
            qrCodeDataUrl,
            reviewUrl,
            logoUrl: business.logo_url ?? null,
            brandColor: business.brand_color ?? null,
            reviewPageBackgroundColor: business.review_page_background_color ?? null,
        });
    } catch (error) {
        logger.error({ err: error }, "QR generation error:");
        return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
    }
}
