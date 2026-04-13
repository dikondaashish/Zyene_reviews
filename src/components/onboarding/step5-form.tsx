"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Star, ArrowRight, CheckCircle2, Sparkles, Rocket } from "lucide-react";
import { completeOnboarding } from "@/app/actions/onboarding";

interface Step5FormProps {
  businessId: string;
  businessName: string;
  userEmail: string;
  userName: string;
  googleConnected: boolean;
  onNext: () => void;
  isLoading?: boolean;
}

export function Step5Form({
  businessId,
  businessName,
  userEmail,
  userName,
  googleConnected,
  onNext,
  isLoading = false,
}: Step5FormProps) {
  const [mounted, setMounted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const firstName = userName.split(" ")[0];

  const fireConfetti = async () => {
    try {
      const confettiModule = await import("canvas-confetti");
      const confetti = confettiModule.default;
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7C3AED", "#F97316", "#10b981", "#3B82F6"],
      });
    } catch {
      console.debug("canvas-confetti not available");
    }
  };

  useEffect(() => {
    setMounted(true);
    fireConfetti();
  }, []);

  const handleGoToDashboard = async () => {
    setIsCompleting(true);
    try {
      const result = await completeOnboarding(businessId);
      if (!result.success) {
        toast.error(result.error || "Could not finish setup. Please try again.");
        return;
      }
      onNext();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (!mounted) return null;

  const checkItems = [
    { label: "Business profile created", delay: 0.1, always: true },
    { label: "Google Business syncing", delay: 0.2, always: false, show: googleConnected },
    { label: "Review templates ready", delay: 0.3, always: true },
  ];

  return (
    <div className="text-center space-y-8 py-2">
      {/* Celebration icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="inline-flex"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/15 rounded-full animate-ping opacity-40" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center ring-1 ring-primary/20">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          You&apos;re all set, {firstName}!
        </h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Your Zyene Reviews dashboard is ready for <strong className="text-foreground">{businessName}</strong>.
        </p>
      </motion.div>

      {/* Checklist */}
      <div className="grid grid-cols-1 gap-2.5 max-w-sm mx-auto text-left">
        {checkItems.map((item) => {
          if (!item.always && !item.show) return null;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: item.delay, duration: 0.3 }}
              className="flex items-center gap-3 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </motion.div>
          );
        })}

        {/* Next step hint */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex items-center gap-3 p-3.5 bg-primary/[0.04] rounded-xl border border-primary/10"
        >
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Star className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Next:</strong> Send your first review request from the dashboard.
          </p>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-2"
      >
        <Button
          onClick={handleGoToDashboard}
          disabled={isLoading || isCompleting}
          className="cta-button w-full h-14 text-base group cursor-pointer"
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
        <p className="mt-4 text-xs text-muted-foreground/60 font-medium">
          Ready to grow your online reputation.
        </p>
      </motion.div>
    </div>
  );
}
