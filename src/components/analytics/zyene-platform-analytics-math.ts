export function pct(num: number, den: number): number {
    return den > 0 ? Math.round((num / den) * 100) : 0;
}

export function getDelta(curr: number, prev: number): number {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
}
