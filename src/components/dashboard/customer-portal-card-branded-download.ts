import { CUSTOMER_PORTAL_GOOGLE_G_SVG } from "@/components/dashboard/customer-portal-card-constants";
import { finishBrandedQrPosterWithQrImage } from "@/components/dashboard/customer-portal-card-branded-download-finish";
import { paintGoogleReviewStarsOnCanvas } from "@/components/dashboard/customer-portal-card-branded-download-stars";
import { paintBrandedPosterHeaderAndCta } from "@/components/dashboard/customer-portal-card-branded-download-header";

export type BrandedQrPosterDownloadInput = {
    qrDataUrl: string;
    businessSlug: string;
    businessName: string;
    businessLogoUrl?: string | null;
    resolvedBrand: string;
    resolvedBg: string;
    resolvedFg: string;
    domain: string;
};

export function runBrandedQrPosterDownload({
    qrDataUrl,
    businessSlug,
    businessName,
    businessLogoUrl,
    resolvedBrand: _resolvedBrand,
    resolvedBg,
    resolvedFg,
    domain,
}: BrandedQrPosterDownloadInput): void {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 4;
    const baseW = 600;
    const W = baseW * scale;

    const posterBg = resolvedBg;
    const posterFg = resolvedFg;

    const roundRect = (x: number, y: number, w: number, h: number, r: number | number[]) => {
        ctx.beginPath();
        if (Array.isArray(r)) {
            ctx.roundRect(x * scale, y * scale, w * scale, h * scale, r.map((v) => v * scale));
        } else {
            ctx.roundRect(x * scale, y * scale, w * scale, h * scale, r * scale);
        }
    };

    const drawCard = (logo: HTMLImageElement | null, googleIcon: HTMLImageElement) => {
        let cursorY = paintBrandedPosterHeaderAndCta({
            ctx,
            scale,
            baseW,
            W,
            posterBg,
            posterFg,
            businessName,
            logo,
            googleIcon,
            roundRect,
        });

        cursorY = paintGoogleReviewStarsOnCanvas(ctx, scale, baseW, cursorY);

        finishBrandedQrPosterWithQrImage({
            ctx,
            canvas,
            qrDataUrl,
            scale,
            baseW,
            W,
            posterFg,
            domain,
            businessSlug,
            cursorY,
        });
    };

    const googleImg = new Image();
    googleImg.onload = () => {
        if (businessLogoUrl) {
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous";
            logoImg.onload = () => drawCard(logoImg, googleImg);
            logoImg.onerror = () => drawCard(null, googleImg);
            logoImg.src = businessLogoUrl;
        } else {
            drawCard(null, googleImg);
        }
    };
    googleImg.src = CUSTOMER_PORTAL_GOOGLE_G_SVG;
}
