"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Loader2, ArrowRight, LayoutGrid,
  UtensilsCrossed, Coffee, Scissors, Stethoscope,
  Dumbbell, Sparkles, BedDouble, ShoppingBag,
  Car, HeartPulse, MoreHorizontal,
} from "lucide-react";
import { stepCategorySchema, type StepCategoryFormData } from "@/lib/validations/onboarding";
import { updateBusinessCategory } from "@/app/actions/onboarding";

const CATEGORIES = [
  { value: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { value: "coffee", label: "Coffee / Cafe", icon: Coffee },
  { value: "salon", label: "Salon / Beauty", icon: Scissors },
  { value: "dental", label: "Dental", icon: Stethoscope },
  { value: "gym", label: "Gym / Fitness", icon: Dumbbell },
  { value: "spa", label: "Spa", icon: Sparkles },
  { value: "hotel", label: "Hotel", icon: BedDouble },
  { value: "retail", label: "Retail", icon: ShoppingBag },
  { value: "automotive", label: "Automotive", icon: Car },
  { value: "healthcare", label: "Healthcare", icon: HeartPulse },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

interface Step3FormProps {
  businessId: string;
  businessName: string;
  city: string;
  initialCategory?: string;
  isGoogleConnected?: boolean;
  onNext: () => void;
  isLoading?: boolean;
}

export function Step3Form({
  businessId,
  initialCategory,
  isGoogleConnected = false,
  onNext,
  isLoading: externalIsLoading = false,
}: Step3FormProps) {
  const [isLoading, setIsLoading] = useState(externalIsLoading);

  const form = useForm<StepCategoryFormData>({
    resolver: zodResolver(stepCategorySchema),
    defaultValues: {
      category: (initialCategory as StepCategoryFormData["category"]) || (undefined as unknown as StepCategoryFormData["category"]),
    },
    mode: "onChange",
  });

  // If Google already provided a category, set it and trigger validation
  useEffect(() => {
    if (initialCategory) {
      form.setValue("category", initialCategory as StepCategoryFormData["category"]);
      form.trigger("category");
    }
  }, [initialCategory, form]);

  const selectedCategory = form.watch("category");

  const onSubmit = async (data: StepCategoryFormData) => {
    setIsLoading(true);
    try {
      const result = await updateBusinessCategory(businessId, data);
      if (result.success) {
        toast.success("Category saved!");
        onNext();
      } else {
        toast.error(result.error || "Failed to save category");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="inline-flex"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 mx-auto">
            <LayoutGrid className="w-8 h-8 text-primary" />
          </div>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          What&apos;s your industry?
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-sm sm:text-base">
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

      {/* Category tile grid */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat, index) => {
                const Icon = cat.icon;
                const isSelected = field.value === cat.value;

                return (
                  <motion.button
                    key={cat.value}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    onClick={() => {
                      field.onChange(cat.value);
                      form.trigger("category");
                    }}
                    disabled={isLoading}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer group
                      ${isSelected
                        ? "border-primary bg-primary/[0.06] ring-2 ring-primary/20"
                        : "border-border/40 bg-background/40 hover:border-primary/30 hover:bg-primary/[0.02]"
                      }
                    `}
                  >
                    {/* Selected checkmark */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}

                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                      ${isSelected ? "bg-primary/15 text-primary" : "bg-secondary/60 text-muted-foreground group-hover:text-primary/70"}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-semibold text-center leading-tight ${
                      isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}>
                      {cat.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        />
        {form.formState.errors.category && (
          <p className="text-sm font-medium text-destructive flex items-center gap-1.5 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
            {form.formState.errors.category.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={!selectedCategory || isLoading}
          className="w-full h-14 font-semibold cta-button"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Button>
      </form>

      {/* Tip */}
      <div className="flex items-start gap-3 p-4 bg-primary/[0.04] border border-primary/10 rounded-2xl">
        <LayoutGrid className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Don&apos;t see yours?</span> Pick <strong>Other</strong> and we&apos;ll customize your setup later.
        </p>
      </div>
    </div>
  );
}
