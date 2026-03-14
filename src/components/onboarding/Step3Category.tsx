"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  stepCategorySchema,
  type StepCategoryFormData,
} from "@/lib/validations/onboarding";
import { updateBusinessCategory } from "@/app/actions/onboarding";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  trackOnboardingStepStarted,
  trackOnboardingStepCompleted,
  trackOnboardingStepError,
} from "@/lib/analytics/onboarding-tracking";

const CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "coffee", label: "Coffee Shop" },
  { value: "salon", label: "Hair & Beauty Salon" },
  { value: "dental", label: "Dental Office" },
  { value: "gym", label: "Gym & Fitness" },
  { value: "spa", label: "Spa & Wellness" },
  { value: "hotel", label: "Hotel & Lodging" },
  { value: "retail", label: "Retail Store" },
  { value: "automotive", label: "Auto Repair & Service" },
  { value: "healthcare", label: "Healthcare Provider" },
  { value: "other", label: "Other" },
];

interface Step3CategoryProps {
  businessId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function Step3Category({
  businessId,
  onSuccess,
  onBack,
}: Step3CategoryProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackOnboardingStepStarted(3);
  }, []);

  const form = useForm<StepCategoryFormData>({
    resolver: zodResolver(stepCategorySchema),
    mode: "onChange",
  });

  async function onSubmit(data: StepCategoryFormData) {
    setIsLoading(true);
    try {
      const result = await updateBusinessCategory(businessId, data);

      if (!result.success) {
        trackOnboardingStepError(3, result.error || "Unknown error", "category");
        toast.error(result.error || "Failed to update category");
        setIsLoading(false);
        return;
      }

      trackOnboardingStepCompleted(3);
      toast.success("Category updated successfully!");
      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      trackOnboardingStepError(3, error?.message || "Unexpected error");
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select Your Category</h1>
        <p className="text-gray-600">
          This helps us customize your review experience
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your business category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1" size="lg">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </div>
        </form>
      </Form>

      {/* Progress indicator */}
      <div className="mt-8 flex justify-center gap-2">
        <div className="h-2 w-8 bg-blue-600 rounded-full" />
        <div className="h-2 w-8 bg-blue-600 rounded-full" />
        <div className="h-2 w-8 bg-blue-600 rounded-full" />
        <div className="h-2 w-8 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}
