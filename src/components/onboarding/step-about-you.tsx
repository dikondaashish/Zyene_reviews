"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Check, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { saveOnboardingAboutYou } from "@/app/actions/onboarding/about-you";
import { isPlausibleMobileNumber } from "@/lib/validations/phone";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";
import { ONBOARDING_ACTION, OnboardingStepCard } from "./onboarding-step-card";

const ACCOUNT_TYPES = [
    { id: "business", icon: Building2, title: "I run a business", text: "One or more locations of my own." },
    { id: "agency", icon: Users, title: "I'm an agency", text: "I manage reviews for clients." },
] as const;

/** First screen after sign-up. Google sign-ups give their mobile number here; SMS alerts stay optional. */
export function StepAboutYou({ firstName, hasPhone, onNext }: { firstName: string; hasPhone: boolean; onNext: () => void }) {
    const [phone, setPhone] = useState("");
    const [smsConsent, setSmsConsent] = useState(false);
    const [accountType, setAccountType] = useState<"business" | "agency">("business");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!hasPhone && !isPlausibleMobileNumber(phone.trim())) {
            setError("Add your mobile number, including your country code, for example +1 555 123 4567.");
            return;
        }
        setSaving(true);
        try {
            const result = await saveOnboardingAboutYou({ phone: hasPhone ? undefined : phone.trim(), smsConsent, accountType });
            if (result.success) onNext();
            else setError(result.error);
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={(e) => void submit(e)}>
            <OnboardingStepCard
                title={`Welcome, ${firstName}!`}
                description={hasPhone ? "One quick question so we set things up the right way." : "Two quick questions so we can set things up for you."}
                footer={
                    <Button type="submit" disabled={saving} className={ONBOARDING_ACTION}>
                        {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                        Continue<ArrowRight className="size-4" aria-hidden />
                    </Button>
                }
            >
                <div className="space-y-6">
                    {!hasPhone && (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="about-phone">Mobile number</Label>
                                <Input id="about-phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+1 555 123 4567"
                                    value={phone} onChange={(e) => setPhone(e.target.value)} disabled={saving} aria-describedby="about-phone-help" className="h-11" />
                                <p id="about-phone-help" className="text-xs text-muted-foreground">Include your country code. We only text it if you agree below.</p>
                            </div>
                            <label htmlFor="about-sms" className="flex items-start gap-2.5 text-xs leading-5 text-muted-foreground">
                                <input id="about-sms" type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)}
                                    disabled={saving} className="mt-1 size-4 shrink-0 accent-primary" />
                                <span>
                                    Optional: text me when a new review comes in. I agree to receive SMS review alerts from Zyene Reviews,
                                    including messages sent on behalf of businesses using the platform. Consent is not required to use the
                                    service. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to unsubscribe or HELP for help.
                                    See our <Link href={`${MARKETING_SITE_ORIGIN}/privacy`} className="underline">Privacy Policy</Link> and{" "}
                                    <Link href={`${MARKETING_SITE_ORIGIN}/terms`} className="underline">Terms of Service</Link>.
                                    {" "}You can turn text alerts on or off later in Settings → Notifications.
                                </span>
                            </label>
                        </div>
                    )}

                    <fieldset>
                        <legend className="mb-2 text-sm font-medium text-foreground">What best describes you?</legend>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {ACCOUNT_TYPES.map((type) => {
                                const active = accountType === type.id;
                                return (
                                    <button key={type.id} type="button" role="radio" aria-checked={active} onClick={() => setAccountType(type.id)}
                                        className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                                            active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40")}>
                                        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-foreground" aria-hidden>
                                            <type.icon className="size-3.5" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium text-foreground">{type.title}</span>
                                            <span className="block text-xs text-muted-foreground">{type.text}</span>
                                        </span>
                                        {active && <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />}
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>

                    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                </div>
            </OnboardingStepCard>
        </form>
    );
}
