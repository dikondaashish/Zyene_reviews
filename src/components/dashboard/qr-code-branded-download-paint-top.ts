import { contrastText, resolveBrandColor } from "@/components/dashboard/qr-code-helpers";
import { canvasRoundRect } from "@/components/dashboard/qr-code-branded-download-canvas-utils";

export function paintBrandedQrPosterCardTop(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    logo: HTMLImageElement | null,
    businessName: string,
    brandColor: string | null,
    pageBgColor: string | null
): { W: number; H: number; cursorY: number; accent: string; accentFg: string; resolvedBgColor: string } {
    const W = 600;
    const accent = resolveBrandColor(brandColor);
    const accentFg = contrastText(accent);
    const resolvedBgColor = pageBgColor ?? "#ffffff";

    let H = 50;
    let lh = 0;
    let lw = 0;
    if (logo) {
        const maxLogoH = 64;
        const maxLogoW = 200;
        const scale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height, 1);
        lw = logo.width * scale;
        lh = logo.height * scale;
        H += 10 + lh + 16;
    } else {
        H += 20;
    }
    H += 80 + 20 + 108 + 328 + 36 + 30 + 30;

    canvas.width = W;
    canvas.height = H;

    canvasRoundRect(ctx, 0, 0, W, H, 24);
    ctx.fillStyle = resolvedBgColor;
    ctx.fill();

    ctx.save();
    canvasRoundRect(ctx, 0, 0, W, 10, [24, 24, 0, 0]);
    ctx.clip();
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, 10);
    ctx.restore();

    ctx.save();
    canvasRoundRect(ctx, 0, H - 10, W, 10, [0, 0, 24, 24]);
    ctx.clip();
    ctx.fillStyle = accent;
    ctx.fillRect(0, H - 10, W, 10);
    ctx.restore();

    canvasRoundRect(ctx, 20, 20, W - 40, H - 40, 16);
    ctx.strokeStyle =
        resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#e5e5e5" : "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    let cursorY = 50;
    if (logo) {
        const lx = (W - lw) / 2;
        cursorY += 10;
        ctx.drawImage(logo, lx, cursorY, lw, lh);
        cursorY += lh + 16;
    } else {
        cursorY += 20;
    }

    ctx.fillStyle = contrastText(resolvedBgColor);
    ctx.font = "bold 32px 'Inter', 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(businessName, W / 2, cursorY + 32);
    cursorY += 52;

    ctx.strokeStyle =
        resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#e5e5e5" : "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, cursorY);
    ctx.lineTo(W - 60, cursorY);
    ctx.stroke();
    cursorY += 20;

    return { W, H, cursorY, accent, accentFg, resolvedBgColor };
}
