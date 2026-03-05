"use client";

import { Building2, Mail, Shield, Users } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-24">
            <div className="container mx-auto px-4 sm:px-8 max-w-4xl">
                <div className="bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-slate-100">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">About Zyene Reviews</h1>
                    <p className="text-lg text-slate-600 mb-12 leading-relaxed">
                        Zyene Reviews is a product of <strong>The Budget Wheels LLC</strong>. We build software that helps local businesses manage their online reputation — so they can
                        focus on what they do best: serving their customers.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Our Mission</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    To make online reputation management accessible and simple for every local business,
                                    regardless of size or technical ability.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Who We Serve</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Restaurants, dental offices, auto shops, salons, and thousands of other local businesses
                                    that rely on customer reviews to grow.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Our Values</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    We believe in ethical review practices. We never engage in review gating, incentivized reviews,
                                    or any practice that violates platform policies.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Get in Touch</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Questions? Feedback? We&apos;d love to hear from you.<br />
                                    Email us at{" "}
                                    <a href="mailto:support@zyenereviews.com" className="text-orange-600 hover:text-orange-700 font-medium">
                                        support@zyenereviews.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">What Zyene Reviews Does</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Zyene Reviews is a SaaS platform that connects to your Google Business Profile through
                            Google&apos;s official OAuth authorization. Once connected, our platform helps you:
                        </p>
                        <ul className="space-y-2 text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                Monitor and respond to customer reviews from a single dashboard
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                Generate AI-powered reply suggestions to save time
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                Send review requests to customers via email, SMS, or shareable links
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                Track sentiment trends and receive real-time alerts on new reviews
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                Manage multiple business locations from one account
                            </li>
                        </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-8 mt-8">
                        <p className="text-xs text-slate-400">
                            Zyene Reviews is an independent platform and is not affiliated with, endorsed by, or sponsored by Google LLC.
                            Our use of Google API data adheres to the{" "}
                            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700">
                                Google API Services User Data Policy
                            </a>
                            , including the Limited Use requirements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
