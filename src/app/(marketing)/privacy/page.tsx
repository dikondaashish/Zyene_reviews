import type { Metadata } from "next";
import { REGIONAL_COMPLIANCE_SECTIONS } from "@/lib/phase8/compliance-data";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Learn how Zyene Reviews collects, uses, and protects your personal data. We are committed to GDPR compliance, Google API Limited Use requirements, and transparent data practices.",
    alternates: { canonical: "https://zyenereviews.com/privacy" },
    openGraph: {
        title: "Privacy Policy — Zyene Reviews",
        description: "How Zyene Reviews handles your data: GDPR compliant, Google API Limited Use, secure OAuth.",
        url: "https://zyenereviews.com/privacy",
    },
    twitter: {
        card: "summary_large_image",
        title: "Privacy Policy — Zyene Reviews",
        description: "GDPR compliant, Google API Limited Use policy, secure OAuth. Learn how Zyene Reviews protects your data.",
    },
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background py-24 text-foreground">
            <div className="container mx-auto px-4 sm:px-8 max-w-4xl bg-card p-8 md:p-16 rounded-lg border border-border">
                <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

                <div className="prose max-w-none prose-headings:text-foreground prose-a:text-primary hover:prose-a:brightness-90 prose-p:text-muted-foreground prose-li:text-muted-foreground">
                    <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <p>
                        Zyene Reviews, a product of{" "}
                        <a href="https://zyene.com" target="_blank" rel="noopener noreferrer">
                            Zyene, Inc
                        </a>{" "}
                        (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting it through this Privacy Policy.
                        This Privacy Policy governs your access to and use of zyenereviews.com, app.zyenereviews.com, and any related
                        software, applications, or services (collectively, the "Services").
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">1. Information We Collect</h2>
                    <p>We collect several types of information from and about users of our Services, including:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Identifiers:</strong> such as your real name, alias, postal address, unique personal identifier, online identifier, Internet Protocol (IP) address, email address, account name, or other similar identifiers.</li>
                        <li><strong>Commercial information:</strong> including records of products or services purchased, obtained, or considered, or other purchasing or consuming histories or tendencies.</li>
                        <li><strong>Internet or other electronic network activity information:</strong> including, but not limited to, browsing history, search history, and information regarding your interaction with an internet website, application, or advertisement.</li>
                        <li><strong>Customer Data:</strong> information you upload or provide regarding your customers (names, emails, phone numbers) for the sole purpose of sending review requests on your behalf.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">2. Integration with Third-Party Platforms</h2>
                    <p>
                        If you choose to integrate our Services with third-party platforms such as Google, Yelp, or Facebook:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Google API Services:</strong> Our use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</li>
                        <li>We request access only to data required to perform our Services, such as reading and responding to reviews on your behalf.</li>
                        <li>You can revoke access to these platforms at any time through your integration settings.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">2a. Google API Limited Use Disclosure</h2>
                    <p>In accordance with Google&apos;s Limited Use requirements, Zyene Reviews commits to the following:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>We do not use Google user data for advertising purposes.</li>
                        <li>We do not sell, lease, or transfer Google API data to third parties.</li>
                        <li>We do not use Google API data for purposes unrelated to providing or improving user-facing functionality within our Services.</li>
                        <li>Our use of Google API data is strictly limited to providing and improving the review management features of our Services.</li>
                        <li>Users can revoke Zyene&apos;s access to their Google data at any time through their <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account security settings</a>.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">3. How We Use Your Information</h2>
                    <p>We use information that we collect about you or that you provide to us, including any personal information:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>To present our Services and its contents to you.</li>
                        <li>To provide you with information, products, or services that you request from us.</li>
                        <li>To process and send review requests to your customers on your behalf.</li>
                        <li>To fulfill any other purpose for which you provide it.</li>
                        <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.</li>
                        <li>To notify you about changes to our Services or any products or services we offer or provide though it.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">4. Sharing Your Information</h2>
                    <p>We do not sell your personal information or your customers' data. We may disclose aggregated information about our users, and information that does not identify any individual, without restriction. We may disclose personal information that we collect or you provide as described in this privacy policy:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>To contractors, service providers, and other third parties we use to support our business (e.g., Stripe for payment processing, Resend for transactional emails).</li>
                        <li>To fulfill the purpose for which you provide it.</li>
                        <li>For any other purpose disclosed by us when you provide the information.</li>
                        <li>With your consent.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">5. Cookies &amp; Tracking Technologies</h2>
                    <p>We use cookies and similar tracking technologies to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>Remember your preferences and login sessions.</li>
                        <li>Analyze site traffic and usage patterns (via Vercel Analytics).</li>
                        <li>Improve the performance and reliability of our Services.</li>
                    </ul>
                    <p>
                        You can manage cookie preferences through your browser settings. We do not use tracking technologies for third-party advertising.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">6. Data Security</h2>
                    <p>
                        We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All payment transactions are encrypted and processed through our payment gateway provider, Stripe. We do not store your credit card information on our servers.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">7. Your Data Rights</h2>
                    <p>
                        Depending on your location, you may have the right to request access to, correction of, or deletion of your personal data.
                        You can manage your account information within the application dashboard. To exercise other data rights, please contact us.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">8. Changes to Our Privacy Policy</h2>
                    <p>
                        It is our policy to post any changes we make to our privacy policy on this page. If we make material changes to how we treat our users' personal information, we will notify you by email to the primary email address specified in your account.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">9. SMS Communications</h2>
                    <p>
                        By providing your phone number, you consent to receive SMS messages from Zyene Reviews. These messages may include review alerts, account notifications, and messages sent on behalf of businesses using our platform.
                    </p>
                    <p className="mt-4">
                        Message frequency varies. Message and data rates may apply.
                    </p>
                    <p className="mt-4">
                        You can opt out of SMS messages at any time by replying STOP. For assistance, reply HELP or contact us at <a href="mailto:support@zyenereviews.com">support@zyenereviews.com</a>.
                    </p>
                    <p className="mt-4">
                        We do not sell, rent, or share your phone number with third parties for their marketing purposes.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">10. Regional Privacy Rights (GDPR, CCPA, LGPD)</h2>
                    <p className="mb-6">
                        In addition to the practices above, users in the European Union, United Kingdom, California, and
                        Brazil have specific rights under applicable regulations. Summaries below; contact{" "}
                        <a href="mailto:privacy@zyenereviews.com">privacy@zyenereviews.com</a> to exercise your rights.
                    </p>
                    {REGIONAL_COMPLIANCE_SECTIONS.map((section) => (
                        <div key={section.id} className="mb-8">
                            <h3 className="text-xl font-semibold mt-6 mb-2">{section.title}</h3>
                            <p className="mb-3">{section.summary}</p>
                            <ul className="list-disc pl-6 space-y-2">
                                {section.bullets.map((b) => (
                                    <li key={b}>{b}</li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <h2 className="text-2xl font-semibold mt-10 mb-4">11. Contact Information</h2>
                    <p>
                        To ask questions or comment about this privacy policy and our privacy practices, contact us at: <a href="mailto:support@zyenereviews.com">support@zyenereviews.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
