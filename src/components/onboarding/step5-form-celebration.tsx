"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Star } from "lucide-react";

const CHECK_ITEMS = [
    { label: "Business profile created", delay: 0.1, always: true },
    { label: "Google Business syncing ,  reviews appear within ~1 hour", delay: 0.2, always: false },
    { label: "Review templates ready", delay: 0.3, always: true },
] as const;

export function Step5FormCelebration({
    firstName,
    businessName,
    googleConnected,
}: {
    firstName: string;
    businessName: string;
    googleConnected: boolean;
}) {
    return (
        <>
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="inline-flex"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/15 rounded-full animate-ping opacity-40" />
                    <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center ring-1 ring-primary/20 size-16">
                        <Sparkles className="text-primary size-8" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
            >
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    You&apos;re all set, {firstName}!
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Your Zyene Reviews dashboard is ready for{" "}
                    <strong className="text-foreground">{businessName}</strong>.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-2.5 max-w-sm mx-auto text-left">
                {CHECK_ITEMS.map((item) => {
                    if (!item.always && !googleConnected) return null;
                    return (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: item.delay, duration: 0.3 }}
                            className="flex items-center gap-3 p-3.5 bg-chart-2/10 rounded-xl border border-chart-2/25"
                        >
                            <div className="rounded-lg bg-chart-2/15 flex items-center justify-center shrink-0 size-7">
                                <CheckCircle2 className="text-chart-2 size-4" />
                            </div>
                            <span className="text-xs font-medium text-foreground">{item.label}</span>
                        </motion.div>
                    );
                })}

                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="flex items-center gap-3 p-3.5 bg-primary/[0.04] rounded-xl border border-primary/10"
                >
                    <div className="rounded-lg bg-primary/10 flex items-center justify-center shrink-0 size-7">
                        <Star className="text-primary size-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Next:</strong> Send your first review request from the
                        dashboard.
                    </p>
                </motion.div>
            </div>
        </>
    );
}
