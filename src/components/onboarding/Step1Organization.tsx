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
  stepOrganizationSchema,
  type StepOrganizationFormData,
} from "@/lib/validations/onboarding";
import { createOrganization } from "@/app/actions/onboarding";
import { Loader2 } from "lucide-react";
import {
  trackOnboardingStepStarted,
  trackOnboardingStepCompleted,
  trackOnboardingStepError,
  startStepTimer,
} from "@/lib/analytics/onboarding-tracking";

interface Step1OrganizationProps {
  onSuccess: (organizationId: string, organizationName: string) => void;
}

export function Step1Organization({ onSuccess }: Step1OrganizationProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackOnboardingStepStarted(1);
  }, []);

  const form = useForm<StepOrganizationFormData>({
    resolver: zodResolver(stepOrganizationSchema),
    defaultValues: {
      organizationName: "",
    },
  });

  async function onSubmit(data: StepOrganizationFormData) {
    setIsLoading(true);
    try {
      const result = await createOrganization(data);

      if (!result.success) {
        trackOnboardingStepError(1, result.error || "Unknown error", "organizationName");
        toast.error(result.error || "Failed to create organization");
        setIsLoading(false);
        return;
      }

      trackOnboardingStepCompleted(1);
      toast.success("Organization created successfully!");
      onSuccess(result.organization!.id, result.organization!.name);
    } catch (error: any) {
      console.error("Error:", error);
      trackOnboardingStepError(1, error?.message || "Unexpected error");
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Zyene Reviews</h1>
        <p className="text-gray-600">
          Let&apos;s start by setting up your organization
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Acme Corp"
                    {...field}
                    disabled={isLoading}
                    autoFocus
                  />
                </FormControl>
                <FormDescription>
                  The name of your company or organization
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>
      </Form>

      {/* Progress indicator */}
      <div className="mt-8 flex justify-center gap-2">
        <div className="h-2 w-8 bg-blue-600 rounded-full" />
        <div className="h-2 w-8 bg-gray-300 rounded-full" />
        <div className="h-2 w-8 bg-gray-300 rounded-full" />
        <div className="h-2 w-8 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}
