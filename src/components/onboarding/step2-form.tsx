"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, RefreshCw, ArrowRight, MapPin } from "lucide-react";
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
import { updateOnboardingStep, initializeGoogleAuth, updateBusinessAndLocation, finalizeGoogleConnection } from "@/app/actions/onboarding";
import type {
  OnboardingGoogleInitResult,
  OnboardingGoogleLocationInfo,
} from "@/types/components";

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
  onBusinessUpdate?: (info: { name?: string; address_line1?: string; city?: string; state?: string; category?: string | null }) => void;
  /** Initial connection status if already connected */
  initialConnected?: boolean;
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
  initialConnected = false,
}: Step2Props) {
  const [mounted, setMounted] = useState(false);
  const [googleState, setGoogleState] = useState<GoogleConnectionState>({ status: "idle" });
  const [advancing, setAdvancing] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<OnboardingGoogleLocationInfo[]>([]);
  const [pendingTokens, setPendingTokens] = useState<any>(null);

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
    if (!mounted || googleState.status !== "idle") return;

    // Already linked in DB: do not exchange a stale ?code= (bookmark/refresh) — avoids invalid_grant
    if (initialConnected) {
      setGoogleState({ status: "success" });
      if (pendingGoogleCode) {
        onGoogleCodeConsumed?.();
      }
      return;
    }

    if (pendingGoogleCode) {
      handleGoogleCallback(pendingGoogleCode);
      onGoogleCodeConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingGoogleCode, initialConnected, mounted]);

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
      const redirectUri =
        typeof window !== "undefined" ? `${window.location.origin}/onboarding` : undefined;
      const result = (await initializeGoogleAuth(
        authCode,
        businessId,
        redirectUri
      )) as OnboardingGoogleInitResult;
      
      if (result.success) {
        if (result.multipleLocations && result.locations) {
          setAvailableLocations(result.locations);
          setPendingTokens(result.tokens);
          setGoogleState({ status: "success" });
          toast.info("Multiple businesses found. Please select one.");
        } else if (result.locationInfo) {
          setGoogleState({
            status: "success",
            reviewCount: result.reviewData?.reviewCount,
            averageRating: result.reviewData?.averageRating,
          });
          toast.success("Google Business Profile connected!");
          updateFormAndParent(result.locationInfo, result.reviewData);
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

  const handleSelection = async (location: OnboardingGoogleLocationInfo) => {
    setAdvancing(true);
    try {
      const result = await finalizeGoogleConnection(businessId, location, pendingTokens);
      
      if (result.success && result.locationInfo) {
        setGoogleState({
          status: "success",
          reviewCount: result.reviewData?.reviewCount,
          averageRating: result.reviewData?.averageRating,
        });
        setAvailableLocations([]);
        setPendingTokens(null);
        toast.success("Business profile selected and connected!");
        updateFormAndParent(result.locationInfo, result.reviewData);
      } else {
        toast.error(result.error || "Failed to finalize connection");
      }
    } catch (err) {
      console.error("Selection error:", err);
      toast.error("Failed to select business");
    } finally {
      setAdvancing(false);
    }
  };

  const updateFormAndParent = (info: OnboardingGoogleLocationInfo, reviews?: any) => {
    const newBusinessName = info.businessName || form.getValues("businessName");
    const newAddress = info.address || form.getValues("address");
    const newCity = info.city || form.getValues("city");
    const newState = info.state || form.getValues("state");
    const newPhone = info.phone || form.getValues("phone");

    form.reset({
      businessName: newBusinessName,
      locationName: newBusinessName,
      address: newAddress,
      city: newCity,
      state: newState,
      phone: newPhone,
    });

    // Propagate updated info to parent
    onBusinessUpdate?.({
      name: newBusinessName,
      address_line1: newAddress,
      city: newCity,
      state: newState,
      category: info.category || null,
    });
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

  /* ─── Icon Components ─── */
  const ChainIcon = () => (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="chain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d="M26 38L38 26M22 26L14 34C11.7909 36.2091 11.7909 39.7909 14 42L22 50C24.2091 52.2091 27.7909 52.2091 30 50L34 46M30 18L34 14C36.2091 11.7909 39.7909 11.7909 42 14L50 22C52.2091 24.2091 52.2091 27.7909 50 30L42 38C39.7909 40.2091 36.2091 40.2091 34 38"
        stroke="url(#chain-grad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  /* ─── Success / Multi-location / Error overlays ─── */
  if (googleState.status === "connecting") {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-20">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/15 blur-2xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-sm font-semibold text-foreground animate-pulse">Connecting to Google…</p>
      </div>
    );
  }

  if (googleState.status === "success" && availableLocations.length > 0) {
    return (
      <div className="max-w-md mx-auto space-y-5 py-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 mx-auto">
            <MapPin className="h-7 w-7 text-primary" />
          </div>
          <p className="font-bold text-xl text-foreground">Select your business</p>
          <p className="text-xs text-muted-foreground">We found {availableLocations.length} locations. Pick one.</p>
        </div>
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {availableLocations.map((loc, idx) => (
            <button
              key={loc.name || idx}
              type="button"
              onClick={() => handleSelection(loc)}
              disabled={advancing}
              className="w-full text-left p-4 rounded-2xl border border-border bg-background/60 hover:border-primary/40 hover:bg-primary/[0.03] transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-sm text-foreground">{loc.businessName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{loc.fullAddress}</p>
              </div>
              {advancing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (googleState.status === "success" && availableLocations.length === 0) {
    return (
      <div className="max-w-sm mx-auto text-center space-y-6 py-10">
        <div className="w-16 h-16 rounded-2xl bg-chart-2/10 flex items-center justify-center mx-auto ring-1 ring-chart-2/20">
          <CheckCircle2 className="w-8 h-8 text-chart-2" />
        </div>
        <div>
          <p className="font-bold text-chart-2 text-xl">Connected!</p>
          <p className="text-sm text-muted-foreground mt-1">{form.getValues("businessName")}</p>
        </div>
        <Button
          type="button"
          onClick={onSaveAndNext}
          className="w-full h-12 bg-chart-2 hover:bg-chart-2/90 rounded-2xl font-semibold text-sm cursor-pointer"
          disabled={advancing}
        >
          {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue Setup →"}
        </Button>
      </div>
    );
  }

  if (googleState.status === "error") {
    return (
      <div className="max-w-sm mx-auto space-y-4 py-10">
        <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-sm border border-destructive/20 font-medium">
          {googleState.errorMessage}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setGoogleState({ status: "idle" })}
          className="w-full h-12 rounded-2xl font-semibold border-2 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Try again
        </Button>
      </div>
    );
  }

  /* ─── Main Two-Column Layout (idle state) ─── */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-border bg-card/80 backdrop-blur-xl">

      {/* ─── LEFT PANEL: Google Connect ─── */}
      <div className="relative p-8 sm:p-10 lg:p-12 flex flex-col justify-center overflow-hidden bg-primary/[0.03]">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Icon — matches Step 1 style */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            className="inline-flex"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
              <ChainIcon />
            </div>
          </motion.div>

          {/* Title & Subtitle — matches Step 1 typography */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Connect your business
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed max-w-xs">
              Link Google to auto-fill your details, or enter them manually below.
            </p>
          </div>

          {/* Google Connect Button — matches card style */}
          <Button
            type="button"
            onClick={handleConnectClick}
            className="w-full max-w-[340px] h-12 rounded-2xl border border-border bg-card text-foreground hover:bg-muted/50 transition-colors font-semibold cursor-pointer group text-sm"
          >
            <GoogleIcon />
            <span className="ml-2.5">Connect Google Business</span>
            <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Button>

          {/* Benefits — uses primary color for checkmarks */}
          <div className="space-y-2.5">
            {[
              "Auto-import all your reviews",
              "AI-powered response suggestions",
              "Real-time sync — new reviews appear instantly",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Manual Entry ─── */}
      <div className="relative p-8 sm:p-10 lg:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border">
        
        {/* Divider label */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground/60 shrink-0">
              or enter manually
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Business name — just the name, no redundant suffix */}
          <p className="text-sm font-semibold text-foreground">
            {form.watch("businessName") || businessName || "Your Business"}
          </p>
        </div>

        {/* Form Fields — matching Step 1 input styles */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">
              Business Name
            </Label>
            <Input
              {...form.register("businessName")}
              placeholder="e.g., Acme Corp"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">
              Address
            </Label>
            <Input
              {...form.register("address")}
              placeholder="e.g., 123 Main St, City"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">
                City
              </Label>
              <Input
                {...form.register("city")}
                placeholder="City"
                disabled={isLoading || googleState.status === "success"}
                className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">
                State
              </Label>
              <Select
                value={form.watch("state")}
                onValueChange={(v) => form.setValue("state", v)}
                disabled={isLoading || googleState.status === "success"}
              >
                <SelectTrigger className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all">
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

          {/* Continue — uses cta-button class like Step 1 */}
          <Button
            type="button"
            onClick={form.handleSubmit(onSaveAndNext)}
            disabled={advancing || isLoading || !form.formState.isValid}
            className="w-full h-12 mt-2 text-sm font-semibold cta-button"
          >
            {advancing || isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {/* Privacy & Skip — matching established patterns */}
          <div className="space-y-3 pt-3">
            <p className="text-[11px] text-muted-foreground/50 flex items-center justify-center gap-1.5 font-medium">
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              We only read your profile. We never post on your behalf.
            </p>

            <div className="text-center">
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
      </div>
    </div>
  );
}
