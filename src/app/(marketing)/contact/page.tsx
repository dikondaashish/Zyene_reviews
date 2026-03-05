"use client";

import { Mail, Clock, MessageSquare, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-24">
            <div className="container mx-auto px-4 sm:px-8 max-w-4xl">
                <div className="bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-slate-100">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
                    <p className="text-lg text-slate-600 mb-12 leading-relaxed">
                        Have a question, need help, or want to learn more about Zyene Reviews?
                        We&apos;re here for you.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Email Support</h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">
                                For general inquiries, technical support, or account questions.
                            </p>
                            <a
                                href="mailto:support@zyenereviews.com"
                                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                                support@zyenereviews.com
                            </a>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Business Hours</h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-1">
                                Monday – Friday: 9:00 AM – 6:00 PM EST
                            </p>
                            <p className="text-sm text-slate-500">
                                We typically respond within 24 hours.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Enterprise Sales</h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">
                                Need custom integrations, unlimited locations, or a dedicated account manager?
                            </p>
                            <a
                                href="mailto:sales@zyenereviews.com?subject=Enterprise%20Inquiry"
                                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                                sales@zyenereviews.com
                            </a>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                    <HelpCircle className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Help Center</h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">
                                Browse our knowledge base for guides, tutorials, and FAQs.
                            </p>
                            <Link href="/help" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                                Visit Help Center →
                            </Link>
                        </div>
                    </div>

                    <div className="text-center border-t border-slate-100 pt-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">
                            Ready to get started?
                        </h2>
                        <p className="text-slate-600 mb-6 text-sm">
                            Try Zyene Reviews free for 7 days. No credit card required.
                        </p>
                        <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-8 py-6 font-medium">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
