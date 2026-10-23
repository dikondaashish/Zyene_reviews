import { cn } from "@/lib/utils";
import { clampPct, scoreTone, type Tone } from "@/lib/dashboard/dashboard-visuals";

const TONE_TEXT: Record<Tone, string> = {
    good: "text-success",
    ok: "text-warning-foreground",
    bad: "text-destructive",
    none: "text-muted-foreground",
};

const TONE_BG: Record<Tone, string> = {
    good: "bg-success",
    ok: "bg-warning",
    bad: "bg-destructive",
    none: "bg-muted-foreground/40",
};

/** Half-circle gauge for a 0-100 score. */
export function ScoreGauge({ score, label }: { score: number | null; label: string }) {
    const tone = scoreTone(score);
    const pct = score === null ? 0 : clampPct(score);
    // Arc length of a radius-40 half circle.
    const arc = Math.PI * 40;
    return (
        <div className="relative w-28" role="img" aria-label={score === null ? `${label}: not measured yet` : `${label}: ${score} out of 100`}>
            <svg viewBox="0 0 100 56" className="w-full" aria-hidden>
                <path d="M10 50 A40 40 0 0 1 90 50" fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-secondary" />
                {score !== null && pct > 0 ? (
                    <path
                        d="M10 50 A40 40 0 0 1 90 50"
                        fill="none"
                        strokeWidth="9"
                        strokeLinecap="round"
                        stroke="currentColor"
                        strokeDasharray={`${(pct / 100) * arc} ${arc}`}
                        className={TONE_TEXT[tone]}
                    />
                ) : null}
            </svg>
            <div className="absolute inset-x-0 bottom-0 text-center leading-none">
                <span className={cn("text-2xl font-bold tabular-nums", TONE_TEXT[tone])}>{score ?? "–"}</span>
                {score !== null ? <span className="text-xs font-semibold text-muted-foreground">/100</span> : null}
            </div>
        </div>
    );
}

export { TONE_TEXT, TONE_BG };

