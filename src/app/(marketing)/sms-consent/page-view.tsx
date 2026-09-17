import Link from "next/link";
import { MessageSquareText, ShieldCheck } from "lucide-react";

import { SMS_CONSENT_COPY } from "@/lib/twilio/sms-consent-copy";

export default function SmsConsentPage() {
    return (
        <main className="min-h-screen bg-background py-20 text-foreground">
            <div className="container mx-auto max-w-4xl px-4 sm:px-8">
                <header className="mb-12 max-w-3xl">
                    <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                        <MessageSquareText size={18} aria-hidden="true" /> SMS compliance
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{SMS_CONSENT_COPY.title}</h1>
                    <p className="mt-5 text-lg leading-8 text-muted-foreground">{SMS_CONSENT_COPY.description}</p>
                </header>

                <div className="space-y-8">
                    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                        <h2 className="text-2xl font-semibold">How customer consent works</h2>
                        <p className="mt-4 leading-7 text-muted-foreground">{SMS_CONSENT_COPY.policy}</p>
                        <ol className="mt-6 list-decimal space-y-3 pl-5 text-muted-foreground">
                            <li>The business presents the SMS disclosure before requesting a customer&apos;s phone number.</li>
                            <li>The customer actively checks the consent box and provides a mobile number.</li>
                            <li>The business keeps the consent record and confirms consent before importing or sending.</li>
                        </ol>
                    </section>

                    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
                        <h2 className="text-2xl font-semibold">Customer-facing consent language</h2>
                        <div className="mt-5 rounded-xl border border-border bg-card p-5">
                            <p className="font-medium leading-7">{SMS_CONSENT_COPY.checkboxLabel}</p>
                            <p className="mt-4 text-sm text-muted-foreground">
                                See our <Link className="text-primary underline" href={SMS_CONSENT_COPY.privacyHref}>Privacy Policy</Link>{" "}
                                and <Link className="text-primary underline" href={SMS_CONSENT_COPY.termsHref}>Terms of Service</Link>.
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-6 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h2 className="text-xl font-semibold">What messages contain</h2>
                            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                                <li>Account alerts for business users who enable SMS notifications.</li>
                                <li>Post-service review requests sent on behalf of a consenting business.</li>
                                <li>Clear STOP and HELP instructions in every supported message flow.</li>
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h2 className="text-xl font-semibold">Opt-out and support</h2>
                            <p className="mt-4 leading-7 text-muted-foreground">
                                Recipients can reply STOP at any time to unsubscribe or HELP for assistance. Message frequency varies, and message and data rates may apply.
                            </p>
                            <p className="mt-4 text-sm text-muted-foreground">No purchased lists or unsolicited messages are permitted.</p>
                        </div>
                    </section>

                    <aside className="flex gap-3 rounded-2xl border border-border bg-muted/40 p-6 text-sm leading-6 text-muted-foreground">
                        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                        <p>This page documents Zyene Reviews&apos; required opt-in process. Each business must use a customer-facing consent form and retain its own consent records before sending messages.</p>
                    </aside>
                </div>
            </div>
        </main>
    );
}
