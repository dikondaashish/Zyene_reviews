export interface ThankYouStepProps {
    thankYouHeading?: string;
    thankYouMessage?: string;
}

export function ThankYouStep({ thankYouHeading, thankYouMessage }: ThankYouStepProps) {
    return (
        <div className="px-8 py-16 text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="relative inline-flex">
                <div className="h-28 w-28 bg-gradient-to-br from-chart-2 to-chart-2 rounded-full flex items-center justify-center shadow-lg shadow-chart-2/30">
                    <span className="text-6xl animate-bounce" style={{ animationDuration: "2s" }}>🎉</span>
                </div>
                <div className="absolute -top-1 -right-1 h-8 w-8 bg-chart-4 rounded-full flex items-center justify-center text-lg shadow-md">
                    ✨
                </div>
            </div>
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{thankYouHeading || "Thank You!"}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                    {thankYouMessage || "Your feedback means the world to us.\nWe appreciate you taking the time."}
                </p>
            </div>
        </div>
    );
}
