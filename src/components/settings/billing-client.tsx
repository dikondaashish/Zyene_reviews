"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    CreditCard,
    ExternalLink,
    Loader2,
    Zap,
    Crown,
    Building2,
    AlertTriangle,
    Mail,
    MessageSquare,
    Link as LinkIcon,
    Bot,
    MapPin,
    Sparkles,
    ArrowRight,
    Lock,
} from "lucide-react";
import * as PricingCard from "@/components/ui/pricing-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Plan } from "@/services/stripe/plans";
import { isPaidPlanTierUpgrade, planProductTier } from "@/services/stripe/plans";
import { useLanguage } from "@/lib/language-context";
import { parseBillingCheckoutResponse } from "@/lib/billing/parse-checkout-response";
import { enterpriseSalesGmailComposeUrl } from "@/lib/enterprise-sales-contact";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PastDueBillingAlert } from "@/components/billing/past-due-billing-alert";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

interface UsageStat {
    used: number;
    max: number;
}

interface BillingClientProps {
    currentPlan: Plan | null;
    organizationPlanId: string;
    planStatus: string;
    hasStripeCustomer: boolean;
    /** Net-new Stripe checkout may include a 7-day trial; false for returning subscribers. */
    checkoutOffersTrial: boolean;
    /** Active Stripe subscription (active / trialing / past_due) — drives CTA copy and proration confirmation. */
    hasActiveStripeSubscription: boolean;
    canManageBilling: boolean;
    usage: {
        emailRequests: UsageStat;
        smsRequests: UsageStat;
        linkRequests: UsageStat;
        smartReplies: UsageStat;
        businesses: UsageStat;
    };
    plans: Plan[];
}

// ─────────────────────────────────────────────────────────
// Usage Bar
// ─────────────────────────────────────────────────────────

function UsageBar({ label, stat, icon }: { label: string; stat: UsageStat; icon?: React.ReactNode }) {
    const isUnlimited = stat.max === -1;
    const percentage = isUnlimited ? 0 : stat.max > 0 ? Math.min((stat.used / stat.max) * 100, 100) : 0;
    const isNearLimit = !isUnlimited && percentage >= 80;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                    {icon}
                    {label}
                </span>
                <span className="font-medium tabular-nums">
                    {stat.used.toLocaleString()}
                    {isUnlimited ? " used" : ` / ${stat.max.toLocaleString()}`}
                </span>
            </div>
            {!isUnlimited && (
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all",
                            isNearLimit ? "bg-primary" : "bg-primary/70"
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
            {isUnlimited && (
                <div className="h-2 rounded-full bg-gradient-to-r from-green-500/20 to-green-500/5" />
            )}
        </div>
    );
}

function sameProductTier(a: Plan | null, b: Plan): boolean {
    if (!a) return false;
    if (a.id === "enterprise" || b.id === "enterprise") return a.id === b.id;
    const ta = planProductTier(a.id);
    const tb = planProductTier(b.id);
    return ta !== null && ta === tb;
}

// ─────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────

export function BillingClient({
    currentPlan,
    organizationPlanId,
    planStatus,
    hasStripeCustomer,
    checkoutOffersTrial,
    hasActiveStripeSubscription,
    canManageBilling,
    usage,
    plans,
}: BillingClientProps) {
    const { dict } = useLanguage();
    const b = dict.billing;
    const [interval, setInterval] = useState<"month" | "year">(() =>
        currentPlan?.interval === "year" ? "year" : "month"
    );
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [loadingPortal, setLoadingPortal] = useState(false);
    const [confirmPlanChange, setConfirmPlanChange] = useState<{ priceId: string; plan: Plan } | null>(null);
    type ProrationPreviewState = "idle" | "loading" | "fallback" | { amountFormatted: string };
    const [prorationPreview, setProrationPreview] = useState<ProrationPreviewState>("idle");
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (currentPlan?.interval === "month" || currentPlan?.interval === "year") {
            setInterval(currentPlan.interval);
        }
    }, [currentPlan?.id, currentPlan?.interval]);

    useEffect(() => {
        if (!confirmPlanChange) {
            return;
        }
        const ac = new AbortController();
        void (async () => {
            try {
                const res = await fetch("/api/billing/proration-preview", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ priceId: confirmPlanChange.priceId }),
                    signal: ac.signal,
                });
                const json: unknown = await res.json();
                if (ac.signal.aborted) {
                    return;
                }
                const root = json as { success?: boolean; data?: { previewAvailable?: boolean; amountDueTodayFormatted?: string } };
                if (!res.ok || root.success !== true || !root.data) {
                    setProrationPreview("fallback");
                    return;
                }
                const d = root.data;
                if (d.previewAvailable === true && typeof d.amountDueTodayFormatted === "string") {
                    setProrationPreview({ amountFormatted: d.amountDueTodayFormatted });
                } else {
                    setProrationPreview("fallback");
                }
            } catch {
                if (!ac.signal.aborted) {
                    setProrationPreview("fallback");
                }
            }
        })();
        return () => ac.abort();
    }, [confirmPlanChange]);

    useEffect(() => {
        const success = searchParams.get("success");
        const canceled = searchParams.get("canceled");
        const status = searchParams.get("status");

        if (success === "true") {
            toast.success("Subscription updated", {
                description: "Your plan and billing are up to date.",
            });
            router.replace("/settings/billing");
        } else if (canceled === "true") {
            toast.info("Checkout canceled", {
                description: "No charges were made. You can subscribe anytime.",
            });
            router.replace("/settings/billing");
        } else if (status === "limit_reached") {
            toast.error("Business limit reached", {
                description:
                    "You've reached the maximum number of businesses for your current plan. Upgrade to add more locations.",
                duration: 6000,
            });
        }
    }, [searchParams, router]);

    const isEnterpriseOrg = organizationPlanId === "enterprise";
    const hasPricedPlan =
        !!currentPlan &&
        currentPlan.price !== null &&
        currentPlan.price > 0 &&
        organizationPlanId !== "none" &&
        organizationPlanId !== "free";

    const subscriptionHealthy = ["active", "trialing", "past_due"].includes(planStatus);
    const isPaidPlan = (hasPricedPlan || isEnterpriseOrg) && planStatus !== "canceled";

    /** Prefer subscription reality over org.plan lookup so CTAs never show trial copy for paying customers. */
    const treatsAsReturningForCta =
        hasPricedPlan || isEnterpriseOrg || hasActiveStripeSubscription;

    const showFullUsage =
        planStatus === "trialing" ||
        ((hasPricedPlan || isEnterpriseOrg) &&
            ["active", "past_due", "canceled"].includes(planStatus));

    const displayUsage = showFullUsage
        ? usage
        : {
              emailRequests: { used: 0, max: 0 },
              smsRequests: { used: 0, max: 0 },
              linkRequests: { used: 0, max: 0 },
              smartReplies: { used: 0, max: 0 },
              businesses: { used: usage.businesses?.used || 0, max: 1 },
          };

    const displayPlans = plans.filter((p) => p.interval === interval && p.id !== "enterprise");
    const enterprisePlan = plans.find((p) => p.id === "enterprise");

    const currentPlanDisplayName = isEnterpriseOrg
        ? "Enterprise"
        : currentPlan?.name || b.no_active_plan;

    function formatRecurringLabel(plan: Plan): string {
        const suffix = plan.interval === "year" ? "/yr" : "/mo";
        const amount = plan.price != null ? plan.price.toFixed(2) : "—";
        return `$${amount}${suffix}`;
    }

    function requestPlanChange(plan: Plan) {
        if (!canManageBilling) {
            toast.error(b.no_billing_permission);
            return;
        }
        if (!plan.stripePriceId) {
            toast.error(b.billing_not_configured);
            return;
        }
        const isExactCurrent = currentPlan?.id === plan.id;
        if (isExactCurrent && subscriptionHealthy) {
            return;
        }
        const needsProrationConfirm =
            hasActiveStripeSubscription && subscriptionHealthy && !isExactCurrent;
        if (needsProrationConfirm) {
            setProrationPreview("loading");
            setConfirmPlanChange({ priceId: plan.stripePriceId, plan });
            return;
        }
        void handleSubscribe(plan.stripePriceId);
    }

    async function handleSubscribe(priceId: string) {
        if (!canManageBilling) {
            toast.error(b.no_billing_permission);
            return;
        }
        setLoadingPlan(priceId);
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId, source: "billing" }),
            });
            const json = await res.json();
            const parsed = parseBillingCheckoutResponse(json);

            if (!res.ok || !parsed.ok) {
                throw new Error(parsed.error || "Failed to start checkout");
            }

            const payload = parsed.payload;

            if (payload?.switched && payload.url) {
                toast.success("Plan updated", {
                    description: "Your subscription has been updated. Redirecting…",
                });
                window.location.assign(payload.url);
                return;
            }
            if (payload?.url) {
                window.location.assign(payload.url);
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to start checkout");
        } finally {
            setLoadingPlan(null);
        }
    }

    async function handleManageSubscription() {
        if (!canManageBilling) {
            toast.error(b.no_billing_permission);
            return;
        }
        setLoadingPortal(true);
        try {
            const res = await fetch("/api/billing/portal", { method: "POST", credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to open portal");
            if (data.url) window.location.href = data.url;
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
        } finally {
            setLoadingPortal(false);
        }
    }

    const intervalLabel = interval === "month" ? "/mo" : "/yr";
    const monthlyStarterPrice = plans.find((p) => p.id === "starter_monthly")?.price ?? 0;
    const yearlyStarterPrice = plans.find((p) => p.id === "starter_yearly")?.price ?? 0;
    const yearlySavings =
        monthlyStarterPrice > 0
            ? Math.round((1 - yearlyStarterPrice / (monthlyStarterPrice * 12)) * 100)
            : 0;

    const permissionTooltip = !canManageBilling ? b.no_billing_permission : undefined;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{b.title}</h1>
                <p className="text-muted-foreground">{b.subtitle}</p>
            </div>

            {!canManageBilling && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 px-4 py-3 flex gap-3 text-sm text-amber-900 dark:text-amber-100">
                    <Lock className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <p>{b.no_billing_permission}</p>
                </div>
            )}

            {planStatus === "canceled" && (
                <div className="rounded-lg border border-border bg-muted px-4 py-3 flex gap-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                    <p className="text-muted-foreground">{b.subscription_ended}</p>
                </div>
            )}

            {planStatus === "past_due" && (
                <PastDueBillingAlert
                    layout="panel"
                    action={{
                        label: "Update payment",
                        disabled: !hasStripeCustomer,
                        loading: loadingPortal,
                        onClick: () => void handleManageSubscription(),
                    }}
                />
            )}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-xl">{b.current_plan}</CardTitle>
                            <CardDescription>{b.active_subscription}</CardDescription>
                        </div>
                        <Badge
                            variant={isPaidPlan ? (planStatus === "trialing" ? "secondary" : "default") : "secondary"}
                            className={cn(
                                "text-sm px-3 py-1 w-fit",
                                planStatus === "trialing" && "bg-primary/10 text-primary border-primary/20"
                            )}
                        >
                            {isPaidPlan
                                ? planStatus === "trialing"
                                    ? `${currentPlanDisplayName} (trial)`
                                    : currentPlanDisplayName
                                : planStatus === "canceled" && (hasPricedPlan || isEnterpriseOrg)
                                  ? `${currentPlanDisplayName} (canceled)`
                                  : b.no_active_plan}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-wrap items-baseline gap-2">
                        {hasPricedPlan ? (
                            <>
                                {currentPlan?.originalPrice &&
                                    currentPlan.originalPrice > (currentPlan.price || 0) && (
                                        <span className="text-xl line-through text-muted-foreground">
                                            ${currentPlan.originalPrice}
                                        </span>
                                    )}
                                <span className="text-4xl font-bold tabular-nums">${currentPlan?.price}</span>
                                <span className="text-muted-foreground">
                                    /{currentPlan?.interval === "year" ? "year" : "month"}
                                </span>
                            </>
                        ) : isEnterpriseOrg ? (
                            <span className="text-2xl font-semibold text-foreground">Custom pricing</span>
                        ) : (
                            <>
                                <span className="text-2xl font-bold">{b.no_active_plan}</span>
                                <span className="text-muted-foreground text-sm">{b.choose_plan}</span>
                            </>
                        )}
                    </div>

                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                            {b.usage_title}
                        </h3>
                        <UsageBar
                            label={b.email_requests}
                            stat={displayUsage.emailRequests}
                            icon={<Mail className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label={b.sms_requests}
                            stat={displayUsage.smsRequests}
                            icon={<MessageSquare className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label={b.link_requests}
                            stat={displayUsage.linkRequests}
                            icon={<LinkIcon className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label={b.smart_replies}
                            stat={displayUsage.smartReplies}
                            icon={<Bot className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label={b.locations}
                            stat={displayUsage.businesses}
                            icon={<MapPin className="h-3.5 w-3.5" />}
                        />
                    </div>
                </CardContent>

                {hasStripeCustomer && (
                    <CardFooter className="flex-col items-stretch gap-2 border-t bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground order-2 sm:order-1">{b.portal_help}</p>
                        <Button
                            variant="outline"
                            onClick={() => void handleManageSubscription()}
                            disabled={loadingPortal}
                            title={permissionTooltip}
                            className="gap-2 order-1 sm:order-2 shrink-0"
                        >
                            {loadingPortal ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CreditCard className="h-4 w-4" />
                            )}
                            {b.manage_subscription}
                            <ExternalLink className="h-3 w-3 opacity-70" />
                        </Button>
                    </CardFooter>
                )}

                {!isPaidPlan && !hasStripeCustomer && (
                    <CardFooter className="bg-primary/10 dark:bg-primary/15 border-t flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4">
                        <Sparkles className="h-5 w-5 text-primary shrink-0 hidden sm:block" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary">{b.starter_msg}</p>
                            <p className="text-xs text-primary/90">
                                {checkoutOffersTrial ? b.starter_price : b.starter_price_no_trial}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 gap-1 shrink-0 text-primary-foreground"
                            onClick={() => document.getElementById("plan-picker")?.scrollIntoView({ behavior: "smooth" })}
                        >
                            {b.upgrade} <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Plan picker */}
            <div
                id="plan-picker"
                className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/20 p-6 md:p-8"
            >
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
                    style={{
                        backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 0.8px, transparent 0.8px)",
                        backgroundSize: "14px 14px",
                        maskImage:
                            "radial-gradient(ellipse at 50% 10%, rgba(0,0,0,1), rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 72%)",
                    }}
                />
                <div
                    aria-hidden
                    className={cn(
                        "pointer-events-none absolute -top-1/2 left-1/2 h-[min(120vmin,720px)] w-[min(120vmin,720px)] -translate-x-1/2 rounded-full",
                        "bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.12),transparent_55%)] blur-[32px]"
                    )}
                />

                <div className="relative z-10">
                    <div className="mb-2">
                        <h2 className="text-xl font-semibold">{hasPricedPlan || isEnterpriseOrg ? b.change_plan_title : b.choose_plan_title}</h2>
                        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{b.plan_section_subtitle}</p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end mb-6">
                        <div
                            className="inline-flex w-full sm:w-auto items-center gap-0.5 rounded-full border border-border bg-muted/80 p-1 dark:border-border/60 dark:bg-muted/80"
                            role="tablist"
                            aria-label="Billing interval"
                        >
                            <button
                                type="button"
                                role="tab"
                                aria-selected={interval === "month"}
                                onClick={() => setInterval("month")}
                                className={cn(
                                    "flex-1 sm:flex-none rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                                    interval === "month"
                                        ? "bg-card text-foreground ring-1 ring-primary/40 dark:bg-card dark:text-foreground dark:ring-primary/50"
                                        : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
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
                                    "flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                                    interval === "year"
                                        ? "bg-card text-foreground ring-1 ring-primary/40 dark:bg-card dark:text-foreground dark:ring-primary/50"
                                        : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                                )}
                            >
                                Yearly
                                <Badge
                                    variant="secondary"
                                    className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                                >
                                    Save {yearlySavings > 0 ? `~${yearlySavings}%` : "more"}
                                </Badge>
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {displayPlans.map((plan) => {
                            const isExactCurrent = currentPlan?.id === plan.id;
                            const tierMatch = sameProductTier(currentPlan, plan);
                            const isBillingIntervalSwitch =
                                tierMatch && currentPlan && currentPlan.id !== plan.id;
                            const isPro = plan.name === "Professional";
                            const priceConfigured = !!plan.stripePriceId;

                            let planCta: string;
                            if (treatsAsReturningForCta) {
                                if (isBillingIntervalSwitch) {
                                    planCta =
                                        plan.interval === "year"
                                            ? b.switch_to_yearly
                                            : b.switch_to_monthly;
                                } else {
                                    planCta = `${b.switch_to_prefix} ${plan.name}`;
                                }
                            } else {
                                planCta = checkoutOffersTrial ? b.start_trial_cta : b.subscribe_cta;
                            }

                            const showTrialEndsOnUpgradeHint =
                                planStatus === "trialing" &&
                                subscriptionHealthy &&
                                !isExactCurrent &&
                                isPaidPlanTierUpgrade(currentPlan?.id, plan.id);

                            const showProProratedHint =
                                isPro &&
                                treatsAsReturningForCta &&
                                subscriptionHealthy &&
                                !isExactCurrent;

                            return (
                                <PricingCard.Card
                                    key={plan.id}
                                    className={cn(
                                        "relative flex w-full max-w-none flex-col h-full",
                                        isPro &&
                                            "ring-2 ring-primary/50",
                                        isExactCurrent && subscriptionHealthy && "ring-2 ring-primary/60"
                                    )}
                                >
                                    {isPro && (
                                        <div className="absolute -top-2 right-3 z-20">
                                            <Badge className="bg-primary text-primary-foreground border-0">
                                                Most popular
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
                                        <PricingCard.Description className="mb-2 text-[11px] leading-snug text-muted-foreground">
                                            {isPro
                                                ? "For growing brands with multiple stores or franchises."
                                                : "Everything you need to collect reviews and reply from one location."}
                                        </PricingCard.Description>
                                        <PricingCard.Price>
                                            {plan.originalPrice && plan.originalPrice > (plan.price || 0) && (
                                                <PricingCard.OriginalPrice>
                                                    ${plan.originalPrice}
                                                </PricingCard.OriginalPrice>
                                            )}
                                            <PricingCard.MainPrice>${plan.price}</PricingCard.MainPrice>
                                            <PricingCard.Period>{intervalLabel}</PricingCard.Period>
                                        </PricingCard.Price>
                                        {!treatsAsReturningForCta && checkoutOffersTrial && (
                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3">
                                                {b.trial_included}
                                            </p>
                                        )}
                                        {showProProratedHint && (
                                            <p className="text-xs text-muted-foreground mb-3">
                                                {b.pro_prorated_no_trial_badge}
                                            </p>
                                        )}
                                        {isExactCurrent && subscriptionHealthy ? (
                                            <Button variant="outline" className="w-full font-semibold" disabled>
                                                {b.current_plan_badge}
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                className={cn(
                                                    "w-full font-semibold text-primary-foreground",
                                                    "bg-primary",
                                                    "hover:bg-primary/90 disabled:opacity-60"
                                                )}
                                                onClick={() => requestPlanChange(plan)}
                                                disabled={loadingPlan === plan.stripePriceId}
                                                title={
                                                    !priceConfigured
                                                        ? b.billing_not_configured
                                                        : permissionTooltip
                                                }
                                            >
                                                {loadingPlan === plan.stripePriceId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : null}
                                                {planCta}
                                            </Button>
                                        )}
                                        {showTrialEndsOnUpgradeHint && (
                                            <p className="text-xs text-amber-800 dark:text-amber-200 mt-2 leading-snug">
                                                {b.trial_ends_on_upgrade_notice}
                                            </p>
                                        )}
                                    </PricingCard.Header>
                                    <PricingCard.Body className="space-y-3 p-2">
                                        <PricingCard.List className="space-y-2">
                                            {plan.features.map((feature) => (
                                                <PricingCard.ListItem key={feature} className="text-xs gap-2">
                                                    <span className="mt-0.5 shrink-0">
                                                        <CheckCircle2
                                                            className="h-3.5 w-3.5 text-emerald-500"
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
                            <PricingCard.Card
                                className={cn(
                                    "relative flex w-full max-w-none flex-col border-dashed",
                                    isEnterpriseOrg && subscriptionHealthy && "ring-2 ring-primary/60"
                                )}
                            >
                                <PricingCard.Header className="relative z-10">
                                    <PricingCard.Plan>
                                        <PricingCard.PlanName>
                                            <Building2 className="text-muted-foreground" aria-hidden />
                                            <span className="text-foreground">Enterprise</span>
                                        </PricingCard.PlanName>
                                        <PricingCard.Badge>Custom</PricingCard.Badge>
                                    </PricingCard.Plan>
                                    <PricingCard.Description className="mb-2 text-[11px] leading-snug text-muted-foreground">
                                        Volume, security reviews, SSO, and custom contracts for large groups.
                                    </PricingCard.Description>
                                    <PricingCard.Price>
                                        <PricingCard.MainPrice className="text-2xl">Custom</PricingCard.MainPrice>
                                    </PricingCard.Price>
                                    {isEnterpriseOrg && subscriptionHealthy ? (
                                        <Button variant="outline" className="w-full font-semibold" disabled>
                                            {b.current_plan_badge}
                                        </Button>
                                    ) : (
                                        <a
                                            href={enterpriseSalesGmailComposeUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                buttonVariants({ variant: "outline", size: "default" }),
                                                "w-full gap-2 font-semibold"
                                            )}
                                        >
                                            <Mail className="h-4 w-4" aria-hidden />
                                            Contact sales
                                        </a>
                                    )}
                                </PricingCard.Header>
                                <PricingCard.Body>
                                    <PricingCard.List>
                                        {enterprisePlan.features.map((feature) => (
                                            <PricingCard.ListItem key={feature}>
                                                <span className="mt-0.5 shrink-0">
                                                    <CheckCircle2
                                                        className="h-4 w-4 text-emerald-500"
                                                        aria-hidden
                                                    />
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

            <AlertDialog
                open={confirmPlanChange !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmPlanChange(null);
                        setProrationPreview("idle");
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{b.confirm_plan_change_title}</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 text-muted-foreground text-sm">
                                {prorationPreview === "loading" && (
                                    <div className="flex items-center gap-2 text-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                                        <span>{b.proration_preview_loading}</span>
                                    </div>
                                )}
                                {prorationPreview === "fallback" && confirmPlanChange && (
                                    <p>
                                        {b.proration_notice_fallback.replace(
                                            "{{recurring}}",
                                            formatRecurringLabel(confirmPlanChange.plan)
                                        )}
                                    </p>
                                )}
                                {typeof prorationPreview === "object" && confirmPlanChange && (
                                    <p>
                                        {b.proration_notice
                                            .replace("{{amount_due_today}}", prorationPreview.amountFormatted)
                                            .replace("{{recurring}}", formatRecurringLabel(confirmPlanChange.plan))}
                                    </p>
                                )}
                                {confirmPlanChange &&
                                    planStatus === "trialing" &&
                                    isPaidPlanTierUpgrade(currentPlan?.id, confirmPlanChange.plan.id) && (
                                        <p className="text-amber-900 dark:text-amber-100 font-medium">
                                            {b.trial_ends_on_upgrade_notice}
                                        </p>
                                    )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{b.confirm_plan_change_cancel}</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={prorationPreview === "loading"}
                            onClick={() => {
                                const pending = confirmPlanChange;
                                setConfirmPlanChange(null);
                                setProrationPreview("idle");
                                if (pending) void handleSubscribe(pending.priceId);
                            }}
                        >
                            {b.confirm_plan_change_continue}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
