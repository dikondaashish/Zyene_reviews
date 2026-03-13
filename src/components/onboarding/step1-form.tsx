"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { step1FormSchema, type Step1FormData } from "@/lib/validations/onboarding";
import { createBusinessAndAdvanceOnboarding } from "@/app/actions/onboarding";

const CATEGORIES = [
  "Restaurant",
  "Retail",
  "Healthcare/Dental",
  "Auto Service",
  "Beauty/Salon",
  "Home Services",
  "Legal",
  "Real Estate",
  "Other",
];

interface Step1Props {
  onNext: (business: any) => void;
  isLoading: boolean;
  organizationId: string;
  initialFullName?: string;
}

export function Step1Form({ onNext, isLoading, organizationId, initialFullName }: Step1Props) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    watch,
    formState: { errors, isValid },
    handleSubmit,
    setValue,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1FormSchema),
    mode: "onChange",
    defaultValues: {
      businessName: initialFullName ? `${initialFullName}'s Business` : "",
      businessCategory: "",
      city: "",
      phone: "",
    },
  });

  const businessName = watch("businessName");
  const businessCategory = watch("businessCategory");
  const city = watch("city");
  const phone = watch("phone");

  // Check if each required field is valid
  const isBusinessNameValid = businessName && businessName.length >= 2;
  const isCategoryValid = businessCategory && businessCategory.length > 0;
  const isCityValid = city && city.length >= 2;

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (formData: Step1FormData) => {
    setSubmitting(true);
    try {
      const result = await createBusinessAndAdvanceOnboarding(formData, organizationId);

      if (result.success && result.business) {
        toast.success("Business created successfully!");
        onNext(result.business);
      } else {
        toast.error(result.error || "Failed to create business");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "25%" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Tell us about your business</h2>
        <p className="text-gray-600 mt-2">
          This helps us personalize your dashboard
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Business Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="businessName" className="font-semibold">
              Business Name
            </Label>
            {isBusinessNameValid && !errors.businessName && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </motion.div>
            )}
          </div>
          <Input
            id="businessName"
            placeholder="Acme Restaurant"
            {...register("businessName")}
            disabled={submitting || isLoading}
            className={`text-base ${errors.businessName ? "border-red-500" : ""}`}
          />
          {errors.businessName && (
            <p className="text-sm text-red-500">{errors.businessName.message}</p>
          )}
        </div>

        {/* Business Category */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="businessCategory" className="font-semibold">
              Business Category
            </Label>
            {isCategoryValid && !errors.businessCategory && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </motion.div>
            )}
          </div>
          <Controller
            name="businessCategory"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={submitting || isLoading}>
                <SelectTrigger id="businessCategory" className={`text-base ${errors.businessCategory ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.businessCategory && (
            <p className="text-sm text-red-500">{errors.businessCategory.message}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="city" className="font-semibold">
              City
            </Label>
            {isCityValid && !errors.city && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </motion.div>
            )}
          </div>
          <Input
            id="city"
            placeholder="Denver, CO"
            {...register("city")}
            disabled={submitting || isLoading}
            className={`text-base ${errors.city ? "border-red-500" : ""}`}
          />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="font-semibold">
            Phone Number <span className="text-gray-500 font-normal">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 555-5555"
            {...register("phone")}
            disabled={submitting || isLoading}
            className="text-base"
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
          {phone && !errors.phone && (
            <p className="text-xs text-gray-500">Format: (555) 555-5555 or similar</p>
          )}
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={!isValid || submitting || isLoading}
            className="w-full text-base py-6"
          >
            {submitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Business...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Helper text */}
      <p className="text-xs text-gray-500 text-center">
        You can always update this information later
      </p>
    </motion.div>
  );
}
