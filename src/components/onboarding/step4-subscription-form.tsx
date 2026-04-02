"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Check,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Gem,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { savePlanSelection } from "@/app/actions/onboarding";
import { cn } from "@/lib/utils/index";

const PLANS = [
  {
    id: "none",
    name: "Free",
    price: "$0",
    interval: "forever",
    description: "Perfect for exploring the platform",
    features: [
      "10 AI review responses/mo",
      "1 Google Business profile",
      "Basic analytics dashboard",
      "Standard email support",
    ],
    icon: Zap,
  },
  {
    id: "starter_monthly",
    name: "Pro",
    price: "$29.99",
    interval: "month",
    description: "For growing businesses",
    features: [
      "Unlimited review sync",
      "500 AI review responses/mo",
      "Email & SMS notifications",
      "Response wait-time alerts",
      "Priority chat support",
    ],
    isPopular: true,
    icon: Sparkles,
  },
  {
    id: "professional_monthly",
    name: "Business",
    price: "$59.99",
    interval: "month",
    description: "For multi-location scaling",
    features: [
      "Everything in Pro, plus:",
      "3 Business locations",
      "3,000 AI review responses/mo",
      "White-label PDF reports",
      "Custom response templates",
      "Dedicated account manager",
    ],
    icon: ShieldCheck,
  },
] as const;

interface Step4SubscriptionFormProps {
  organizationId: string;
  isGoogleConnected?: boolean;
  onNext: () => void;
  isLoading?: boolean;
}

export function Step4SubscriptionForm({
  organizationId,
  isGoogleConnected = false,
  onNext,
  isLoading: externalIsLoading = false,
}: Step4SubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(externalIsLoading);
  const [selectedPlan, setSelectedPlan] = useState<string>("starter_monthly");

  const onSubmit = async (planId: string) => {
    setIsLoading(true);
    try {
      const result = await savePlanSelection(organizationId, {
        plan: planId as (typeof PLANS)[number]["id"],
      });
      if (result.success) {
        toast.success(`Plan updated to ${PLANS.find((p) => p.id === planId)?.name}!`);
        onNext();
      } else {
        toast.error(result.error || "Failed to save plan");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onSubmit("none");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="inline-flex"
        >
          <div className="w-16 h-16 rounded-2xl bg-[oklch(0.7_0.22_60)]/10 flex items-center justify-center ring-1 ring-[oklch(0.7_0.22_60)]/20 mx-auto">
            <Gem className="w-8 h-8 text-[oklch(0.7_0.22_60)]" />
          </div>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Choose your plan
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm sm:text-base">
          Unlock advanced AI features and unlimited sync to grow your reputation.
        </p>

        {isGoogleConnected && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200/80 rounded-full text-xs font-semibold text-orange-700 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden />
            Connected profile detected: Pro plan recommended
          </motion.div>
        )}
      </div>

      {/* Pricing grid — reference layout: white cards, muted header, green vs orange feature checks */}
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 lg:p-8 shadow-inner">
        <div className="grid grid-cols-1 gap-5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {PLANS.map((plan, index) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isPopular = "isPopular" in plan && plan.isPopular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="min-w-0"
              >
                <button
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "relative w-full text-left rounded-2xl border bg-white shadow-md shadow-slate-200/40 overflow-hidden transition-all duration-200",
                    "hover:shadow-lg hover:border-slate-300/90",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2",
                    isPopular &&
                      "ring-2 ring-orange-500 border-orange-400/90 shadow-orange-500/15",
                    !isPopular && isSelected && "ring-2 ring-orange-400/70 border-orange-200",
                    !isPopular && !isSelected && "border-slate-200/90",
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                      <span className="inline-block rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Top: plan + price (muted panel) */}
                  <div
                    className={cn(
                      "px-4 pb-4 pt-6 sm:px-5 sm:pb-5 sm:pt-7",
                      isPopular ? "bg-orange-50/40 pt-8" : "bg-slate-50/80",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isPopular ? "text-orange-500" : "text-orange-500",
                          )}
                          aria-hidden
                        />
                        <span className="font-semibold text-slate-900 truncate">
                          {plan.name}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full border border-slate-200/90 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                        {plan.id === "none" ? "Forever" : "Monthly"}
                      </span>
                    </div>

                    <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
                      {plan.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-baseline gap-1">
                      <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                        {plan.price}
                      </span>
                      {plan.interval === "month" && (
                        <span className="text-sm text-slate-500">/ mo</span>
                      )}
                    </div>

                    {/* Selection pill */}
                    <div
                      className={cn(
                        "mt-4 flex h-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                        isSelected
                          ? "border-orange-200 bg-orange-50 text-orange-700"
                          : "border-slate-200 bg-white text-slate-500",
                      )}
                    >
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-orange-600" aria-hidden />
                          Selected
                        </span>
                      ) : (
                        <span>Tap to select</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: features (white, separated) */}
                  <div className="border-t border-slate-100 bg-white px-4 py-4 sm:px-5">
                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-[12px] leading-snug text-slate-600"
                        >
                          <CheckCircle2
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0",
                              isPopular ? "text-orange-500" : "text-emerald-500",
                            )}
                            aria-hidden
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4 pt-2">
        <Button
          onClick={() => onSubmit(selectedPlan)}
          disabled={isLoading}
          className="w-full h-14 font-semibold cta-button shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              {selectedPlan === "none" ? "Start with Free" : "Start 7-Day Free Trial"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={handleSkip}
          disabled={isLoading}
          className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>

      {/* Social proof */}
      <div className="flex items-center justify-center gap-6 px-4 py-3 border border-dashed border-border/50 rounded-2xl bg-secondary/20">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Join <span className="text-foreground font-semibold">1,200+</span>{" "}
          businesses managing reviews with AI
        </p>
      </div>
    </div>
  );
}
