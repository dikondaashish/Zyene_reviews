import { Mail, Phone } from "lucide-react";
import type { PrivateFeedbackContactMode } from "@/app/r/[slug]/review-flow/types";

export interface NegativeStepContactFieldsProps {
    privateFeedbackEmailMode?: PrivateFeedbackContactMode;
    privateFeedbackPhoneMode?: PrivateFeedbackContactMode;
    customerEmail: string;
    customerPhone: string;
    onCustomerEmailChange: (value: string) => void;
    onCustomerPhoneChange: (value: string) => void;
}

export function NegativeStepContactFields({
    privateFeedbackEmailMode = "optional",
    privateFeedbackPhoneMode = "hidden",
    customerEmail,
    customerPhone,
    onCustomerEmailChange,
    onCustomerPhoneChange,
}: NegativeStepContactFieldsProps) {
    return (
        <>
            {privateFeedbackEmailMode !== "hidden" && (
                <div className="space-y-2">
                    <label htmlFor="private-feedback-email" className="text-sm font-semibold text-foreground">
                        Your email{" "}
                        {privateFeedbackEmailMode === "required" ? (
                            <span className="text-destructive">*</span>
                        ) : (
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        )}
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <input
                            id="private-feedback-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors bg-muted text-sm placeholder:text-muted-foreground dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:text-foreground"
                            value={customerEmail}
                            onChange={(e) => onCustomerEmailChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {privateFeedbackPhoneMode !== "hidden" && (
                <div className="space-y-2">
                    <label htmlFor="private-feedback-phone" className="text-sm font-semibold text-foreground">
                        Phone number{" "}
                        {privateFeedbackPhoneMode === "required" ? (
                            <span className="text-destructive">*</span>
                        ) : (
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        )}
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <input
                            id="private-feedback-phone"
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+1 (555) 000-0000"
                            className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors bg-muted text-sm placeholder:text-muted-foreground dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:text-foreground"
                            value={customerPhone}
                            onChange={(e) => onCustomerPhoneChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
