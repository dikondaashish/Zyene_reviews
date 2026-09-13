"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

type SignupFormPhoneFieldsProps = {
    phone: string;
    setPhone: (value: string) => void;
    smsReviewAlertsConsent: boolean;
    setSmsReviewAlertsConsent: (value: boolean) => void;
    isLoading: boolean;
};

export function SignupFormPhoneFields({ phone, setPhone, smsReviewAlertsConsent,
    setSmsReviewAlertsConsent, isLoading }: SignupFormPhoneFieldsProps) {
    return (
        <details className="auth-optional">
            <summary>Add SMS review alerts <span>Optional</span><ChevronDown size={16} aria-hidden="true" /></summary>
            <div className="auth-optional-content">
                <div className="auth-field">
                    <label htmlFor="phone">Mobile number</label>
                    <input id="phone" name="phone" type="tel" placeholder="+1 555 123 4567" value={phone}
                        onChange={(e) => setPhone(e.target.value)} disabled={isLoading} autoComplete="tel"
                        aria-describedby="phone-help" className="auth-input" />
                    <p id="phone-help" className="auth-hint">Include your country code. You can also set this up later in Settings.</p>
                </div>
                <div className="auth-consent">
                    <input id="smsReviewAlertsConsent" type="checkbox" checked={smsReviewAlertsConsent}
                        disabled={isLoading} onChange={(e) => setSmsReviewAlertsConsent(e.target.checked)} />
                    <label htmlFor="smsReviewAlertsConsent">
                        I agree to receive SMS review alerts from Zyene Reviews, including messages sent on
                        behalf of businesses using the platform. Consent is not required to use the service.
                        Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to unsubscribe or HELP for
                        help. View our <Link href={`${MARKETING_SITE_ORIGIN}/privacy`}>Privacy Policy</Link> and{" "}
                        <Link href={`${MARKETING_SITE_ORIGIN}/terms`}>Terms of Service</Link>.
                    </label>
                </div>
            </div>
        </details>
    );
}
