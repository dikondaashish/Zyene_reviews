"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
  stepBusinessLocationSchema,
  type StepBusinessLocationFormData,
} from "@/lib/validations/onboarding";
import { createBusinessWithLocation } from "@/app/actions/onboarding";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  trackOnboardingStepStarted,
  trackOnboardingStepCompleted,
  trackOnboardingStepError,
} from "@/lib/analytics/onboarding-tracking";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

interface Step2BusinessProps {
  organizationId: string;
  onSuccess: (businessId: string, businessName: string) => void;
  onBack: () => void;
}

export function Step2Business({
  organizationId,
  onSuccess,
  onBack,
}: Step2BusinessProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackOnboardingStepStarted(2);
  }, []);

  const form = useForm<StepBusinessLocationFormData>({
    resolver: zodResolver(stepBusinessLocationSchema),
    defaultValues: {
      businessName: "",
      locationName: "",
      address: "",
      city: "",
      state: "",
      phone: "",
    },
  });

  async function onSubmit(data: StepBusinessLocationFormData) {
    setIsLoading(true);
    try {
      const result = await createBusinessWithLocation(organizationId, data);

      if (!result.success) {
        trackOnboardingStepError(2, result.error || "Unknown error", "businessName");
        toast.error(result.error || "Failed to create business");
        setIsLoading(false);
        return;
      }

      trackOnboardingStepCompleted(2);
      toast.success("Business created successfully!");
      onSuccess(result.business!.id, result.business!.name);
    } catch (error: any) {
      console.error("Error:", error);
      trackOnboardingStepError(2, error?.message || "Unexpected error");
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add Your Business</h1>
        <p className="text-gray-600">
          Tell us about your business location
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Downtown Restaurant"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Main Location, Flagship Store"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Name to distinguish this location if you have multiple
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 123 Main St"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., San Francisco"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., (555) 123-4567"
                    {...field}
                    disabled={isLoading}
                  />
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
        <div className="h-2 w-8 bg-gray-300 rounded-full" />
        <div className="h-2 w-8 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}
