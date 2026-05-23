"use client";

import Link from "next/link";
import { Phone } from "lucide-react";

type SignupFormPhoneFieldsProps = {
    phone: string;
    setPhone: (value: string) => void;
    smsReviewAlertsConsent: boolean;
    setSmsReviewAlertsConsent: (value: boolean) => void;
    isLoading: boolean;
};

export function SignupFormPhoneFields({
    phone,
    setPhone,
    smsReviewAlertsConsent,
    setSmsReviewAlertsConsent,
    isLoading,
}: SignupFormPhoneFieldsProps) {
    return (
        <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                Mobile number <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
                id="phone"
                type="tel"
                placeholder="+1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                autoComplete="tel"
                className="w-full h-12 px-4 bg-background border border-input rounded-[5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1">
                <Phone className="h-3 w-3 shrink-0" /> Add your number now or later in Settings →
                Notifications. Only used for SMS review alerts if you opt in.
            </p>

            <div className="flex items-start gap-3 px-1 pt-1">
                <input
                    id="smsReviewAlertsConsent"
                    type="checkbox"
                    checked={smsReviewAlertsConsent}
                    onChange={(e) => setSmsReviewAlertsConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-input bg-background text-primary focus:ring-ring transition-all"
                />
                <label
                    htmlFor="smsReviewAlertsConsent"
                    className="text-xs text-muted-foreground leading-normal select-none cursor-pointer"
                >
                    I agree to receive SMS review alerts from Zyene Reviews, including messages sent on
                    behalf of businesses using the platform. Consent is not required to use the service. Msg
                    frequency varies. Msg &amp; data rates may apply. Reply STOP to unsubscribe or HELP for
                    help. View our{" "}
                    <Link href="/privacy" className="underline hover:text-foreground text-foreground/90">
                        Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms" className="underline hover:text-foreground text-foreground/90">
                        Terms of Service
                    </Link>
                    .
                </label>
            </div>
        </div>
    );
}
