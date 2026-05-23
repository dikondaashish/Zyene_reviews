"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Step2ChainIcon, Step2GoogleIcon } from "@/components/onboarding/step2-form-icons";

export function Step2FormGoogleConnectPanel({ onConnectClick }: { onConnectClick: () => void }) {
    return (
        <div className="relative p-8 sm:p-10 lg:p-12 flex flex-col justify-center overflow-hidden bg-primary/[0.03]">
            <div className="absolute -top-24 -left-24 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none size-72" />
            <div className="absolute -bottom-20 -right-20 bg-primary/[0.04] rounded-full blur-3xl pointer-events-none size-56" />

            <div className="relative z-10 space-y-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                    className="inline-flex"
                >
                    <div className="rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 size-14">
                        <Step2ChainIcon />
                    </div>
                </motion.div>

                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Connect your business</h2>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed max-w-xs">
                        Link Google to auto-fill your details, or enter them manually below.
                    </p>
                </div>

                <motion.button
                    type="button"
                    onClick={onConnectClick}
                    whileHover={{ scale: 1.01, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full max-w-[340px] h-14 group relative flex items-center justify-between px-6 rounded-2xl bg-background/80 backdrop-blur-xl border border-border shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-white/20 pointer-events-none" />

                    <div className="flex items-center gap-3.5 relative z-10">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-border/50 group-hover:scale-110 transition-transform duration-300">
                            <Step2GoogleIcon />
                        </div>
                        <span className="text-[14px] font-bold text-foreground tracking-tight">Connect Google Business</span>
                    </div>

                    <div className="relative z-10">
                        <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 size-5" />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>

                <div className="space-y-2.5">
                    {[
                        "Auto-import all your reviews",
                        "AI-powered response suggestions",
                        "Real-time sync — new reviews appear instantly",
                    ].map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                            <CheckCircle2 className="text-primary shrink-0 size-4" />
                            <span className="font-medium">{benefit}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
