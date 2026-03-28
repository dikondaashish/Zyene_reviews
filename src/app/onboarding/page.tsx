"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/supabase/client";
import { useOnboardingStore } from "@/lib/state/onboarding-store";
import { motion, AnimatePresence } from "framer-motion";
import { Step1Form } from "@/components/onboarding/step1-form";
import { Step2Form } from "@/components/onboarding/step2-form";
import { Step3Form } from "@/components/onboarding/step3-form";
import { Step4SubscriptionForm } from "@/components/onboarding/step4-subscription-form";
import { Step5Form } from "@/components/onboarding/step5-form";
import { triggerOnboardingSync } from "@/app/actions/onboarding";
import { Loader2, Building2, MapPin, LayoutGrid, PartyPopper, Gem } from "lucide-react";

interface OnboardingOrganization {
  id: string;
  name: string;
}

interface OnboardingBusiness {
  id: string;
  name: string;
  city: string | null;
  category: string | null;
  address_line1?: string | null;
  state?: string | null;
  phone?: string | null;
}

interface OnboardingUser {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
  };
}

const STEPS = [
  { label: "Organization", icon: Building2 },
  { label: "Business", icon: MapPin },
  { label: "Category", icon: LayoutGrid },
  { label: "Plan", icon: Gem },
  { label: "All Set", icon: PartyPopper },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { currentStep, setCurrentStep, isLoading, reset } = useOnboardingStore();
  const [user, setUser] = useState<OnboardingUser | null>(null);
  const [organization, setOrganization] = useState<OnboardingOrganization | null>(null);
  const [business, setBusiness] = useState<OnboardingBusiness | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Holds the ?code= from Google OAuth redirect so Step2Form can process it immediately
  const [pendingGoogleCode, setPendingGoogleCode] = useState<string | null>(null);

  // Detect Google OAuth ?code= redirect BEFORE anything else.
  // When Google redirects back, the Zustand store resets to step 1 (in-memory).
  // We detect the code here, jump straight to step 2, and pass it via prop.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setPendingGoogleCode(code);
      // Jump to step 2 so the code can be processed there
      setCurrentStep(2);
      // Strip the code from the URL immediately to prevent double-processing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setCurrentStep]);

  // Load user, organization, and business on mount
  useEffect(() => {
    const loadUserAndOrg = async () => {
      setLoadError(null);
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) {
        setLoadError(userErr.message);
        return;
      }

      if (user) {
        setUser(user);

        const { data: member, error: memberErr } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          // Users can have different role strings; do not hardcode here.
          .maybeSingle();

        if (memberErr) {
          setLoadError(memberErr.message);
          return;
        }

        if (member?.organization_id) {
          const { data: org } = await supabase
            .from("organizations")
            .select("id, name")
            .eq("id", member.organization_id)
            .single();
          if (org) setOrganization(org);

          const { data: biz } = await supabase
            .from("businesses")
            .select("id, name, city, category, address_line1, state, phone, review_platforms(*)")
            .eq("organization_id", member.organization_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (biz) {
            setBusiness({
              ...biz,
              city: biz.city ?? null,
            });
            const hasGoogle = biz.review_platforms?.some((p: any) => p.platform === "google");
            setGoogleConnected(hasGoogle);
            
            // If Google is already connected, trigger a background sync on login
            if (hasGoogle) {
              triggerOnboardingSync(biz.id).catch(console.error);
            }
          }
        }
      }
    };

    loadUserAndOrg();
  }, [supabase]);

  // Check if user already completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (data?.onboarding_completed) {
        router.push("/dashboard");
      }
    };

    checkOnboarding();
  }, [user, supabase, router]);

  // Callback so Step2Form can notify us that business info updated from Google
  const handleBusinessUpdate = (updated: Partial<OnboardingBusiness>) => {
    setBusiness((prev) => prev ? { ...prev, ...updated } : prev);
  };

  const handleStep1Next = () => {
    // Business created and onboarding_step updated to 2 by server action
    setCurrentStep(2);
  };

  if (loadError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-sm font-semibold text-foreground">Something went wrong</p>
        <p className="text-sm text-muted-foreground max-w-md">{loadError}</p>
        <button
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!user || !organization) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
            <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Setting things up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Step indicator — animated dots */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          const StepIcon = step.icon;

          return (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className={`
                    w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-default
                    ${isCompleted
                      ? "bg-[oklch(0.7_0.22_60)] text-white shadow-lg shadow-orange-500/25"
                      : isActive
                        ? "bg-[oklch(0.7_0.22_60)]/10 text-[oklch(0.7_0.22_60)] ring-2 ring-[oklch(0.7_0.22_60)]/30 shadow-sm"
                        : "bg-secondary/60 text-muted-foreground"
                    }
                  `}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </motion.div>
                <span className={`text-[11px] font-semibold tracking-wide hidden sm:block ${
                  isActive ? "text-[oklch(0.7_0.22_60)]" : isCompleted ? "text-orange-500/70" : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="w-8 sm:w-12 h-[2px] mx-1 sm:mx-2 mb-6 sm:mb-4 rounded-full overflow-hidden bg-secondary/60">
                  <motion.div
                    className="h-full bg-[oklch(0.7_0.22_60)] rounded-full"
                    initial={false}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Glass card wrapper */}
      <div className="relative">
        {/* Card glow */}
        <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/5 via-transparent to-violet-500/5 rounded-[2rem] blur-sm" />

        <div className="relative pro-card p-7 sm:p-10">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <Step1Form
                  onNext={handleStep1Next}
                  isLoading={isLoading}
                  organizationId={organization.id}
                  initialOrgName={organization.name}
                />
              </motion.div>
            )}
            {currentStep === 2 && business && (
              <motion.div key="step-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <Step2Form
                  businessId={business.id}
                  businessName={business.name}
                  city={business.city ?? ""}
                  address={business.address_line1 ?? ""}
                  state={business.state ?? ""}
                  phone={business.phone ?? ""}
                  pendingGoogleCode={pendingGoogleCode}
                  onGoogleCodeConsumed={() => setPendingGoogleCode(null)}
                  onBusinessUpdate={handleBusinessUpdate}
                  initialConnected={googleConnected}
                  onNext={async () => {
                    setGoogleConnected(true);
                    setCurrentStep(3);
                  }}
                  onSkip={async () => {
                    setCurrentStep(3);
                  }}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
            {currentStep === 2 && !business && (
              <motion.div key="step-2-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </motion.div>
            )}
            {currentStep === 3 && business && (
              <motion.div key="step-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <Step3Form
                  businessId={business.id}
                  businessName={business.name}
                  city={business.city ?? ""}
                  initialCategory={business.category ?? undefined}
                  onNext={async () => setCurrentStep(4)}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
            {currentStep === 4 && organization && (
              <motion.div key="step-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <Step4SubscriptionForm
                  organizationId={organization.id}
                  isGoogleConnected={googleConnected}
                  onNext={() => setCurrentStep(5)}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
            {currentStep === 5 && business && user && (
              <motion.div key="step-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <Step5Form
                  businessId={business.id}
                  businessName={business.name}
                  userEmail={user.email || ""}
                  userName={user.user_metadata?.full_name || "Valued Customer"}
                  googleConnected={googleConnected}
                  onNext={() => {
                    reset();
                    router.push("/dashboard");
                  }}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
