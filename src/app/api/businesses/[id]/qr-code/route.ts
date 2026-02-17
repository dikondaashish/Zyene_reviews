import { createClient } from "@/lib/supabase/server";
import { generateQRCodeDataURL } from "@/lib/qr/generate-qr";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id: businessId } = await params;

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

    // @ts-ignore - Supabase types inference
    const business = member?.organizations?.businesses?.find(
        (b: any) => b.id === businessId
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

    // Build review URL
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = rootDomain.includes("localhost") ? "http" : "https";
    const reviewUrl = `${protocol}://${rootDomain}/${business.slug}`;

    try {
        const qrCodeDataUrl = await generateQRCodeDataURL(reviewUrl);
        return NextResponse.json({ qrCodeDataUrl, reviewUrl });
    } catch (error) {
        console.error("QR generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate QR code" },
            { status: 500 }
        );
    }
}
