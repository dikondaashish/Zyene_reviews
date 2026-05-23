import { getDisplayDomain, QR_CODE_GOOGLE_G_SVG } from "@/components/dashboard/qr-code-helpers";
import { paintBrandedQrPosterCardTop } from "@/components/dashboard/qr-code-branded-download-paint-top";
import { paintBrandedQrPosterCtaQrAndTriggerDownload } from "@/components/dashboard/qr-code-branded-download-paint-rest";

export function downloadBrandedQrPoster(params: {
    qrDataUrl: string;
    businessName: string;
    businessSlug: string;
    brandColor: string | null;
    pageBgColor: string | null;
    logoUrl: string | null;
}): void {
    const { qrDataUrl, businessName, businessSlug, brandColor, pageBgColor, logoUrl } = params;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rootDomain = getDisplayDomain();

    const drawCard = (logo: HTMLImageElement | null, googleIcon: HTMLImageElement) => {
        const top = paintBrandedQrPosterCardTop(ctx, canvas, logo, businessName, brandColor, pageBgColor);
        paintBrandedQrPosterCtaQrAndTriggerDownload({
            ctx,
            canvas,
            W: top.W,
            cursorY: top.cursorY,
            accent: top.accent,
            accentFg: top.accentFg,
            resolvedBgColor: top.resolvedBgColor,
            googleIcon,
            qrDataUrl,
            businessSlug,
            rootDomain,
        });
    };

    const googleImg = new Image();
    googleImg.crossOrigin = "anonymous";
    googleImg.onload = () => {
        if (logoUrl) {
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous";
            logoImg.onload = () => drawCard(logoImg, googleImg);
            logoImg.onerror = () => drawCard(null, googleImg);
            logoImg.src = logoUrl;
        } else {
            drawCard(null, googleImg);
        }
    };
    googleImg.src = QR_CODE_GOOGLE_G_SVG;
}
