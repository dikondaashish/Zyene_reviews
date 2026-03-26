"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronRight } from "lucide-react";
import { stepCategorySchema, type StepCategoryFormData } from "@/lib/validation/onboarding";
import { updateBusinessCategory } from "@/app/actions/onboarding";

const CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "coffee", label: "Coffee / Cafe" },
  { value: "salon", label: "Salon / Beauty" },
  { value: "dental", label: "Dental" },
  { value: "gym", label: "Gym / Fitness" },
  { value: "spa", label: "Spa" },
  { value: "hotel", label: "Hotel" },
  { value: "retail", label: "Retail" },
  { value: "automotive", label: "Automotive" },
  { value: "healthcare", label: "Healthcare" },
  { value: "other", label: "Other" },
];

interface Step3FormProps {
  businessId: string;
  businessName: string;
  city: string;
  onNext: () => void;
  isLoading?: boolean;
}

export function Step3Form({
  businessId,
  onNext,
  isLoading: externalIsLoading = false,
}: Step3FormProps) {
  const [isLoading, setIsLoading] = useState(externalIsLoading);

  const form = useForm<StepCategoryFormData>({
    resolver: zodResolver(stepCategorySchema),
    defaultValues: { category: undefined as unknown as StepCategoryFormData["category"] },
    mode: "onChange",
  });

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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          What's your specialty?
        </h2>
        <p className="text-lg text-slate-600 max-w-sm mx-auto leading-relaxed">
          Select a category so we can tailor the review collection templates to your specific industry.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <Label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">
            Business category
          </Label>
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  form.trigger("category");
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="h-16 bg-white border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all rounded-2xl text-lg shadow-sm">
                  <SelectValue placeholder="Select your industry..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 shadow-xl">
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-1">
                    {CATEGORIES.map((c) => (
                      <SelectItem 
                        key={c.value} 
                        value={c.value}
                        className="rounded-xl py-3 px-4 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors"
                      >
                        {c.label}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.category && (
            <p className="text-sm font-medium text-red-500 flex items-center gap-1.5 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {form.formState.errors.category.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={!selectedCategory || isLoading}
          className="w-full h-16 shadow-xl shadow-slate-200 rounded-[1.25rem] text-xl font-bold group"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Saving...</>
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>

      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 mt-4">
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          <strong>Tip:</strong> Don't see your category? Choose <strong>Other</strong> and we'll help you set it up later. Your selection helps us provide industry-specific response templates.
        </p>
      </div>
    </motion.div>
  );
}
