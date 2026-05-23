"use client";

import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";

export function Step3FormHeader({
    initialCategory,
    isGoogleConnected,
}: {
    initialCategory?: string;
    isGoogleConnected?: boolean;
}) {
    return (
        <div className="text-center space-y-3">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                className="inline-flex"
            >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 mx-auto">
                    <LayoutGrid className="w-7 h-7 text-primary" />
                </div>
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                What&apos;s your industry?
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-xs sm:text-sm">
                We&apos;ll tailor your review templates and response suggestions to match.
            </p>
            {initialCategory && isGoogleConnected && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-chart-2/10 border border-chart-2/35 rounded-full text-xs font-semibold text-chart-2"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Auto-detected from Google
                </motion.div>
            )}
        </div>
    );
}
