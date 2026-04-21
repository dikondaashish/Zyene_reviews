"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { getCheckoutTrialEligibilityForOrganization } from "@/app/actions/billing-trial";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  Crown,
  Zap,
  Building2,
  Mail,
} from "lucide-react";
import * as PricingCard from "@/components/ui/pricing-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { savePlanSelection } from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";
import { enterpriseSalesGmailComposeUrl } from "@/lib/enterprise-sales-contact";
import { PLANS, type Plan } from "@/services/stripe/plans";

interface Step4SubscriptionFormProps {
  organizationId: string;
  /** Passed from onboarding page when Google is linked; reserved for future UX hints */
  isGoogleConnected?: boolean;
  isCancelled?: boolean;
  onNext: () => void;
  isLoading?: boolean;
}

export function Step4SubscriptionForm({
  organizationId,
  isGoogleConnected: _isGoogleConnected,
  isCancelled = false,
  onNext,
  isLoading: externalIsLoading = false,
}: Step4SubscriptionFormProps) {
  void _isGoogleConnected;
  const { dict } = useLanguage();
  const b = dict.billing;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [interval, setInterval] = useState<"month" | "year">("month");
  /** null until loaded — matches /api/billing/checkout via isEligibleForIntroTrial (any past subscription on customer). */
  const [checkoutOffersTrial, setCheckoutOffersTrial] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLoading(externalIsLoading);
  }, [externalIsLoading]);

  useEffect(() => {
    let cancelled = false;
    void getCheckoutTrialEligibilityForOrganization(organizationId).then((r) => {
      if (!cancelled) setCheckoutOffersTrial(r.eligible);
    });
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const displayPlans = PLANS.filter(
    (p) => p.interval === interval && p.id !== "enterprise"
  );
  const enterprisePlan = PLANS.find((p) => p.id === "enterprise");

  const monthlyStarterPrice = PLANS.find((p) => p.id === "starter_monthly")?.price ?? 0;
  const yearlyStarterPrice = PLANS.find((p) => p.id === "starter_yearly")?.price ?? 0;
  const yearlySavings =
    monthlyStarterPrice > 0
      ? Math.round((1 - yearlyStarterPrice / (monthlyStarterPrice * 12)) * 100)
      : 0;

  const intervalLabel = interval === "month" ? "/mo" : "/yr";

  const onSubscribe = async (plan: Plan) => {
    setLoadingPlan(plan.id);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, source: "onboarding" }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success !== true) {
        const err =
          typeof data.error === "string"
            ? data.error
            : "Failed to start checkout";
        throw new Error(err);
      }

      const url = data.data?.url;
      if (typeof url === "string" && url.length > 0) {
        sessionStorage.setItem("zyene_payment_pending", "true");
        window.location.href = url;
        return;
      }

      throw new Error("No checkout URL returned");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const result = await savePlanSelection(organizationId, { plan: "none" });
      if (result.success) {
        onNext();
      } else {
        toast.error(result.error || "Failed to continue");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const trialEligibilityLoading = checkoutOffersTrial === null;
  /** Plan buttons wait for trial eligibility; skip does not need it. */
  const planBusy = isLoading || loadingPlan !== null || trialEligibilityLoading;
  const busy = isLoading || loadingPlan !== null;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/20 p-6 md:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.06) 0.8px, transparent 0.8px)",
            backgroundSize: "14px 14px",
            maskImage:
              "radial-gradient(ellipse at 50% 10%, rgba(0,0,0,1), rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 72%)",
          }}
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -top-1/2 left-1/2 h-[min(120vmin,720px)] w-[min(120vmin,720px)] -translate-x-1/2 rounded-full",
            "bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.12),transparent_55%)]",
            "blur-[32px]",
          )}
        />

        <div className="relative z-10">
          {isCancelled && (
            <Alert className="mb-6 bg-primary/10 border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
              <AlertTitle className="text-foreground">Payment not completed</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                It looks like the checkout process wasn't finished. You can try again or choose a different plan.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-xl font-semibold text-left">Choose a Plan</h3>

            <div
              className="inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/80 p-1 dark:border-border/60 dark:bg-muted/80 self-start sm:self-auto"
              role="tablist"
              aria-label="Billing interval"
            >
              <button
                type="button"
                role="tab"
                aria-selected={interval === "month"}
                onClick={() => setInterval("month")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                  interval === "month"
                    ? "bg-card text-foreground ring-1 ring-primary/40 dark:bg-card dark:text-foreground dark:ring-primary/50"
                    : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={interval === "year"}
                onClick={() => setInterval("year")}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                  interval === "year"
                    ? "bg-card text-foreground ring-1 ring-primary/40 dark:bg-card dark:text-foreground dark:ring-primary/50"
                    : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
                )}
              >
                Yearly
                <Badge
                  variant="secondary"
                  className="text-xs bg-chart-2/15 text-chart-2 border-chart-2/30 dark:bg-chart-2/20 dark:text-chart-2 dark:border-chart-2/30"
                >
                  Save {yearlySavings > 0 ? `~${yearlySavings}%` : "more"}
                </Badge>
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
            {displayPlans.map((plan) => {
              const isPro = plan.name === "Professional";

              return (
                <PricingCard.Card
                  key={plan.id}
                  className={cn(
                    "relative flex w-full max-w-none flex-col h-full",
                    "transition-all duration-300 hover:-translate-y-2 hover:border-border dark:hover:border-border",
                    isPro &&
                      "ring-2 ring-primary/50 hover:ring-primary/70",
                  )}
                >
                  {isPro && (
                    <div className="absolute -top-2 right-3 z-20">
                      <Badge className="bg-primary text-primary-foreground border-0">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <PricingCard.Header className="relative z-10 mb-3 p-3">
                    <PricingCard.Plan>
                      <PricingCard.PlanName>
                        {isPro ? (
                          <Crown className="text-primary" aria-hidden />
                        ) : (
                          <Zap className="text-primary" aria-hidden />
                        )}
                        <span className="text-foreground">{plan.name}</span>
                      </PricingCard.PlanName>
                      <PricingCard.Badge>
                        {isPro ? "Multi-location" : "Single location"}
                      </PricingCard.Badge>
                    </PricingCard.Plan>
                    <PricingCard.Description className="mb-2 text-[11px] leading-tight">
                      {isPro
                        ? "For growing multi-location businesses."
                        : "Perfect for single-location businesses."}
                    </PricingCard.Description>
                    <PricingCard.Price>
                      {plan.originalPrice != null &&
                        plan.originalPrice > (plan.price || 0) && (
                          <PricingCard.OriginalPrice>
                            ${plan.originalPrice}
                          </PricingCard.OriginalPrice>
                        )}
                      <PricingCard.MainPrice>${plan.price}</PricingCard.MainPrice>
                      <PricingCard.Period>{intervalLabel}</PricingCard.Period>
                    </PricingCard.Price>
                    {checkoutOffersTrial === true && (
                      <p className="text-xs font-medium text-chart-2 dark:text-chart-2 mb-3">
                        {b.trial_included}
                      </p>
                    )}
                    <Button
                      className={cn(
                        "relative z-20 w-full font-semibold text-primary-foreground transition-all duration-300 cursor-pointer",
                        "bg-primary",
                        "hover:-translate-y-1 hover:brightness-110 active:translate-y-0",
                      )}
                      onClick={() => onSubscribe(plan)}
                      disabled={loadingPlan === plan.id || planBusy}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        {(loadingPlan === plan.id || trialEligibilityLoading) && (
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        )}
                        {!trialEligibilityLoading &&
                          (checkoutOffersTrial ? b.start_trial_cta : b.subscribe_cta)}
                      </span>
                    </Button>
                  </PricingCard.Header>
                  <PricingCard.Body className="space-y-3 p-2">
                    <PricingCard.List className="space-y-2">
                      {plan.features.map((feature) => (
                        <PricingCard.ListItem key={feature} className="text-xs gap-2">
                          <span className="mt-0.5 shrink-0">
                            <CheckCircle2
                              className="h-3.5 w-3.5 text-chart-2"
                              aria-hidden
                            />
                          </span>
                          <span>{feature}</span>
                        </PricingCard.ListItem>
                      ))}
                    </PricingCard.List>
                  </PricingCard.Body>
                </PricingCard.Card>
              );
            })}

            {enterprisePlan && (
              <PricingCard.Card className="relative flex w-full max-w-none flex-col border-dashed transition-all duration-300 hover:-translate-y-2 hover:border-solid hover:border-border dark:hover:border-border">
                <PricingCard.Header className="relative z-10">
                  <PricingCard.Plan>
                    <PricingCard.PlanName>
                      <Building2 className="text-muted-foreground" aria-hidden />
                      <span className="text-foreground">Enterprise</span>
                    </PricingCard.PlanName>
                    <PricingCard.Badge>Custom</PricingCard.Badge>
                  </PricingCard.Plan>
                  <PricingCard.Description className="mb-3">
                    For large organizations with custom needs.
                  </PricingCard.Description>
                  <PricingCard.Price>
                    <PricingCard.MainPrice className="text-2xl">Custom</PricingCard.MainPrice>
                  </PricingCard.Price>
                  <a
                    href={enterpriseSalesGmailComposeUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "w-full gap-2 font-semibold transition-all duration-200 hover:-translate-y-1 hover:bg-muted dark:hover:bg-muted"
                    )}
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    Contact Sales
                  </a>
                </PricingCard.Header>
                <PricingCard.Body>
                  <PricingCard.List>
                    {enterprisePlan.features.map((feature) => (
                      <PricingCard.ListItem key={feature}>
                        <span className="mt-0.5 shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-chart-2" aria-hidden />
                        </span>
                        <span>{feature}</span>
                      </PricingCard.ListItem>
                    ))}
                  </PricingCard.List>
                </PricingCard.Body>
              </PricingCard.Card>
            )}
          </div>

        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSkip}
          disabled={busy}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
