import { Check } from "lucide-react";
import { STEPS } from "./new-campaign-constants";

interface NewCampaignStepIndicatorProps {
    step: number;
    setStep: (step: number) => void;
}

export function NewCampaignStepIndicator({ step, setStep }: NewCampaignStepIndicatorProps) {
    return (
        <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label={`Step ${i + 1}: ${s}`}
                        aria-current={i === step ? "step" : undefined}
                        disabled={i > step}
                        onClick={() => i < step && setStep(i)}
                        className={`flex min-h-9 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed
                            ${i === step
                                ? "bg-primary text-primary-foreground"
                                : i < step
                                    ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                                    : "bg-muted text-muted-foreground"
                            }`}
                    >
                        {i < step ? <Check aria-hidden="true" className="size-3.5" /> : <span className="text-xs">{i + 1}</span>}
                        <span className="hidden sm:inline">{s}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                        <div className={`h-px w-6 ${i < step ? "bg-primary" : "bg-border"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}
