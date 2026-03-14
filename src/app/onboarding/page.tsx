"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
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

  // Load user, organization, and business on mount
  useEffect(() => {
    const loadUserAndOrg = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        const { data: member } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .in("role", ["owner", "ORG_OWNER"])
          .single();

        if (member) {
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

  const handleStep1Next = () => {
    // Business created and onboarding_step updated to 2 by server action
    setCurrentStep(2);
  };

  if (!user || !organization) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Step content */}
      <div>
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
  );
}
