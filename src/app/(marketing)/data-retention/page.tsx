import Link from "next/link";
import { Shield, Database, Lock, Clock } from "lucide-react";

export const metadata = {
    title: "Data Retention Policy - Zyene Ratings",
    description: "Our policy regarding data storage, retention limits, and deletion protocols.",
};

export default function DataRetentionPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-20 text-slate-900 relative">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl pt-16">

                <div className="flex items-center space-x-2 text-sm text-slate-500 mb-8">
                    <Link href="/" className="hover:text-slate-900 transition">Home</Link>
                    <span>/</span>
                    <span className="text-slate-900 font-medium">Data Retention Policy</span>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Database className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">Data Retention Policy</h1>
                        <p className="text-slate-600 text-lg">Last Updated: October 2023</p>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-600 dark:prose-invert">
                        <p>
                            At Zyene Ratings, we prioritize your privacy and data security. This Data Retention Policy outlines how long we store your data, when we delete it, and how you can request deletion. We adhere to GDPR and CCPA compliance standards.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 my-10 not-prose">
                            <div className="p-6 border rounded-2xl bg-slate-50 border-slate-200">
                                <Clock className="w-8 h-8 text-blue-600 mb-4" />
                                <h3 className="text-lg font-bold mb-2 text-slate-900">Aggressive Retention Limits</h3>
                                <p className="text-sm text-slate-600">We do not store review data indefinitely. Cached reviews are purged after 2 years unless actively synced.</p>
                            </div>
                            <div className="p-6 border rounded-2xl bg-slate-50 border-slate-200">
                                <Shield className="w-8 h-8 text-blue-600 mb-4" />
                                <h3 className="text-lg font-bold mb-2 text-slate-900">Anonymization</h3>
                                <p className="text-sm text-slate-600">Customer PII (email, phone) attached to review requests are anonymized 90 days after the campaign completes.</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold mb-4 text-slate-900 mt-10">1. Information We Store</h2>
                        <ul className="list-disc pl-6 space-y-2 mb-8">
                            <li><strong>Account Data:</strong> Business profiles, organization members, and billing history.</li>
                            <li><strong>Customer Data:</strong> Contact information uploaded for review campaigns.</li>
                            <li><strong>Review Data:</strong> Public reviews synced from connected platforms.</li>
                            <li><strong>Operational Logs:</strong> Infrastructure logs temporarily held for debugging.</li>
                        </ul>

                        <h2 className="text-2xl font-semibold mb-4 text-slate-900">2. Retention Periods</h2>
                        <div className="overflow-x-auto not-prose mb-8">
                            <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="p-4 border-b font-semibold text-slate-900 border-slate-200">Data Type</th>
                                        <th className="p-4 border-b font-semibold text-slate-900 border-slate-200">Retention Period</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-4 border-b border-slate-200 font-medium">Operational Logs</td>
                                        <td className="p-4 border-b border-slate-200 text-slate-600">30 Days</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-200 font-medium">Review Request Customers</td>
                                        <td className="p-4 border-b border-slate-200 text-slate-600">12 Months (or active subscription)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-200 font-medium">Cached Review Data</td>
                                        <td className="p-4 border-b border-slate-200 text-slate-600">24 Months</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-200 font-medium">Canceled Account Data</td>
                                        <td className="p-4 border-b border-slate-200 text-slate-600">90 Days post-cancellation</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2 className="text-2xl font-semibold mb-4 text-slate-900">3. Deletion Rights (Right to be Forgotten)</h2>
                        <p>
                            You have the right to request the deletion of all your organizational data at any time. When you exercise this right, we will securely erase your account, campaigns, and synced reviews from our active databases within 30 days. Backups are rotated and purged automatically within 60 days.
                        </p>

                        <div className="mt-12 p-6 bg-blue-50 text-blue-900 rounded-2xl border border-blue-100 text-center not-prose">
                            <h3 className="font-semibold mb-2">Have a question about your data?</h3>
                            <p className="text-sm opacity-90 mb-4">Contact our Data Protection Officer for inquiries.</p>
                            <a href="mailto:privacy@zyenereviews.com" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Email Privacy Team</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
