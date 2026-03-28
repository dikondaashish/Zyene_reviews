"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Loader2, 
  ArrowRight, 
  Gem, 
  ShieldCheck, 
  Zap,
  Sparkles
} from "lucide-react";
import { stepPlanSchema, type StepPlanFormData } from "@/lib/validation/onboarding";
import { savePlanSelection } from "@/app/actions/onboarding";
import { Badge } from "@/components/ui/badge";

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
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary"
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
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 mx-auto">
            <Gem className="w-8 h-8 text-primary" />
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
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs font-semibold text-primary"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Connected profile detected: Pro plan recommended
          </motion.div>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan, index) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`
                relative flex flex-col p-5 rounded-2xl border-2 transition-all cursor-pointer group
                ${isSelected 
                  ? `${plan.borderColor} ${plan.bgColor} ring-2 ring-primary/10 shadow-lg` 
                  : "border-border/40 bg-white/40 hover:border-primary/30 hover:bg-white"
                }
              `}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white border-none px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${plan.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${plan.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{plan.name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                    {plan.interval === "month" ? "Monthly" : "Free Forever"}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  {plan.interval === "month" && (
                    <span className="text-xs text-muted-foreground">/mo</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.color}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-4">
                {isSelected ? (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary">
                    <Check className="w-4 h-4" />
                    Selected
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-center text-muted-foreground group-hover:text-primary transition-colors">
                    Select Plan
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="space-y-4 pt-2">
        <Button
          onClick={() => onSubmit(selectedPlan)}
          disabled={isLoading}
          className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all cursor-pointer group"
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
