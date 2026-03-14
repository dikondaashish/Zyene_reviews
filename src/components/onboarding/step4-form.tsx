"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Bell, MessageCircle, Star, ChevronRight } from "lucide-react";
import { step3FormSchema, type Step3FormData } from "@/lib/validations/onboarding";
import { saveNotificationPreferences } from "@/app/actions/onboarding";
import { OnboardingCompletionScreen } from "./completion-screen";

interface Step4FormProps {
  businessId: string;
  businessName: string;
  userEmail: string;
  userName: string;
  googleConnected: boolean;
  onNext: () => void;
  isLoading?: boolean;
}

export function Step4Form({
  businessId,
  businessName,
  userEmail,
  userName,
  googleConnected,
  onNext,
  isLoading: externalIsLoading = false,
}: Step4FormProps) {
  const [isLoading, setIsLoading] = useState(externalIsLoading);
  const [showCompletion, setShowCompletion] = useState(false);

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3FormSchema),
    defaultValues: {
      emailAlerts: true,
      emailFrequency: "daily_digest",
      smsAlerts: false,
      smsPhoneNumber: "",
      minRatingThreshold: "1",
    },
    mode: "onChange",
  });

  const emailAlerts = form.watch("emailAlerts");
  const smsAlerts = form.watch("smsAlerts");
  const emailFrequency = form.watch("emailFrequency");
  const minRatingThreshold = form.watch("minRatingThreshold");

  const fireConfetti = async () => {
    try {
      const confettiModule = await import("canvas-confetti");
      const confetti = confettiModule.default;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {
      console.debug("canvas-confetti not available");
    }
  };

  const onSubmit = async (data: Step3FormData) => {
    setIsLoading(true);
    try {
      const result = await saveNotificationPreferences(businessId, data);
      if (result.success) {
        toast.success("Notification preferences saved! 🔔");
        await fireConfetti();
        setShowCompletion(true);
      } else {
        toast.error(result.error || "Failed to save preferences");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showCompletion) {
    return (
      <OnboardingCompletionScreen
        firstName={userName}
        email={userEmail}
        googleConnected={googleConnected}
        requestSent={false}
        onComplete={onNext}
      />
    );
  }

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
          animate={{ width: "100%" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
        <p className="text-gray-600 mt-2">
          We’ll alert you when new reviews come in. Then you’re all set — confetti and dashboard.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1 p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="emailAlerts" className="text-base font-semibold cursor-pointer">
                      Email alerts
                    </Label>
                    <p className="text-sm text-gray-600">Get notified by email for new reviews</p>
                  </div>
                </div>
                <Switch
                  id="emailAlerts"
                  checked={emailAlerts}
                  onCheckedChange={(c) => form.setValue("emailAlerts", c)}
                  disabled={isLoading}
                />
              </div>
              <AnimatePresence>
                {emailAlerts && (
                  <motion.div
                    key="email-frequency"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-11 space-y-2"
                  >
                    <Label>Frequency</Label>
                    <Select
                      value={emailFrequency}
                      onValueChange={(v) => form.setValue("emailFrequency", v as Step3FormData["emailFrequency"])}
                      disabled={isLoading}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="daily_digest">Daily digest</SelectItem>
                        <SelectItem value="weekly_summary">Weekly summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1 p-2 bg-green-100 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="smsAlerts" className="text-base font-semibold cursor-pointer">
                      SMS alerts
                    </Label>
                    <p className="text-sm text-gray-600">Text for urgent 1–2 star reviews</p>
                  </div>
                </div>
                <Switch
                  id="smsAlerts"
                  checked={smsAlerts}
                  onCheckedChange={(c) => form.setValue("smsAlerts", c)}
                  disabled={isLoading}
                />
              </div>
              <AnimatePresence>
                {smsAlerts && (
                  <motion.div
                    key="sms-phone"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-11 space-y-2"
                  >
                    <Label>Phone number</Label>
                    <Input
                      {...form.register("smsPhoneNumber")}
                      placeholder="(555) 123-4567"
                      disabled={isLoading}
                    />
                    {form.formState.errors.smsPhoneNumber && (
                      <p className="text-sm text-red-500">{form.formState.errors.smsPhoneNumber.message}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                Alert me for reviews rated
              </Label>
              <Select
                value={minRatingThreshold}
                onValueChange={(v) => form.setValue("minRatingThreshold", v as Step3FormData["minRatingThreshold"])}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Any rating</SelectItem>
                  <SelectItem value="2">2 stars or below</SelectItem>
                  <SelectItem value="3">3 stars or below</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isLoading || !form.formState.isValid}
          className="w-full py-6"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
          ) : (
            <>Save & finish <ChevronRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
