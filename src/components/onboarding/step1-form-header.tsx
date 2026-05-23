"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export function Step1FormHeader() {
    return (
        <div className="text-center space-y-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                className="inline-flex"
            >
                <div className="rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 mx-auto size-14">
                    <Building2 className="text-primary size-7" />
                </div>
            </motion.div>

            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Name your workspace</h2>
                <p className="text-muted-foreground mt-1.5 text-sm max-w-xs mx-auto leading-relaxed">
                    This is your organization — the umbrella for all your business locations.
                </p>
            </div>
        </div>
    );
}
