"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2, Rocket, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Step5FormCta({
    isLoading,
    isCompleting,
    onGoToDashboard,
}: {
    isLoading: boolean;
    isCompleting: boolean;
    onGoToDashboard: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-2"
        >
            <Button
                onClick={onGoToDashboard}
                disabled={isLoading || isCompleting}
                className="cta-button w-full h-12 text-sm group cursor-pointer"
            >
                {isLoading || isCompleting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <>
                        <Rocket className="mr-2 h-5 w-5" />
                        Go to my Dashboard
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                )}
            </Button>
            <a
                href="/requests"
                className="inline-flex items-center justify-center w-full h-12 text-sm font-semibold text-primary hover:text-primary/80 border-2 border-primary/20 hover:border-primary/40 rounded-2xl transition-all group mt-2"
            >
                <Send className="mr-2 h-4 w-4" />
                Send your first review request
                <ArrowRight className="ml-2 h-4 w-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <p className="mt-4 text-xs text-muted-foreground/60 font-medium">
                Ready to grow your online reputation.
            </p>
        </motion.div>
    );
}
