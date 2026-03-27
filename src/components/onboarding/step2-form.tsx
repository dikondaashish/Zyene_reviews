"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, RefreshCw, ArrowRight, Link2, MapPin } from "lucide-react";
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
import { stepBusinessLocationSchema, type StepBusinessLocationFormData } from "@/lib/validation/onboarding";
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
  /** OAuth code passed from page.tsx after Google redirects back */
  pendingGoogleCode?: string | null;
  /** Called after the pending code has been consumed so the parent can clear it */
  onGoogleCodeConsumed?: () => void;
  /** Called when Google returns business info so the parent state stays in sync */
  onBusinessUpdate?: (info: { name?: string; address_line1?: string; city?: string; state?: string }) => void;
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
  pendingGoogleCode,
  onGoogleCodeConsumed,
  onBusinessUpdate,
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
  }, []);

  // Process the OAuth code passed from page.tsx (Google redirected back with ?code=)
  useEffect(() => {
    if (pendingGoogleCode && googleState.status === "idle" && mounted) {
      handleGoogleCallback(pendingGoogleCode);
      onGoogleCodeConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingGoogleCode, mounted]);

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
          const newBusinessName = result.locationInfo.businessName || form.getValues("businessName");
          const newAddress = result.locationInfo.address || form.getValues("address");
          const newCity = result.locationInfo.city || form.getValues("city");
          const newState = (result.locationInfo.state as any) || form.getValues("state");
          const newPhone = (result.locationInfo as any).phone || form.getValues("phone");
          form.reset({
            businessName: newBusinessName,
            locationName: newBusinessName,
            address: newAddress,
            city: newCity,
            state: newState,
            phone: newPhone,
          });
          // Propagate updated info to parent so it stays in sync
          onBusinessUpdate?.({
            name: newBusinessName,
            address_line1: newAddress,
            city: newCity,
            state: newState,
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

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="inline-flex"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 mx-auto">
            <Link2 className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Connect your business
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-sm sm:text-base">
          Link Google to auto-fill your details, or enter them manually below.
        </p>
      </div>

      {/* Google connect card */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Subtle gradient border */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10 rounded-2xl" />
        <div className="relative bg-white/60 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6 sm:p-8 space-y-5">

          {googleState.status === "idle" && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mx-auto">
                <GoogleIcon />
              </div>
              <Button
                type="button"
                onClick={handleConnectClick}
                className="w-full h-14 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200/40 rounded-2xl transition-all font-semibold cursor-pointer group"
              >
                <GoogleIcon />
                <span className="ml-2.5">Connect Google Business</span>
                <ArrowRight className="ml-auto h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <p className="text-xs text-muted-foreground/70 font-medium">
                Auto-fills name, address, and reviews in one click
              </p>
            </div>
          )}

          {googleState.status === "connecting" && (
            <div className="flex flex-col items-center justify-center gap-4 py-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
                <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-sm font-semibold text-foreground animate-pulse">Fetching your business details...</p>
            </div>
          )}

          {googleState.status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center ring-4 ring-emerald-100/60">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-lg text-emerald-700">Profile Connected</p>
                  <p className="text-sm text-emerald-600/80">
                    {googleState.reviewCount != null
                      ? `Found ${googleState.reviewCount} review${googleState.reviewCount !== 1 ? "s" : ""}`
                      : "Business profile linked"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={onSaveAndNext}
                className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-semibold shadow-lg shadow-emerald-200/40 text-base cursor-pointer group"
                disabled={advancing}
              >
                {advancing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
                ) : (
                  <>
                    Continue with {form.getValues("businessName") || "Profile"}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {googleState.status === "error" && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50/80 text-red-700 rounded-xl text-sm border border-red-100 font-medium">
                {googleState.errorMessage}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setGoogleState({ status: "idle" })}
                className="w-full h-12 rounded-xl font-semibold border-2 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Try again
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative bg-white/70 backdrop-blur-sm px-4">
          <span className="text-xs uppercase tracking-[0.15em] font-bold text-muted-foreground/60">
            or enter manually
          </span>
        </div>
      </div>

      {/* Manual fields */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">Business name</Label>
            <Input
              {...form.register("businessName")}
              placeholder="e.g. Acme Restaurant"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 bg-white/60 border-violet-200/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">Address</Label>
            <Input
              {...form.register("address")}
              placeholder="123 Main St"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 bg-white/60 border-violet-200/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">City</Label>
            <Input
              {...form.register("city")}
              placeholder="San Francisco"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 bg-white/60 border-violet-200/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">State</Label>
            <Select
              value={form.watch("state")}
              onValueChange={(v) => form.setValue("state", v)}
              disabled={isLoading || googleState.status === "success"}
            >
              <SelectTrigger className="h-12 bg-white/60 border-violet-200/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">Phone</Label>
            <Input
              {...form.register("phone")}
              placeholder="(555) 555-5555"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 bg-white/60 border-violet-200/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all"
            />
          </div>
        </div>

        {googleState.status !== "success" && (
          <Button
            type="button"
            onClick={form.handleSubmit(onSaveAndNext)}
            disabled={advancing || isLoading || !form.formState.isValid}
            className="w-full h-14 mt-2 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all cursor-pointer group"
          >
            {advancing || isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
            ) : (
              <>
                Confirm details
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        )}

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleSkip}
            disabled={advancing}
            className="text-xs font-semibold text-muted-foreground/60 hover:text-primary transition-colors tracking-wide cursor-pointer hover:underline underline-offset-4"
          >
            I&apos;ll connect later
          </button>
        </div>
      </div>
    </div>
  );
}
