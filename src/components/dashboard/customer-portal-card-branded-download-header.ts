export function paintBrandedPosterHeaderAndCta(params: {
    ctx: CanvasRenderingContext2D;
    scale: number;
    baseW: number;
    W: number;
    posterBg: string;
    posterFg: string;
    businessName: string;
    logo: HTMLImageElement | null;
    googleIcon: HTMLImageElement;
    roundRect: (x: number, y: number, w: number, h: number, r: number | number[]) => void;
}): number {
    const { ctx, scale, baseW, W, posterBg, posterFg, businessName, logo, googleIcon, roundRect } = params;

    let baseH = 50;
    let lh = 0;
    let lw = 0;
    if (logo) {
        const maxLogoH = 64;
        const maxLogoW = 200;
        const imgScale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height, 1);
        lw = logo.width * imgScale;
        lh = logo.height * imgScale;
        baseH += 10 + lh + 16;
    } else {
        baseH += 20;
    }
    baseH += 80 + 20 + 108 + 328 + 36 + 30 + 30;

    const canvas = ctx.canvas;
    canvas.width = W;
    canvas.height = baseH * scale;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    roundRect(0, 0, baseW, baseH, 24);
    ctx.fillStyle = posterBg;
    ctx.fill();

    roundRect(20, 20, baseW - 40, baseH - 40, 16);
    ctx.strokeStyle = posterFg === "rgb(255,255,255)" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    let cursorY = 50;
    if (logo) {
        ctx.drawImage(logo, ((baseW - lw) / 2) * scale, (cursorY + 10) * scale, lw * scale, lh * scale);
        cursorY += lh + 26;
    } else {
        cursorY += 20;
    }

    ctx.fillStyle = posterFg;
    ctx.font = `bold ${32 * scale}px 'Inter', 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(businessName || "Business", W / 2, (cursorY + 32) * scale);
    cursorY += 52;

    ctx.strokeStyle = posterFg === "rgb(255,255,255)" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(60 * scale, cursorY * scale);
    ctx.lineTo((baseW - 60) * scale, cursorY * scale);
    ctx.stroke();
    cursorY += 20;

    const ctaText = "Scan to Leave Us a Google Review";
    ctx.font = `600 ${16 * scale}px 'Inter', 'Segoe UI', system-ui, sans-serif`;
    const ctaMetrics = ctx.measureText(ctaText);
    const iconSize = 24;
    const gap = 10;
    const pillW = iconSize + gap + ctaMetrics.width / scale + 56;
    const pillH = 48;
    const pillX = (baseW - pillW) / 2;

    roundRect(pillX, cursorY, pillW, pillH, pillH / 2);
    ctx.fillStyle = posterFg === "rgb(255,255,255)" ? "rgb(0,0,0)" : "rgba(0,0,0,0.85)";
    ctx.fill();

    ctx.drawImage(
        googleIcon,
        (pillX + 28) * scale,
        (cursorY + (pillH - iconSize) / 2) * scale,
        iconSize * scale,
        iconSize * scale
    );

    ctx.fillStyle = "rgb(255,255,255)";
    ctx.textAlign = "left";
    ctx.fillText(ctaText, (pillX + 28 + iconSize + gap) * scale, (cursorY + 30) * scale);
    cursorY += pillH + 16;

    return cursorY;
}
