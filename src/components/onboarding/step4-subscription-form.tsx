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
import { Badge } from "@/components/ui/badge";
import * as PricingCard from "@/components/ui/pricing-card";
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
      "Standard email support"
    ],
    icon: Zap,
    color: "text-slate-500",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200"
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
      "Priority chat support"
    ],
    isPopular: true,
    icon: Sparkles,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500"
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
      "Dedicated account manager"
    ],
    icon: ShieldCheck,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  }
];

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
      const result = await savePlanSelection(organizationId, { plan: planId as any });
      if (result.success) {
        toast.success(`Plan updated to ${PLANS.find(p => p.id === planId)?.name}!`);
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
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-sm sm:text-base">
          Unlock advanced AI features and unlimited sync to grow your reputation.
        </p>
        
        {isGoogleConnected && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/5 border border-orange-500/20 rounded-full text-xs font-semibold text-orange-600"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Connected profile detected: Pro plan recommended
          </motion.div>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/15 p-4 sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.06) 0.8px, transparent 0.8px)",
            backgroundSize: "14px 14px",
            maskImage:
              "radial-gradient(ellipse at 50% 10%, rgba(0,0,0,1), rgba(0,0,0,0.2) 45%, rgba(0,0,0,0) 72%)",
          }}
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -top-1/2 left-1/2 h-[min(100vmin,560px)] w-[min(100vmin,560px)] -translate-x-1/2 rounded-full",
            "bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.12),transparent_55%)]",
            "blur-[28px]",
          )}
        />
        <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLANS.map((plan, index) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isPopular = !!plan.isPopular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                className="min-w-0"
              >
                <PricingCard.Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPlan(plan.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPlan(plan.id);
                    }
                  }}
                  className={cn(
                    "w-full max-w-none cursor-pointer transition-shadow",
                    isPopular &&
                      "ring-2 ring-orange-500/45 shadow-[0_20px_50px_-12px_rgba(249,115,22,0.22)]",
                    isSelected && "ring-2 ring-orange-500/70 shadow-lg",
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-2 right-2 z-20">
                      <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-md">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <PricingCard.Header className="relative z-10">
                    <PricingCard.Plan>
                      <PricingCard.PlanName>
                        <Icon className="text-orange-500" aria-hidden />
                        <span className="text-foreground">{plan.name}</span>
                      </PricingCard.PlanName>
                      <PricingCard.Badge>
                        {plan.interval === "month" ? "Monthly" : "Free"}
                      </PricingCard.Badge>
                    </PricingCard.Plan>
                    <PricingCard.Description className="mb-3">{plan.description}</PricingCard.Description>
                    <PricingCard.Price>
                      <PricingCard.MainPrice className="text-2xl">{plan.price}</PricingCard.MainPrice>
                      {plan.interval === "month" && (
                        <PricingCard.Period>/ mo</PricingCard.Period>
                      )}
                    </PricingCard.Price>
                    <div className="flex items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/30 py-2 text-xs font-semibold text-muted-foreground">
                      {isSelected ? (
                        <span className="flex items-center gap-1.5 text-orange-600">
                          <Check className="h-4 w-4" />
                          Selected
                        </span>
                      ) : (
                        <span className="group-hover:text-orange-600">Tap to select</span>
                      )}
                    </div>
                  </PricingCard.Header>
                  <PricingCard.Body>
                    <PricingCard.List>
                      {plan.features.map((feature) => (
                        <PricingCard.ListItem key={feature}>
                          <span className="mt-0.5 shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                          </span>
                          <span>{feature}</span>
                        </PricingCard.ListItem>
                      ))}
                    </PricingCard.List>
                  </PricingCard.Body>
                </PricingCard.Card>
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
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
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

      {/* Social Proof/Trust Seal */}
      <div className="flex items-center justify-center gap-6 px-4 py-3 border border-dashed border-border/50 rounded-2xl bg-secondary/20">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Join <span className="text-foreground font-semibold">1,200+</span> businesses managing reviews with AI
        </p>
      </div>
    </div>
  );
}
