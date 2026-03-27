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
import { Checkbox } from "@/components/ui/checkbox";
import {
  stepNotificationsSchema,
  type StepNotificationsFormData,
} from "@/lib/validations/onboarding";
import { createNotificationPreferences } from "@/app/actions/onboarding";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  trackOnboardingStepStarted,
  trackOnboardingStepCompleted,
  trackOnboardingStepError,
  trackOnboardingCompleted,
} from "@/lib/analytics/onboarding-tracking";

interface Step4NotificationsProps {
  businessId: string;
  onBack: () => void;
}

export function Step4Notifications({
  businessId,
  onBack,
}: Step4NotificationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    trackOnboardingStepStarted(4);
  }, []);

  const form = useForm<StepNotificationsFormData>({
    resolver: zodResolver(stepNotificationsSchema),
    defaultValues: {
      emailAlerts: true,
      smsAlerts: false,
      phone: "",
    },
  });

  const smsAlerts = form.watch("smsAlerts");

  async function onSubmit(data: StepNotificationsFormData) {
    setIsLoading(true);
    try {
      const result = await createNotificationPreferences(businessId, data);

      if (!result.success) {
        trackOnboardingStepError(4, result.error || "Unknown error");
        toast.error(result.error || "Failed to save notification preferences");
        setIsLoading(false);
        return;
      }

      trackOnboardingStepCompleted(4);
      trackOnboardingCompleted(undefined, "Onboarding", businessId);
      toast.success("🎉 Onboarding complete! Redirecting...");
      
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Redirect to dashboard after confetti animation
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      trackOnboardingStepError(4, error instanceof Error ? error.message : "Unexpected error");
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
        <p className="text-gray-600">
          Choose how you&apos;d like to receive alerts about new reviews
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Alerts */}
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <FormField
                control={form.control}
                name="emailAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="font-semibold text-base">
                        Email Alerts
                      </FormLabel>
                      <FormDescription>
                        Receive emails when new reviews are posted
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SMS Alerts */}
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <FormField
                control={form.control}
                name="smsAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 flex-1">
                      <FormLabel className="font-semibold text-base">
                        SMS Alerts
                      </FormLabel>
                      <FormDescription>
                        Get instant text messages for new reviews (standard SMS rates apply)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {smsAlerts && (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="mt-4 ml-8">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(555) 123-4567"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Where should we send your SMS alerts?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> You can customize these settings anytime in your notification preferences.
            </p>
          </div>

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
              Complete Setup
            </Button>
          </div>
        </form>
      </Form>

      {/* Progress indicator */}
      <div className="mt-8 flex justify-center gap-2">
        <div className="h-2 w-8 bg-blue-600 rounded-full" />
        <div className="h-2 w-8 bg-blue-600 rounded-full" />
        <div className="h-2 w-8 bg-blue-600 rounded-full" />
        <div className="h-2 w-8 bg-blue-600 rounded-full" />
      </div>
    </div>
  );
}
