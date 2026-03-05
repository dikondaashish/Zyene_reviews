export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-slate-50 py-24">
            <div className="container mx-auto px-4 sm:px-8 max-w-4xl bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>

                <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-orange-600 hover:prose-a:text-orange-700">
                    <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <p>
                        Welcome to Zyene Reviews, a product of The Budget Wheels LLC. These Terms of Service ("Terms") govern your access to and use of our
                        reputation management platform, websites, and services (collectively, the "Services").
                        Please read these Terms carefully before using the Services.
                    </p>

                    <p className="font-semibold">
                        By accessing or using the Services, you agree to be bound by these Terms and our Privacy Policy.
                        If you do not agree to these Terms, do not use the Services.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">1. Description of Services</h2>
                    <p>
                        Zyene Reviews provides software tools to help businesses request, monitor, and respond to customer reviews across third-party platforms (like Google, Yelp, and Facebook). We do not guarantee specific rating improvements or volume of reviews.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">2. Account Registration</h2>
                    <p>
                        To use our Services, you must register for an account. You must provide accurate and complete information and keep your account information updated. You are responsible for all activities that occur under your account, including those of your authorized team members ("Users").
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">3. Subscriptions and Payments</h2>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Billing:</strong> We offer subscription plans that bill on a recurring basis (monthly or annually). Payments are processed securely via Stripe.</li>
                        <li><strong>Free Trials:</strong> We may offer a 7-day free trial. If you do not cancel before the trial ends, you will be automatically charged for the subscription plan you selected.</li>
                        <li><strong>Cancellations:</strong> You may cancel your subscription at any time via the billing portal. Cancellations take effect at the end of the current billing cycle. We do not provide prorated refunds for partial usage.</li>
                        <li><strong>Limits:</strong> Your use of the Services is subject to the limits of your selected plan (e.g., location volume, monthly SMS/email requests). We reserve the right to pause campaigns if you exceed your allotted limits.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">4. Compliance with Communication Laws</h2>
                    <p>
                        When using our platform to send SMS messages, emails, or other communications to your customers, you agree to comply with all applicable local, national, and international laws, including but not limited to the Telephone Consumer Protection Act (TCPA), CAN-SPAM Act, and GDPR.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>You must have obtained the necessary consent from your customers before sending them review requests.</li>
                        <li>Businesses must obtain explicit written or electronic consent from customers before sending SMS review requests through our platform, in compliance with the Telephone Consumer Protection Act (TCPA) and Federal Communications Commission (FCC) regulations.</li>
                        <li>You are solely responsible for the content of the messages sent through our platform.</li>
                        <li>Zyene Reviews reserves the right to suspend your account if we determine, in our sole discretion, that you are sending spam or violating communication laws.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">5. Third-Party Integrations</h2>
                    <p>
                        Our Services interact with third-party platforms (e.g., Google Business Profile, Yelp). Your use of these platforms is governed by their respective terms of service. Zyene Reviews is not responsible for the availability, rules, or actions of these third-party platforms (e.g., if Google decides to remove a review or suspend a business listing).
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">6. Acceptable Use</h2>
                    <p>You agree not to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>Review gate (selectively asking for reviews only from happy customers) in a manner that violates the policies of Google or other review platforms.</li>
                        <li>Offer incentives (discounts, cash, gifts) in exchange for reviews, unless strictly permitted by the specific review platform's policies.</li>
                        <li>Use the Services for any illegal or unauthorized purpose.</li>
                        <li>Interfere with or disrupt the integrity or performance of the Services.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">7. Termination</h2>
                    <p>
                        We may terminate or suspend your access to the Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Services will immediately cease.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">8. Limitation of Liability</h2>
                    <p>
                        IN NO EVENT SHALL ZYENE REVIEWS, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES; (III) ANY CONTENT OBTAINED FROM THE SERVICES; AND (IV) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">9. Intellectual Property</h2>
                    <p>
                        The Services, including its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of The Budget Wheels LLC and its licensors. The Services are protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of The Budget Wheels LLC.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">10. Customer Data Ownership</h2>
                    <p>
                        You retain all rights to the data you upload or provide to our Services, including customer contact information, review responses, and business profile content. We do not claim ownership of your data. Upon termination of your account, you may request an export of your data within 30 days. After 90 days post-termination, your data will be permanently deleted in accordance with our Data Retention Policy.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">11. Service Availability</h2>
                    <p>
                        We strive to maintain 99.9% uptime for our Services, but we do not guarantee uninterrupted or error-free operation. The Services may be temporarily unavailable due to scheduled maintenance, system upgrades, or factors beyond our control. We are not liable for any loss or damage resulting from service downtime or interruptions.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">12. Governing Law &amp; Jurisdiction</h2>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in the State of Texas.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">13. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at: <a href="mailto:support@zyenereviews.com">support@zyenereviews.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
