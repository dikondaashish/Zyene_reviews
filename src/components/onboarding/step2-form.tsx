"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, RefreshCw, ChevronRight, AlertTriangle } from "lucide-react";
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
      {/* Removed local progress bar - now in shell */}

      <div className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Connect Google in 30 seconds
        </h2>
        <p className="text-gray-600 max-w-sm mx-auto">
          We'll automatically pull your business name, address, and reviews to set everything up for you.
        </p>
      </div>

      {/* Google connect - PRIMARY CTA */}
      <div className="bg-blue-50/50 border-2 border-blue-100 rounded-3xl p-8 space-y-6 text-center shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>

        {googleState.status === "idle" && (
          <Button 
            type="button" 
            onClick={handleConnectClick} 
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Connect Google Business Profile
          </Button>
        )}
        {googleState.status === "connecting" && (
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-blue-800">Connecting your profile...</p>
          </div>
        )}
        {googleState.status === "success" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 text-green-600">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <p className="font-bold text-lg text-green-700">Success!</p>
              <p className="text-sm">
                Found {googleState.reviewCount != null ? `your profile with ${googleState.reviewCount} reviews` : "your business profile"}
              </p>
            </div>
            <Button 
              type="button" 
              onClick={onSaveAndNext} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={advancing}
            >
              Confirm and Continue
            </Button>
          </div>
        )}
        {googleState.status === "error" && (
          <div className="space-y-3">
             <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100">
               {googleState.errorMessage}
             </div>
             <Button type="button" variant="outline" onClick={() => setGoogleState({ status: "idle" })} className="w-full rounded-xl">
               <RefreshCw className="h-4 w-4 mr-2" /> Try again
             </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
          <span className="bg-white px-4 text-gray-400">Or enter manually</span>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">Business name</Label>
            <Input
              {...form.register("businessName")}
              placeholder="Acme Restaurant"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 border-gray-200 focus:border-blue-300 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">Address</Label>
            <Input
              {...form.register("address")}
              placeholder="123 Main St"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 border-gray-200 focus:border-blue-300 rounded-xl"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">City</Label>
            <Input 
               {...form.register("city")} 
               placeholder="San Francisco" 
               disabled={isLoading || googleState.status === "success"} 
               className="h-12 border-gray-200 focus:border-blue-300 rounded-xl"
            />
          </div>
          <div className="col-span-1 space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">State</Label>
            <Select
              value={form.watch("state")}
              onValueChange={(v) => form.setValue("state", v)}
              disabled={isLoading || googleState.status === "success"}
            >
              <SelectTrigger className="h-12 border-gray-200 focus:border-blue-300 rounded-xl">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1 space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">Phone</Label>
            <Input
              {...form.register("phone")}
              placeholder="(555) 555-5555"
              disabled={isLoading || googleState.status === "success"}
              className="h-12 border-gray-200 focus:border-blue-300 rounded-xl"
            />
          </div>
        </div>

        {googleState.status !== "success" && (
          <Button
            type="button"
            onClick={form.handleSubmit(onSaveAndNext)}
            disabled={advancing || isLoading || !form.formState.isValid}
            className="w-full py-6 mt-4 rounded-xl text-base font-semibold"
          >
            {advancing || isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
            ) : (
              <>Save and continue <ChevronRight className="ml-2 h-5 w-5" /></>
            )}
          </Button>
        )}

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleSkip}
            disabled={advancing}
            className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            I'll connect later
          </button>
        </div>
      </div>
    </motion.div>
  );
}
