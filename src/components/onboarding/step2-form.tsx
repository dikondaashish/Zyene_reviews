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

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="var(--brand-google)" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="var(--google-logo-green)" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="var(--google-logo-yellow)" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="var(--google-logo-red)" />
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl" />
        <div className="relative bg-background/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 sm:p-8 space-y-5">

          {googleState.status === "idle" && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center mx-auto">
                <GoogleIcon />
              </div>
              <Button
                type="button"
                onClick={handleConnectClick}
                className="w-full h-14 text-base rounded-2xl border border-border bg-card text-foreground transition-colors font-semibold cursor-pointer group hover:bg-muted/50"
              >
                <GoogleIcon />
                <span className="ml-2.5">Connect Google Business</span>
                <ArrowRight className="ml-auto h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <p className="text-xs text-muted-foreground/70 font-medium">
                Auto-fills name, address, and reviews in one click
              </p>
              <p className="text-[11px] text-muted-foreground/50 flex items-center justify-center gap-1.5 mt-1">
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                We only read your profile. We never post on your behalf.
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
              {availableLocations.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-2 mb-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                       <MapPin className="h-7 w-7 text-primary" />
                    </div>
                    <p className="font-bold text-lg text-foreground">Select your business</p>
                    <p className="text-xs text-muted-foreground max-w-[280px]">
                      We found {availableLocations.length} locations under your account. Select the one you want to connect.
                    </p>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                    {availableLocations.map((loc, idx) => (
                      <button
                        key={loc.name || idx}
                        type="button"
                        onClick={() => handleSelection(loc)}
                        disabled={advancing}
                        className="w-full text-left p-4 rounded-2xl border border-border bg-background/50 hover:border-primary/50 hover:bg-primary/[0.02] transition-all group relative"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-1 space-y-1">
                            <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                              {loc.businessName}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {loc.fullAddress}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            {advancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-chart-2/10 flex items-center justify-center ring-4 ring-chart-2/25">
                      <CheckCircle2 className="h-8 w-8 text-chart-2" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-bold text-lg text-chart-2">Profile Connected</p>
                      <p className="text-sm text-chart-2/80">
                        {googleState.reviewCount != null && googleState.reviewCount > 0
                          ? `Found ${googleState.reviewCount} review${googleState.reviewCount !== 1 ? "s" : ""}`
                          : "Business profile linked"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={onSaveAndNext}
                    className="w-full h-13 bg-chart-2 hover:bg-chart-2/90 rounded-2xl font-semibold text-base cursor-pointer group"
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
                </>
              )}
            </motion.div>
          )}

          {googleState.status === "error" && (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10/80 text-destructive rounded-xl text-sm border border-destructive/20 font-medium">
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
        <div className="relative bg-background/70 backdrop-blur-sm px-4">
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
              className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">Address</Label>
            <Input
              {...form.register("address")}
              placeholder="123 Main St"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all"
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
              className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">State</Label>
            <Select
              value={form.watch("state")}
              onValueChange={(v) => form.setValue("state", v)}
              disabled={isLoading || googleState.status === "success"}
            >
              <SelectTrigger className="h-12 bg-background/60 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all">
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
              className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all"
            />
          </div>
        </div>

        {googleState.status !== "success" && (
          <Button
            type="button"
            onClick={form.handleSubmit(onSaveAndNext)}
            disabled={advancing || isLoading || !form.formState.isValid}
            className="w-full h-14 mt-2 font-semibold cta-button"
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
