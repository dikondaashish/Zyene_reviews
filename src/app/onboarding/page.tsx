"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/supabase/client";
import { useOnboardingStore } from "@/lib/state/onboarding-store";
import { Loader2 } from "lucide-react";
import { Step1Form } from "@/components/onboarding/step1-form";
import { Step2Form } from "@/components/onboarding/step2-form";
import { Step3Form } from "@/components/onboarding/step3-form";
import { Step4Form } from "@/components/onboarding/step4-form";

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
            .select("id, name, city, category, address_line1, state, phone")
            .eq("organization_id", member.organization_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (biz) {
            setBusiness({
              ...biz,
              city: biz.city ?? null,
            });
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-6">
        <p className="text-sm font-semibold text-slate-900">Onboarding failed to load</p>
        <p className="text-sm text-muted-foreground max-w-md">
          {loadError}
        </p>
        <button
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }

  if (!user || !organization) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const stepTitles = [
    "Organization",
    "Business Profile",
    "Category",
    "All Set!"
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress Header */}
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                Step {currentStep} of 4
              </p>
              <h1 className="text-xl font-bold text-foreground">
                {stepTitles[currentStep - 1]}
              </h1>
            </div>
            {currentStep === 1 && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                 ⏱️ Takes 2 minutes
              </span>
            )}
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10">
          {currentStep === 1 && (
            <Step1Form
              onNext={handleStep1Next}
              isLoading={isLoading}
              organizationId={organization.id}
              initialOrgName={organization.name}
            />
          )}
          {currentStep === 2 && business && (
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
              onNext={async () => {
                setGoogleConnected(true);
                setCurrentStep(3);
              }}
              onSkip={async () => {
                setCurrentStep(3);
              }}
              isLoading={isLoading}
            />
          )}
          {currentStep === 2 && !business && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          {currentStep === 3 && business && (
            <Step3Form
              businessId={business.id}
              businessName={business.name}
              city={business.city ?? ""}
              onNext={async () => setCurrentStep(4)}
              isLoading={isLoading}
            />
          )}
          {currentStep === 4 && business && user && (
            <Step4Form
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
          )}
        </div>
      </div>
    </div>
  );
}
