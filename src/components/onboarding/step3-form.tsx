"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Bell, MessageCircle, Star, ChevronRight } from "lucide-react";
import { step3FormSchema, type Step3FormData } from "@/lib/validations/onboarding";
import { saveNotificationPreferences } from "@/app/actions/onboarding";

interface Step3FormProps {
  businessId: string;
  businessName: string;
  city: string;
  onNext: () => void;
  isLoading?: boolean;
}

export function Step3Form({
  businessId,
  businessName,
  city,
  onNext,
  isLoading: externalIsLoading = false,
}: Step3FormProps) {
  const [isLoading, setIsLoading] = useState(externalIsLoading);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Step3FormData>({
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

  const emailAlerts = watch("emailAlerts");
  const smsAlerts = watch("smsAlerts");
  const emailFrequency = watch("emailFrequency");
  const minRatingThreshold = watch("minRatingThreshold");
  const smsPhoneNumber = watch("smsPhoneNumber");

  const onSubmit = async (data: Step3FormData) => {
    setIsLoading(true);
    try {
      const result = await saveNotificationPreferences(businessId, data);

      if (result.success) {
        toast.success("Notification preferences saved! 🔔");
        setTimeout(() => {
          onNext();
        }, 500);
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blue-600 h-2 rounded-full"
          initial={{ width: "50%" }}
          animate={{ width: "75%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Never miss a review</h1>
        <p className="text-gray-600">
          We'll alert you the moment a new review comes in
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6 space-y-6">
            {/* Row 1: Email Alerts */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1 p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="emailAlerts" className="text-base font-semibold cursor-pointer">
                      Email Alerts
                    </Label>
                    <p className="text-sm text-gray-600">
                      Get notified by email for new reviews
                    </p>
                  </div>
                </div>
                <Switch
                  id="emailAlerts"
                  checked={emailAlerts}
                  onCheckedChange={(checked) => setValue("emailAlerts", checked)}
                  disabled={isLoading || isSubmitting}
                />
              </div>

              {/* Email Frequency Dropdown */}
              <AnimatePresence>
                {emailAlerts && (
                  <motion.div
                    key="email-frequency"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-11 space-y-2"
                  >
                    <Label htmlFor="emailFrequency" className="text-sm font-medium">
                      Frequency
                    </Label>
                    <Select
                      value={emailFrequency}
                      onValueChange={(value) =>
                        setValue(
                          "emailFrequency",
                          value as "immediately" | "daily_digest" | "weekly_summary"
                        )
                      }
                      disabled={isLoading || isSubmitting}
                    >
                      <SelectTrigger id="emailFrequency" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="daily_digest">Daily Digest</SelectItem>
                        <SelectItem value="weekly_summary">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Row 2: SMS Alerts */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1 p-2 bg-green-100 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="smsAlerts" className="text-base font-semibold cursor-pointer">
                      SMS Alerts
                    </Label>
                    <p className="text-sm text-gray-600">
                      Text message for urgent 1–2 star reviews
                    </p>
                  </div>
                </div>
                <Switch
                  id="smsAlerts"
                  checked={smsAlerts}
                  onCheckedChange={(checked) => setValue("smsAlerts", checked)}
                  disabled={isLoading || isSubmitting}
                />
              </div>

              {/* SMS Phone Number Input */}
              <AnimatePresence>
                {smsAlerts && (
                  <motion.div
                    key="sms-phone"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-11 space-y-2"
                  >
                    <Label htmlFor="smsPhoneNumber" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <div className="flex gap-2">
                      <Select defaultValue="+1" disabled={isLoading || isSubmitting}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1">+1 US</SelectItem>
                          <SelectItem value="+44">+44 UK</SelectItem>
                          <SelectItem value="+1">+1 CA</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="smsPhoneNumber"
                        {...register("smsPhoneNumber")}
                        placeholder="(555) 123-4567"
                        disabled={isLoading || isSubmitting}
                        className="flex-1"
                      />
                    </div>
                    {errors.smsPhoneNumber && (
                      <p className="text-sm text-red-600">{errors.smsPhoneNumber.message}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Row 3: Minimum Rating Alert */}
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                Alert me for reviews rated
              </Label>
              <Select
                value={minRatingThreshold}
                onValueChange={(value) => setValue("minRatingThreshold", value as "1" | "2" | "3")}
                disabled={isLoading || isSubmitting}
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

        {/* Button */}
        <Button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {isLoading || isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
