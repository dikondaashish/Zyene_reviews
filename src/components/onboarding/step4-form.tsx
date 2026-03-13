"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Mail, MessageSquare, ChevronRight } from "lucide-react";
import { step4FormSchema, type Step4FormData } from "@/lib/validations/onboarding";
import { sendFirstReviewRequest, completeOnboarding } from "@/app/actions/onboarding";
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4FormSchema),
    defaultValues: {
      recipientName: userName,
      recipientEmail: userEmail,
      recipientPhone: "",
      channel: "email",
    },
    mode: "onChange",
  });

  const channel = watch("channel");
  const recipientName = watch("recipientName");

  // Show completion screen if showCompletion is true
  if (showCompletion) {
    return (
      <OnboardingCompletionScreen
        firstName={userName}
        email={userEmail}
        googleConnected={googleConnected}
        requestSent={requestSent}
        onComplete={onNext}
      />
    );
  }

  // Fire confetti on success
  const fireConfetti = async () => {
    try {
      // @ts-ignore - canvas-confetti is optional
      const module = await import("canvas-confetti");
      const confetti = module.default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (error) {
      // Confetti library not available or not installed - silently skip
      console.debug("canvas-confetti not available, skipping animation");
    }
  };

  const onSubmit = async (data: Step4FormData) => {
    setIsLoading(true);
    try {
      const result = await sendFirstReviewRequest(businessId, data);

      if (result.success) {
        await fireConfetti();
        setShowSuccess(true);
        setRequestSent(true);
        toast.success("Request sent! Check your inbox to see what your customers experience. 🎉");

        // Show completion screen after success state
        setTimeout(() => {
          setShowCompletion(true);
        }, 1500);
      } else {
        toast.error(result.error || "Failed to send review request");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const result = await completeOnboarding(businessId);

      if (result.success) {
        // Show completion screen instead of immediately redirecting
        setShowCompletion(true);
      } else {
        toast.error(result.error || "Failed to skip");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Request sent!</h2>
        <p className="text-gray-600">
          Check your inbox to see exactly what your customers will experience
        </p>
      </motion.div>
    );
  }

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
          initial={{ width: "75%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Get your first review in minutes
        </h1>
        <p className="text-gray-600">
          Send a test request to see exactly what your customers experience
        </p>
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        {[
          "Test that your setup is working",
          "See exactly what your customers receive",
          "Start building your review pipeline",
        ].map((benefit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <span className="text-gray-700">{benefit}</span>
          </motion.div>
        ))}
      </div>

      {/* Form & Preview */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-gray-200">
          <CardContent className="pt-6 space-y-4">
            {/* Recipient Name */}
            <div className="space-y-2">
              <Label htmlFor="recipientName" className="text-sm font-medium">
                Recipient Name
              </Label>
              <Input
                id="recipientName"
                {...register("recipientName")}
                placeholder="Test User"
                disabled={isLoading || isSubmitting}
              />
              {errors.recipientName && (
                <p className="text-sm text-red-600">{errors.recipientName.message}</p>
              )}
            </div>

            {/* Recipient Email */}
            <div className="space-y-2">
              <Label htmlFor="recipientEmail" className="text-sm font-medium">
                Recipient Email
              </Label>
              <Input
                id="recipientEmail"
                {...register("recipientEmail")}
                type="email"
                placeholder="test@example.com"
                disabled={isLoading || isSubmitting}
              />
              {errors.recipientEmail && (
                <p className="text-sm text-red-600">{errors.recipientEmail.message}</p>
              )}
            </div>

            {/* Channel Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Delivery Channel</Label>
              <div className="flex gap-3">
                {[
                  { value: "email" as const, label: "Email", icon: Mail },
                  { value: "sms" as const, label: "SMS", icon: MessageSquare },
                  { value: "both" as const, label: "Both", icon: Mail },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("channel", value)}
                    disabled={isLoading || isSubmitting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                      channel === value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Phone (if SMS selected) */}
            {(channel === "sms" || channel === "both") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="recipientPhone" className="text-sm font-medium">
                  Recipient Phone
                </Label>
                <Input
                  id="recipientPhone"
                  {...register("recipientPhone")}
                  placeholder="(555) 123-4567"
                  disabled={isLoading || isSubmitting}
                />
                {errors.recipientPhone && (
                  <p className="text-sm text-red-600">{errors.recipientPhone.message}</p>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-medium text-gray-700">Preview</p>

            {channel === "email" || channel === "both" ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                <p className="text-xs text-gray-500">Subject:</p>
                <p className="text-sm font-medium">
                  How was your experience at {businessName}?
                </p>
                <div className="h-px bg-gray-200" />
                <p className="text-sm text-gray-600">Hi {recipientName},</p>
                <p className="text-sm text-gray-600">
                  We'd love to hear about your recent experience at {businessName}...
                </p>
              </div>
            ) : null}

            {channel === "sms" || channel === "both" ? (
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                  <p className="text-sm">
                    Hi {recipientName}, we'd love your feedback on {businessName}. Click to review:
                    {" "}
                    <span className="font-medium">[review link]</span>
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="flex-1 bg-black hover:bg-gray-800 text-white"
            size="lg"
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Request
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Link */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={isLoading || isSubmitting}
          className="w-full text-center text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          Skip and go to dashboard
        </button>
      </form>
    </motion.div>
  );
}
