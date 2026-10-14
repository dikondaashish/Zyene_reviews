import { CheckCircle2 } from "lucide-react";

export interface ThankYouStepProps {
    thankYouHeading?: string;
    thankYouMessage?: string;
}

export function ThankYouStep({ thankYouHeading, thankYouMessage }: ThankYouStepProps) {
    return (
        <div className="px-8 py-16 text-center space-y-6 animate-in fade-in duration-500">
            <div className="inline-flex items-center justify-center rounded-full bg-chart-2 size-24">
                <CheckCircle2 className="size-14 text-primary-foreground" aria-hidden="true" />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{thankYouHeading || "Thank you"}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                    {thankYouMessage || "We read every response.\nThanks for taking the time."}
                </p>
            </div>
        </div>
    );
}
