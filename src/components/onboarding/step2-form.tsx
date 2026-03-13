"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateOnboardingStep, initializeGoogleAuth } from "@/app/actions/onboarding";

interface Step2Props {
  onNext: () => Promise<void>;
  onSkip: () => Promise<void>;
  isLoading: boolean;
  businessId: string;
  businessName: string;
  city: string;
}

interface GoogleAccessToken {
  accessToken: string;
  expiresIn: number;
  expiresAt: number;
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
}: Step2Props) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<GoogleConnectionState>({ status: "idle" });
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && state.status === "idle") {
      handleGoogleCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGoogleCallback = async (authCode: string) => {
    setState({ status: "connecting" });
    try {
      const result = await initializeGoogleAuth(authCode, businessId);

      if (result.success && result.reviewData) {
        setState({
          status: "success",
          reviewCount: result.reviewData.reviewCount,
          averageRating: result.reviewData.averageRating,
        });
        toast.success("Google Business Profile connected!");
      } else {
        setState({
          status: "error",
          errorMessage: result.error || "Failed to connect Google Business Profile",
        });
        toast.error(state.errorMessage);
      }
    } catch (error: any) {
      setState({
        status: "error",
        errorMessage: "An unexpected error occurred",
      });
      toast.error("An unexpected error occurred");
    }
  };

  const handleConnectClick = async () => {
    // Generate OAuth URL and redirect
    // This would typically be a URL like:
    // https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=...
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/onboarding`;
    const scopes = [
      "https://www.googleapis.com/auth/business.manage",
    ].join(" ");

    const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    oauthUrl.searchParams.set("client_id", clientId || "");
    oauthUrl.searchParams.set("redirect_uri", redirectUri);
    oauthUrl.searchParams.set("response_type", "code");
    oauthUrl.searchParams.set("scope", scopes);
    oauthUrl.searchParams.set("access_type", "offline");
    oauthUrl.searchParams.set("prompt", "consent");

    window.location.href = oauthUrl.toString();
  };

  const handleRetry = () => {
    setState({ status: "idle" });
  };

  const handleNext = async () => {
    setAdvancing(true);
    try {
      const result = await updateOnboardingStep(businessId, 3);
      if (result.success) {
        toast.success("Advancing to next step...");
        await onNext();
      } else {
        toast.error(result.error || "Failed to save progress");
      }
    } finally {
      setAdvancing(false);
    }
  };

  const handleSkip = async () => {
    setAdvancing(true);
    try {
      const result = await updateOnboardingStep(businessId, 3);
      if (result.success) {
        await onSkip();
      } else {
        toast.error(result.error || "Failed to save progress");
      }
    } finally {
      setAdvancing(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "50%" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Connect Google to start monitoring reviews
        </h2>
        <p className="text-gray-600 mt-2">
          We only request read access and the ability to reply. We never post without your approval.
        </p>
      </div>

      {/* Google Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          {/* Google Logo */}
          <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Google Business Profile</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-6">
          Sync reviews, track ratings, and reply with AI — all from Zyene
        </p>

        {/* States */}
        {state.status === "idle" && (
          <>
            <Button
              onClick={handleConnectClick}
              className="w-full text-base py-6 bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold mb-3"
            >
              Connect with Google
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Secure OAuth — we never store your password
            </p>
          </>
        )}

        {state.status === "connecting" && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-700 font-medium">Connecting to Google...</span>
          </div>
        )}

        {state.status === "success" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">
                  Connected: {businessName} — {city}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {state.reviewCount} reviews found | ⭐ {state.averageRating?.toFixed(1) || "0.0"} avg rating
                </p>
              </div>
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium text-sm">
                {state.errorMessage || "Connection failed. Check your Google account and try again."}
              </p>
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {state.status === "success" ? (
          <Button
            onClick={handleNext}
            disabled={advancing}
            className="flex-1 text-base py-6 bg-green-600 hover:bg-green-700"
          >
            {advancing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Next...
              </>
            ) : (
              "Next →"
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={advancing}
            className="flex-1 text-base py-6"
          >
            {advancing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Next...
              </>
            ) : (
              "Next →"
            )}
          </Button>
        )}
      </div>

      {/* Skip Link */}
      <div className="text-center pt-2">
        <button
          onClick={handleSkip}
          disabled={advancing}
          className="text-gray-400 hover:text-gray-600 text-sm transition-colors disabled:opacity-50"
        >
          Skip for now →
        </button>
      </div>
    </motion.div>
  );
}
