import Link from "next/link";
import { Star, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Left Branded Panel */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-12">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />

                {/* Gradient orbs */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-0 w-60 h-60 bg-blue-500/15 rounded-full blur-[80px]" />

                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/25">
                            <Star className="h-5 w-5 text-white fill-white" />
                        </div>
                        <span className="text-xl font-bold text-white">
                            <span className="text-orange-400">Zyene</span> Reviews
                        </span>
                    </Link>
                </div>

                {/* Headline */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
                            Manage your online<br />
                            reputation with ease
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                            Monitor reviews, respond faster with AI, and grow your business — all from one dashboard.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 max-w-md">
                            <div className="h-10 w-10 bg-orange-500/15 rounded-xl flex items-center justify-center shrink-0">
                                <Zap className="h-5 w-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">AI-Powered Replies</p>
                                <p className="text-slate-400 text-xs">Respond to reviews in one click</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 max-w-md">
                            <div className="h-10 w-10 bg-blue-500/15 rounded-xl flex items-center justify-center shrink-0">
                                <BarChart3 className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Real-Time Dashboard</p>
                                <p className="text-slate-400 text-xs">Monitor all reviews in one place</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 max-w-md">
                            <div className="h-10 w-10 bg-green-500/15 rounded-xl flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Secure Google OAuth</p>
                                <p className="text-slate-400 text-xs">Connect safely with official authorization</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} The Budget Wheels LLC. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Content Panel */}
            <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-12">
                {/* Mobile logo */}
                <div className="lg:hidden mb-10">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/25">
                            <Star className="h-5 w-5 text-white fill-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            <span className="text-orange-500">Zyene</span> Reviews
                        </span>
                    </Link>
                </div>

                <div className="w-full max-w-[420px]">
                    {children}
                </div>
            </div>
        </div>
    );
}
