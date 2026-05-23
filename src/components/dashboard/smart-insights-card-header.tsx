import { Sparkles } from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

interface SmartInsightsCardHeaderProps {
    reviewCount: number;
    firstPart: string;
    secondPart: string;
    positivePct: number;
}

export function SmartInsightsCardHeader({
    reviewCount,
    firstPart,
    secondPart,
    positivePct,
}: SmartInsightsCardHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-start justify-between relative z-10 w-full">
            <div className="max-w-[75%] space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-[rgb(43,53,46)] text-white px-2.5 py-1 rounded-[6px] text-xs font-semibold tracking-wide">
                        <Sparkles className="opacity-80 size-3.5" />
                        SMART INSIGHTS
                    </div>
                    <span className="text-[13px] font-medium text-muted-foreground">
                        {reviewCount} reviews analyzed
                    </span>
                </div>

                <div>
                    <h2 className="text-[32px] md:text-[36px] font-serif leading-[1.05] tracking-[-0.02em] text-[rgb(28,46,32)] dark:text-[rgb(226,232,240)]">
                        {firstPart}
                        {secondPart && (
                            <span className="block text-[rgb(218,84,59)] dark:text-[rgb(251,146,60)]">
                                {secondPart}
                            </span>
                        )}
                    </h2>
                </div>

                <p className="text-sm text-foreground/70 leading-relaxed max-w-lg mt-2">
                    We read every review and pulled out what matters. Here&apos;s the pulse of your restaurant this
                    month.
                </p>
            </div>

            <div
                className="hidden sm:flex relative items-center justify-center shrink-0"
                style={{ width: 112, height: 112 }}
            >
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <span className="text-2xl font-serif font-bold text-[rgb(28,46,32)] dark:text-[rgb(226,232,240)]">
                        {positivePct}%
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-[rgba(28,46,32,0.6)] font-bold dark:text-[rgba(226,232,240,0.7)]">
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
                        background={{ fill: "rgb(232,236,233)" }}
                        dataKey="value"
                        cornerRadius={10}
                        fill="rgb(39,50,41)"
                    />
                </RadialBarChart>
            </div>
        </div>
    );
}
