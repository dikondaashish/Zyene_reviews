import Link from "next/link";
import { Shield, Database, Lock, Clock } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Data Retention Policy",
    description:
        "Zyene Reviews data retention policy. How long we store your data, when it is deleted, and how to request deletion. GDPR and CCPA compliant.",
    alternates: { canonical: "https://zyenereviews.com/data-retention" },
    openGraph: {
        title: "Data Retention Policy — Zyene Reviews",
        description: "Data storage timelines, deletion schedules, and your rights under GDPR and CCPA.",
        url: "https://zyenereviews.com/data-retention",
    },
    twitter: {
        card: "summary_large_image",
        title: "Data Retention Policy — Zyene Reviews",
        description: "How long Zyene Reviews stores your data, when it is deleted, and your GDPR/CCPA rights.",
    },
};

export default function DataRetentionPage() {
    return (
        <div className="min-h-screen bg-background py-20 text-foreground relative">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl pt-16">

                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-foreground transition">Home</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Data Retention Policy</span>
                </div>

                <div className="bg-card p-8 md:p-12 rounded-lg border border-border">
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-lg border border-primary/20 flex items-center justify-center mx-auto mb-6">
                            <Database className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">Data Retention Policy</h1>
                        <p className="text-muted-foreground text-lg">Last Updated: March 2026</p>
                    </div>

                    <div className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
                        <p>
                            At Zyene Reviews, we prioritize your privacy and data security. This Data Retention Policy outlines how long we store your data, when we delete it, and how you can request deletion. We adhere to GDPR and CCPA compliance standards.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 my-10 not-prose">
                            <div className="p-6 border rounded-lg bg-muted border-border">
                                <Clock className="w-8 h-8 text-primary mb-4" />
                                <h3 className="text-lg font-bold mb-2 text-foreground">Aggressive Retention Limits</h3>
                                <p className="text-sm text-muted-foreground">We do not store review data indefinitely. Cached reviews are purged after 2 years unless actively synced.</p>
                            </div>
                            <div className="p-6 border rounded-lg bg-muted border-border">
                                <Shield className="w-8 h-8 text-primary mb-4" />
                                <h3 className="text-lg font-bold mb-2 text-foreground">Anonymization</h3>
                                <p className="text-sm text-muted-foreground">Customer PII (email, phone) attached to review requests are anonymized 90 days after the campaign completes.</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-10">1. Information We Store</h2>
                        <ul className="list-disc pl-6 space-y-2 mb-8">
                            <li><strong>Account Data:</strong> Business profiles, organization members, and billing history.</li>
                            <li><strong>Customer Data:</strong> Contact information uploaded for review campaigns.</li>
                            <li><strong>Review Data:</strong> Public reviews synced from connected platforms.</li>
                            <li><strong>Operational Logs:</strong> Infrastructure logs temporarily held for debugging.</li>
                        </ul>

                        <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Retention Periods</h2>
                        <div className="overflow-x-auto not-prose mb-8">
                            <table className="w-full text-left border-collapse border border-border rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="p-4 border-b font-semibold text-foreground border-border">Data Type</th>
                                        <th className="p-4 border-b font-semibold text-foreground border-border">Retention Period</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-4 border-b border-border font-medium">Operational Logs</td>
                                        <td className="p-4 border-b border-border text-muted-foreground">30 Days</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-border font-medium">Review Request Customers</td>
                                        <td className="p-4 border-b border-border text-muted-foreground">12 Months (or active subscription)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-border font-medium">Cached Review Data</td>
                                        <td className="p-4 border-b border-border text-muted-foreground">24 Months</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-border font-medium">Canceled Account Data</td>
                                        <td className="p-4 border-b border-border text-muted-foreground">90 Days post-cancellation</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Deletion Rights (Right to be Forgotten)</h2>
                        <p>
                            You have the right to request the deletion of all your organizational data at any time. When you exercise this right, we will securely erase your account, campaigns, and synced reviews from our active databases within 30 days. Backups are rotated and purged automatically within 60 days.
                        </p>

                        <div className="mt-12 p-6 bg-primary/10 text-foreground rounded-lg border border-primary/20 text-center not-prose">
                            <h3 className="font-semibold mb-2">Have a question about your data?</h3>
                            <p className="text-sm opacity-90 mb-4">Contact our Data Protection Officer for inquiries.</p>
                            <a href="mailto:privacy@zyenereviews.com" className="inline-block bg-primary border border-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:brightness-95 transition">Email Privacy Team</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
