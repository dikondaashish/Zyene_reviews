import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

interface SmartInsightsCardHeaderProps {
    reviewCount: number;
    firstPart: string;
    secondPart: string;
    /** Share of theme mentions that are positive; null hides the ring. */
    positivePct: number | null;
}

export function SmartInsightsCardHeader({
    reviewCount,
    firstPart,
    secondPart,
    positivePct,
}: SmartInsightsCardHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-start justify-between relative z-10 w-full">
            <div className="min-w-0 flex-1 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-primary/10 text-foreground px-2.5 py-1 rounded-[6px] text-xs font-semibold tracking-wide">
                        Smart insights
                    </div>
                    <span className="text-[13px] font-medium text-muted-foreground">
                        {reviewCount} reviews analyzed
                    </span>
                </div>

                <div>
                    <p className="text-2xl md:text-3xl font-semibold font-sans leading-[1.05] tracking-[-0.02em] text-foreground">
                        {firstPart}
                        {secondPart && (
                            <span className="block text-primary">
                                {secondPart}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {positivePct !== null ? (
                <div className="hidden sm:flex shrink-0 flex-col items-center gap-1">
                    <div
                        className="relative flex items-center justify-center"
                        style={{ width: 112, height: 112 }}
                        role="img"
                        aria-label={`${positivePct}% of what customers mention is positive`}
                    >
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10" aria-hidden>
                            <span className="text-2xl font-sans font-bold text-foreground">{positivePct}%</span>
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                                POSITIVE
                            </span>
                        </div>
                        <RadialBarChart
                            width={112}
                            height={112}
                            innerRadius="75%"
                            outerRadius="100%"
                            data={[{ value: positivePct }]}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <PolarAngleAxis type="number" domain={[0, 100]} dataKey="value" angleAxisId={0} tick={false} />
                            <RadialBar
                                background={{ fill: "var(--secondary)" }}
                                isAnimationActive={false}
                                dataKey="value"
                                cornerRadius={10}
                                fill="var(--primary)"
                            />
                        </RadialBarChart>
                    </div>
                    <span className="text-[11px] text-muted-foreground" aria-hidden>
                        of mentions
                    </span>
                </div>
            ) : null}
        </div>
    );
}
