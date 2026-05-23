import { toast } from "sonner";
import { contrastText } from "@/components/dashboard/qr-code-helpers";
import { canvasRoundRect, paintFiveYellowStars } from "@/components/dashboard/qr-code-branded-download-canvas-utils";

export function paintBrandedQrPosterCtaQrAndTriggerDownload(params: {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    W: number;
    cursorY: number;
    accent: string;
    accentFg: string;
    resolvedBgColor: string;
    googleIcon: HTMLImageElement;
    qrDataUrl: string;
    businessSlug: string;
    rootDomain: string;
}): void {
    const { ctx, canvas, W, accent, accentFg, resolvedBgColor, googleIcon, qrDataUrl, businessSlug, rootDomain } =
        params;
    let { cursorY } = params;

    const ctaText = "Scan to Leave Us a Google Review";
    ctx.font = "600 16px 'Inter', 'Segoe UI', system-ui, sans-serif";
    const ctaMetrics = ctx.measureText(ctaText);
    const iconSize = 24;
    const gap = 10;
    const innerW = iconSize + gap + ctaMetrics.width;
    const pillW = innerW + 56;
    const pillH = 48;
    const pillX = (W - pillW) / 2;
    canvasRoundRect(ctx, pillX, cursorY, pillW, pillH, pillH / 2);
    ctx.fillStyle = accent;
    ctx.fill();

    const iconX = pillX + 28;
    const iconY = cursorY + (pillH - iconSize) / 2;
    ctx.drawImage(googleIcon, iconX, iconY, iconSize, iconSize);
    ctx.fillStyle = accentFg;
    ctx.textAlign = "left";
    ctx.fillText(ctaText, iconX + iconSize + gap, cursorY + 30);
    cursorY += pillH + 16;

    cursorY = paintFiveYellowStars(ctx, W, cursorY);

    const qrImg = new Image();
    qrImg.onload = () => {
        const qrSize = 300;
        const qrX = (W - qrSize) / 2;
        canvasRoundRect(ctx, qrX - 12, cursorY - 12, qrSize + 24, qrSize + 24, 16);
        ctx.strokeStyle =
            resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#e5e5e5" : "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(qrImg, qrX, cursorY, qrSize, qrSize);
        cursorY += qrSize + 36;

        ctx.fillStyle =
            resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#888888" : "rgba(255,255,255,0.85)";
        ctx.font = "500 16px 'Inter', 'Segoe UI', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${rootDomain}/${businessSlug}`, W / 2, cursorY);
        cursorY += 32;

        ctx.fillStyle =
            resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#aaaaaa" : "rgba(255,255,255,0.6)";
        ctx.font = "bold 15px 'Inter', 'Segoe UI', system-ui, sans-serif";
        ctx.fillText("Powered by Zyene Reviews", W / 2, cursorY);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${businessSlug}-qr-poster.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR code downloaded!");
    };
    qrImg.src = qrDataUrl;
}
