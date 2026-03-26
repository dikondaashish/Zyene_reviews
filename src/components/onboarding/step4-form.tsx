"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Star, ChevronRight, CheckCircle2 } from "lucide-react";

interface Step4FormProps {
  businessId: string;
  businessName: string;
  userEmail: string;
  userName: string;
  googleConnected: boolean;
  onNext: () => void;
  isLoading?: boolean;
}

export function Step4Form({
  businessId,
  businessName,
  userEmail,
  userName,
  googleConnected,
  onNext,
  isLoading = false,
}: Step4FormProps) {
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
        colors: ["#2563eb", "#10b981", "#fbbf24", "#ef4444"],
      });
    } catch {
      console.debug("canvas-confetti not available");
    }
  };

  useEffect(() => {
    setMounted(true);
    fireConfetti();
    
    // Mark onboarding as completed in the background
    const markComplete = async () => {
      setIsCompleting(true);
      try {
        const { completeOnboarding } = await import("@/app/actions/onboarding");
        await completeOnboarding(businessId);
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
      } finally {
        setIsCompleting(false);
      }
    };
    
    markComplete();
  }, [businessId]);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8 py-4"
    >
      <div className="relative inline-flex mb-2">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-25" />
        <div className="relative w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center border-2 border-primary/10 shadow-inner">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          You're all set, {firstName}! 🎉
        </h2>
        <p className="text-lg text-slate-600 max-w-sm mx-auto">
          Your Zyene Reviews dashboard is ready for {businessName}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto text-left">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">Business Profile Created</span>
        </div>
        
        {googleConnected && (
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Google Business Profile Syncing</span>
          </div>
        )}

        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs text-slate-600">
            <strong>Next:</strong> Send your first review request from the dashboard.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={onNext}
          disabled={isLoading}
          className="cta-button w-full h-16 text-xl shadow-2xl shadow-primary/20"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              Go to my Dashboard
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
        <p className="mt-4 text-xs text-slate-400 font-medium">
          Ready to skyrocket your online reputation.
        </p>
      </div>
    </motion.div>
  );
}
