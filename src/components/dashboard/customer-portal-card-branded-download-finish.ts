import { toast } from "sonner";

export function finishBrandedQrPosterWithQrImage(params: {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    qrDataUrl: string;
    scale: number;
    baseW: number;
    W: number;
    posterFg: string;
    domain: string;
    businessSlug: string;
    cursorY: number;
}): void {
    const { ctx, canvas, qrDataUrl, scale, baseW, W, posterFg, domain, businessSlug, cursorY: startY } = params;
    let cursorY = startY;

    const roundRect = (x: number, y: number, w: number, h: number, r: number | number[]) => {
        ctx.beginPath();
        if (Array.isArray(r)) {
            ctx.roundRect(x * scale, y * scale, w * scale, h * scale, r.map((v) => v * scale));
        } else {
            ctx.roundRect(x * scale, y * scale, w * scale, h * scale, r * scale);
        }
    };

    const qrImg = new Image();
    qrImg.onload = () => {
        const qrSize = 300;
        const qrX = (baseW - qrSize) / 2;
        roundRect(qrX - 12, cursorY - 12, qrSize + 24, qrSize + 24, 16);
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fill();

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(qrImg, qrX * scale, cursorY * scale, qrSize * scale, qrSize * scale);
        cursorY += qrSize + 36;

        ctx.imageSmoothingEnabled = true;
        ctx.fillStyle = posterFg === "rgb(255,255,255)" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
        ctx.font = `500 ${16 * scale}px 'Inter', 'Segoe UI', system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(`${domain}/${businessSlug}`, W / 2, cursorY * scale);
        cursorY += 32;

        ctx.fillStyle = posterFg === "rgb(255,255,255)" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
        ctx.font = `bold ${14 * scale}px 'Inter', 'Segoe UI', system-ui, sans-serif`;
        ctx.fillText("Powered by Zyene Reviews", W / 2, cursorY * scale);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png", 1.0);
        link.download = `${businessSlug}-qr-poster.png`;
        link.click();
        toast.success("High-quality QR code downloaded!");
    };
    qrImg.src = qrDataUrl;
}
