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

  const ChainIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto">
      <defs>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#f9d71c" />
          <stop offset="100%" stopColor="#aa823a" />
        </linearGradient>
      </defs>
      <path
        d="M26 38L38 26M22 26L14 34C11.7909 36.2091 11.7909 39.7909 14 42L22 50C24.2091 52.2091 27.7909 52.2091 30 50L34 46M30 18L34 14C36.2091 11.7909 39.7909 11.7909 42 14L50 22C52.2091 24.2091 52.2091 27.7909 50 30L42 38C39.7909 40.2091 36.2091 40.2091 34 38"
        stroke="url(#gold-grad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );

  const GoogleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <ChainIcon />
        </motion.div>
        
        <div>
          <h2 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Connect your business
          </h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto leading-relaxed">
            Link Google to auto-fill your details, or enter them manually below.
          </p>
        </div>
      </div>

      {/* Google Connect Section */}
      <div className="space-y-6 pt-2">
        {googleState.status === "idle" && (
          <div className="space-y-6 max-w-sm mx-auto">
            <Button
              type="button"
              onClick={handleConnectClick}
              className="w-full h-14 rounded-full border border-border/40 bg-white/60 dark:bg-white/5 backdrop-blur-md text-foreground shadow-sm transition-all font-medium cursor-pointer group hover:bg-white/80 dark:hover:bg-white/10 flex items-center justify-between px-6"
            >
              <GoogleIcon />
              <span className="text-sm lg:text-base">Connect Google Business</span>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Button>

            <div className="space-y-3 px-2">
              {[
                "Auto-import all your reviews",
                "AI-powered response suggestions",
                "Real-time sync — new reviews appear instantly",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-[13px] text-muted-foreground/90">
                  <CheckCircle2 className="w-4 h-4 text-[#aa823a] shrink-0" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {googleState.status === "connecting" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-semibold text-foreground animate-pulse">Connecting to Google...</p>
          </div>
        )}

        {googleState.status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            {availableLocations.length > 0 ? (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="text-center space-y-1 mb-4">
                  <p className="font-bold text-lg">Select your business</p>
                  <p className="text-xs text-muted-foreground">Multiple locations found. Please select one.</p>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {availableLocations.map((loc, idx) => (
                    <button
                      key={loc.name || idx}
                      onClick={() => handleSelection(loc)}
                      className="w-full text-left p-4 rounded-xl border border-border/60 bg-white/40 hover:border-primary/50 hover:bg-primary/[0.02] transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-bold text-sm">{loc.businessName}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{loc.fullAddress}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-5 bg-chart-2/5 p-6 rounded-2xl border border-chart-2/20 max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center mx-auto text-chart-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-chart-2 text-lg uppercase tracking-wider">Connected</p>
                  <p className="text-sm text-chart-2/80 mt-1">Profile: {form.getValues("businessName")}</p>
                </div>
                <Button
                  type="button"
                  onClick={onSaveAndNext}
                  className="w-full h-12 bg-chart-2 hover:bg-chart-2/90 rounded-full font-semibold text-sm cursor-pointer group"
                  disabled={advancing}
                >
                  {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue Setup"}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center py-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border/40" />
        </div>
        <div className="relative bg-background/80 px-4">
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground/50">
            or enter manually
          </span>
        </div>
      </div>

      {/* Manual Form Section */}
      <div className="space-y-5 max-w-sm mx-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest ml-1">
              Business Name
            </Label>
            <Input
              {...form.register("businessName")}
              placeholder="e.g., Acme Corp"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 bg-white/40 border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest ml-1">
              Address
            </Label>
            <Input
              {...form.register("address")}
              placeholder="e.g., 123 Main St, City"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 bg-white/40 border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all"
            />
          </div>
        </div>

        {/* City/State/Phone in a compact row for data completeness while matching UI minimal look */}
        {(form.watch("city") || form.watch("state") || googleState.status !== "success") && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-1.5 opacity-60">
               <Label className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest ml-1">City</Label>
               <Input {...form.register("city")} placeholder="City" className="h-10 text-xs rounded-xl" disabled={isLoading || googleState.status === "success"} />
            </div>
            <div className="space-y-1.5 opacity-60">
               <Label className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest ml-1">State</Label>
               <Select
                value={form.watch("state")}
                onValueChange={(v) => form.setValue("state", v)}
                disabled={isLoading || googleState.status === "success"}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl"><SelectValue placeholder="State" /></SelectTrigger>
                <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        )}

        {googleState.status !== "success" && (
          <Button
            type="button"
            onClick={form.handleSubmit(onSaveAndNext)}
            disabled={advancing || isLoading || !form.formState.isValid}
            className="w-full h-12 mt-2 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl cursor-pointer text-sm"
          >
            {advancing || isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        )}

        {/* Footer Privacy Note */}
        <div className="pt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60 font-medium">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p>We only read your profile. We never post on your behalf.</p>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleSkip}
            disabled={advancing}
            className="text-[11px] font-bold text-muted-foreground/40 hover:text-primary transition-colors tracking-widest uppercase cursor-pointer"
          >
            I&apos;ll connect later
          </button>
        </div>
      </div>
    </div>
  );
}
