export function paintGoogleReviewStarsOnCanvas(
    ctx: CanvasRenderingContext2D,
    scale: number,
    baseW: number,
    cursorY: number
): number {
    const drawStar = (cx: number, cy: number) => {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / 5;
        ctx.beginPath();
        ctx.moveTo(cx * scale, (cy - 11) * scale);
        for (let i = 0; i < 5; i++) {
            x = cx + Math.cos(rot) * 11;
            y = cy + Math.sin(rot) * 11;
            ctx.lineTo(x * scale, y * scale);
            rot += step;
            x = cx + Math.cos(rot) * 5;
            y = cy + Math.sin(rot) * 5;
            ctx.lineTo(x * scale, y * scale);
            rot += step;
        }
        ctx.closePath();
        ctx.fillStyle = "rgb(255,193,7)";
        ctx.fill();
    };
    const starStartX = (baseW - 4 * 30) / 2;
    for (let i = 0; i < 5; i++) drawStar(starStartX + i * 30, cursorY + 11);
    return cursorY + 24 + 18;
}
