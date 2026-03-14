"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, RefreshCw, ChevronRight } from "lucide-react";
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
import { stepBusinessLocationSchema, type StepBusinessLocationFormData } from "@/lib/validations/onboarding";
import { updateOnboardingStep, initializeGoogleAuth, updateBusinessAndLocation } from "@/app/actions/onboarding";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

interface Step2Props {
  onNext: () => Promise<void>;
  onSkip: () => Promise<void>;
  isLoading: boolean;
  businessId: string;
  businessName: string;
  city: string;
  address?: string;
  state?: string;
  phone?: string;
}

interface GoogleConnectionState {
  status: "idle" | "connecting" | "success" | "error";
  reviewCount?: number;
  averageRating?: number;
  errorMessage?: string;
}

export function Step2Form({
  onNext,
  onSkip,
  isLoading,
  businessId,
  businessName,
  city,
  address = "",
  state: stateProp = "",
  phone = "",
}: Step2Props) {
  const [mounted, setMounted] = useState(false);
  const [googleState, setGoogleState] = useState<GoogleConnectionState>({ status: "idle" });
  const [advancing, setAdvancing] = useState(false);

  const form = useForm<StepBusinessLocationFormData>({
    resolver: zodResolver(stepBusinessLocationSchema),
    defaultValues: {
      businessName: businessName || "",
      locationName: businessName || "",
      address: address || "",
      city: city || "",
      state: stateProp || "CA",
      phone: phone || "",
    },
  });

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && googleState.status === "idle") {
      handleGoogleCallback(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    form.reset({
      businessName: businessName || "",
      locationName: businessName || "",
      address: address || "",
      city: city || "",
      state: stateProp || "CA",
      phone: phone || "",
    });
  }, [businessName, city, address, stateProp, phone, form]);

  // Keep locationName in sync with businessName for validation
  const watchedBusinessName = form.watch("businessName");
  useEffect(() => {
    form.setValue("locationName", watchedBusinessName || "");
  }, [watchedBusinessName, form]);

  const handleGoogleCallback = async (authCode: string) => {
    setGoogleState({ status: "connecting" });
    try {
      const result = await initializeGoogleAuth(authCode, businessId);
      if (result.success) {
        setGoogleState({
          status: "success",
          reviewCount: result.reviewData?.reviewCount,
          averageRating: result.reviewData?.averageRating,
        });
        toast.success("Google Business Profile connected!");
        if (result.locationInfo) {
          form.reset({
            businessName: result.locationInfo.businessName || form.getValues("businessName"),
            locationName: result.locationInfo.businessName || form.getValues("locationName"),
            address: result.locationInfo.address || form.getValues("address"),
            city: result.locationInfo.city || form.getValues("city"),
            state: (result.locationInfo.state as any) || form.getValues("state"),
            phone: form.getValues("phone"),
          });
        }
      } else {
        setGoogleState({
          status: "error",
          errorMessage: result.error || "Failed to connect Google Business Profile",
        });
        toast.error(result.error || "Failed to connect");
      }
    } catch {
      setGoogleState({ status: "error", errorMessage: "An unexpected error occurred" });
      toast.error("An unexpected error occurred");
    }
  };

  const handleConnectClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      toast.error(
        "Google sign-in is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID in your project settings (e.g. Vercel Environment Variables) and redeploy."
      );
      return;
    }
    const redirectUri = `${window.location.origin}/onboarding`;
    const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    oauthUrl.searchParams.set("client_id", clientId);
    oauthUrl.searchParams.set("redirect_uri", redirectUri);
    oauthUrl.searchParams.set("response_type", "code");
    oauthUrl.searchParams.set("scope", "https://www.googleapis.com/auth/business.manage");
    oauthUrl.searchParams.set("access_type", "offline");
    oauthUrl.searchParams.set("prompt", "consent");
    window.location.href = oauthUrl.toString();
  };

  const onSaveAndNext = async () => {
    setAdvancing(true);
    try {
      const data = form.getValues();
      const updateResult = await updateBusinessAndLocation(businessId, {
        businessName: data.businessName,
        address: data.address,
        city: data.city,
        state: data.state,
        phone: data.phone || undefined,
      });
      if (!updateResult.success) {
        toast.error(updateResult.error || "Failed to save");
        return;
      }
      const stepResult = await updateOnboardingStep(businessId, 3);
      if (stepResult.success) {
        toast.success("Saved! Moving to next step.");
        await onNext();
      } else {
        toast.error(stepResult.error || "Failed to advance");
      }
    } finally {
      setAdvancing(false);
    }
  };

  const handleSkip = async () => {
    setAdvancing(true);
    try {
      const result = await updateOnboardingStep(businessId, 3);
      if (result.success) await onSkip();
      else toast.error(result.error || "Failed to save progress");
    } finally {
      setAdvancing(false);
    }
  };

  if (!mounted) return null;

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
          animate={{ width: "50%" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900">Business name & first location</h2>
        <p className="text-gray-600 mt-2">
          Enter manually or connect Google to auto-fill from your Google Business Profile.
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <Label>Business name</Label>
          <Input
            {...form.register("businessName")}
            placeholder="Acme Restaurant"
            disabled={isLoading}
          />
          {form.formState.errors.businessName && (
            <p className="text-sm text-red-500">{form.formState.errors.businessName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>First location — Address</Label>
          <Input
            {...form.register("address")}
            placeholder="123 Main St"
            disabled={isLoading}
          />
          {form.formState.errors.address && (
            <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input {...form.register("city")} placeholder="San Francisco" disabled={isLoading} />
            {form.formState.errors.city && (
              <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Select
              value={form.watch("state")}
              onValueChange={(v) => form.setValue("state", v)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Phone (optional)</Label>
          <Input
            {...form.register("phone")}
            placeholder="(555) 555-5555"
            disabled={isLoading}
          />
        </div>

        {/* Google connect */}
        <div className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Connect Google to auto-fill</p>
              <p className="text-sm text-gray-600">We’ll pull your business name and address from Google Business Profile.</p>
            </div>
          </div>
          {googleState.status === "idle" && (
            <Button type="button" variant="outline" onClick={handleConnectClick} className="w-full">
              Connect with Google
            </Button>
          )}
          {googleState.status === "connecting" && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting...
            </div>
          )}
          {googleState.status === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Connected {googleState.reviewCount != null && `— ${googleState.reviewCount} reviews`}
            </div>
          )}
          {googleState.status === "error" && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-red-600">{googleState.errorMessage}</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => setGoogleState({ status: "idle" })}>
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={form.handleSubmit(onSaveAndNext)}
            disabled={advancing || isLoading || !form.formState.isValid}
            className="flex-1 py-6"
          >
            {advancing || isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
            ) : (
              <>Next <ChevronRight className="ml-2 h-5 w-5" /></>
            )}
          </Button>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={handleSkip}
            disabled={advancing}
            className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Skip for now →
          </button>
        </div>
      </form>
    </motion.div>
  );
}
