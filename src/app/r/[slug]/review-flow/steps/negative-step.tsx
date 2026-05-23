import { FormEvent } from "react";
import type {
    PrivateFeedbackContactMode,
    PrivateFeedbackOfferMode,
} from "@/app/r/[slug]/review-flow/types";
import { NegativeStepContactFields } from "./negative-step-contact-fields";
import { NegativeStepFooter } from "./negative-step-footer";
import { NegativeStepHeader } from "./negative-step-header";
import { NegativeStepOfferBanner } from "./negative-step-offer-banner";

export interface NegativeStepProps {
    rating: number | null;
    resolvedBrandColor: string;
    apologyMsg?: string;
    negativeSubheading?: string;
    privateFeedbackOfferMode?: PrivateFeedbackOfferMode;
    privateFeedbackOfferMessage?: string | null;
    negativeTextareaPlaceholder?: string;
    privateFeedbackEmailMode?: PrivateFeedbackContactMode;
    privateFeedbackPhoneMode?: PrivateFeedbackContactMode;
    feedback: string;
    customerEmail: string;
    customerPhone: string;
    isSubmitting: boolean;
    canSubmitNegative: boolean;
    negativeButtonText?: string;
    googleUrl?: string;
    onFeedbackChange: (value: string) => void;
    onCustomerEmailChange: (value: string) => void;
    onCustomerPhoneChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onBack: () => void;
}

export function NegativeStep({
    rating,
    resolvedBrandColor,
    apologyMsg,
    negativeSubheading,
    privateFeedbackOfferMode,
    privateFeedbackOfferMessage,
    negativeTextareaPlaceholder,
    privateFeedbackEmailMode,
    privateFeedbackPhoneMode,
    feedback,
    customerEmail,
    customerPhone,
    isSubmitting,
    canSubmitNegative,
    negativeButtonText,
    googleUrl,
    onFeedbackChange,
    onCustomerEmailChange,
    onCustomerPhoneChange,
    onSubmit,
    onBack,
}: NegativeStepProps) {
    return (
        <form
            className="px-8 py-10 space-y-6 animate-in fade-in slide-in-from-right-4 duration-400"
            onSubmit={onSubmit}
        >
            <NegativeStepHeader
                rating={rating}
                apologyMsg={apologyMsg}
                negativeSubheading={negativeSubheading}
            />

            <NegativeStepOfferBanner
                resolvedBrandColor={resolvedBrandColor}
                privateFeedbackOfferMode={privateFeedbackOfferMode}
                privateFeedbackOfferMessage={privateFeedbackOfferMessage}
            />

            <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Your feedback</label>
                <textarea
                    placeholder={negativeTextareaPlaceholder || "Tell us what happened..."}
                    className="w-full min-h-[140px] text-base p-4 rounded-2xl border-2 border-border focus:border-primary focus:ring-0 outline-none resize-none transition-colors bg-muted placeholder:text-muted-foreground dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:text-foreground"
                    value={feedback}
                    onChange={(e) => onFeedbackChange(e.target.value)}
                    autoFocus
                />
            </div>

            <NegativeStepContactFields
                privateFeedbackEmailMode={privateFeedbackEmailMode}
                privateFeedbackPhoneMode={privateFeedbackPhoneMode}
                customerEmail={customerEmail}
                customerPhone={customerPhone}
                onCustomerEmailChange={onCustomerEmailChange}
                onCustomerPhoneChange={onCustomerPhoneChange}
            />

            <NegativeStepFooter
                isSubmitting={isSubmitting}
                canSubmitNegative={canSubmitNegative}
                negativeButtonText={negativeButtonText}
                googleUrl={googleUrl}
                onBack={onBack}
            />
        </form>
    );
}
