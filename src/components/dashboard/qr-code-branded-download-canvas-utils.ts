export function canvasRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number | number[]
) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
}

export function paintFiveYellowStars(ctx: CanvasRenderingContext2D, W: number, cursorY: number): number {
    const drawStar = (cx: number, cy: number, spikes = 5, outerRadius = 11, innerRadius = 5) => {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = "#FFC107";
        ctx.fill();
    };
    const starSpacing = 30;
    const starStartX = (W - 4 * starSpacing) / 2;
    for (let i = 0; i < 5; i++) {
        drawStar(starStartX + i * starSpacing, cursorY + 11);
    }
    return cursorY + 24 + 18;
}
