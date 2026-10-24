"use client";

import Link from "next/link";
import { AuthInput } from "@/components/auth/auth-form-ui";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

type SignupFormPhoneFieldsProps = {
    phone: string;
    setPhone: (value: string) => void;
    phoneRequired: boolean;
    smsReviewAlertsConsent: boolean;
    setSmsReviewAlertsConsent: (value: boolean) => void;
    isLoading: boolean;
};

/** Mobile number is required for new owners; agreeing to SMS alerts stays a separate, optional choice. */
export function SignupFormPhoneFields({ phone, setPhone, phoneRequired, smsReviewAlertsConsent,
    setSmsReviewAlertsConsent, isLoading }: SignupFormPhoneFieldsProps) {
    return (
        <>
            <div className="auth-field">
                <label htmlFor="phone">Mobile number{phoneRequired ? "" : " (optional)"}</label>
                <AuthInput id="phone" name="phone" type="tel" placeholder="+1 555 123 4567" value={phone}
                    onChange={(e) => setPhone(e.target.value)} required={phoneRequired} disabled={isLoading}
                    autoComplete="tel" aria-describedby="phone-help" />
                <p id="phone-help" className="auth-hint">
                    Include your country code. We only text it if you agree below.
                </p>
            </div>
            <div className="auth-consent">
                <input id="smsReviewAlertsConsent" type="checkbox" checked={smsReviewAlertsConsent}
                    disabled={isLoading} onChange={(e) => setSmsReviewAlertsConsent(e.target.checked)} />
                <label htmlFor="smsReviewAlertsConsent">
                    Optional: text me when a new review comes in. I agree to receive SMS review alerts from Zyene Reviews,
                    including messages sent on behalf of businesses using the platform. Consent is not required to use the
                    service. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to unsubscribe or HELP for
                    help. View our <Link href={`${MARKETING_SITE_ORIGIN}/privacy`}>Privacy Policy</Link> and{" "}
                    <Link href={`${MARKETING_SITE_ORIGIN}/terms`}>Terms of Service</Link>.
                </label>
            </div>
        </>
    );
}
