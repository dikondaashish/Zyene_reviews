"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronRight } from "lucide-react";
import { Step1Form } from "@/components/onboarding/step1-form";
import { Step2Form } from "@/components/onboarding/step2-form";
import { Step3Form } from "@/components/onboarding/step3-form";
import { Step4Form } from "@/components/onboarding/step4-form";

// Main Onboarding Component - Uses imported Step1-4 form components

// Main Onboarding Component
export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { currentStep, setCurrentStep, isLoading, setIsLoading, reset } = useOnboardingStore();
  const [user, setUser] = useState<any>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [business, setBusiness] = useState<any>(null);
  const [googleConnected, setGoogleConnected] = useState(false);

  // Load user and organization on mount
  useEffect(() => {
    const loadUserAndOrg = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Get user's organization
        const { data: org } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .eq("role", "owner")
          .single();

        if (org) {
          setOrganizationId(org.organization_id);

          // Load the most recent business in this organization
          const { data: biz } = await supabase
            .from("businesses")
            .select("id, name, city, category")
            .eq("organization_id", org.organization_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (biz) {
            setBusiness(biz);
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
        router.push("/");
      }
    };

    checkOnboarding();
  }, [user, supabase, router, setCurrentStep]);

  const handleStep1Next = (business: any) => {
    // Business created and onboarding_step updated to 2 by server action
    setCurrentStep(2);
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      if (!user) return;

      const nextStep = Math.min(currentStep + 1, 4);
      const { error } = await supabase
        .from("users")
        .update({
          onboarding_completed: nextStep === 4,
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to save progress. Please try again.");
        return;
      }

      setCurrentStep(nextStep);

      if (nextStep === 4) {
        toast.success("🎉 Onboarding complete!");
        setTimeout(() => {
          reset();
          router.push("/");
        }, 1000);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
  };

  if (!user || !organizationId) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const userFullName = user.user_metadata?.full_name || "";

  return (
    <div>
      {/* Step content */}
      <div>
        {currentStep === 1 && (
          <Step1Form
            onNext={handleStep1Next}
            isLoading={isLoading}
            organizationId={organizationId}
            initialFullName={userFullName}
          />
        )}
        {currentStep === 2 && business && (
          <Step2Form
            businessId={business.id}
            businessName={business.name}
            city={business.city}
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
            city={business.city}
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
              router.push("/");
            }}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
