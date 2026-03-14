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
import { stepCategorySchema, type StepCategoryFormData } from "@/lib/validations/onboarding";
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
      className="space-y-6"
    >
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "75%" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900">Category selection</h2>
        <p className="text-gray-600 mt-2">
          Choose the category that best fits your business.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>Business category</Label>
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.category && (
            <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={!selectedCategory || isLoading}
          className="w-full py-6"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
          ) : (
            <>Next <ChevronRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
