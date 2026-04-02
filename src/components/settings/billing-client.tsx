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
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import * as PricingCard from "@/components/ui/pricing-card";
import { cn } from "@/lib/utils/index";
import { toast } from "sonner";
import type { Plan } from "@/services/stripe/plans";
import { useLanguage } from "@/lib/language-context";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

interface UsageStat {
    used: number;
    max: number; // -1 = unlimited
}

interface BillingClientProps {
    currentPlan: Plan | null;
    planStatus: string;
    hasStripeCustomer: boolean;
    usage: {
        emailRequests: UsageStat;
        smsRequests: UsageStat;
        linkRequests: UsageStat;
        aiReplies: UsageStat;
        businesses: UsageStat;
    };
    plans: Plan[];
}

// ─────────────────────────────────────────────────────────
// Usage Bar Component
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
                <span className="font-medium">
                    {stat.used.toLocaleString()}
                    {isUnlimited ? " used" : ` / ${stat.max.toLocaleString()}`}
                </span>
            </div>
            {!isUnlimited && (
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${isNearLimit ? "bg-orange-500" : "bg-blue-500"
                            }`}
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

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

export function BillingClient({
    currentPlan,
    planStatus,
    hasStripeCustomer,
    usage,
    plans,
}: BillingClientProps) {
    const { dict } = useLanguage();
    const [interval, setInterval] = useState<"month" | "year">("month");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [loadingPortal, setLoadingPortal] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Show toast after checkout redirect
    useEffect(() => {
        if (searchParams.get("success") === "true") {
            toast.success("Subscription activated!", {
                description: "Your plan is now active. Welcome aboard!",
            });
            // Clean up URL params
            router.replace("/settings/billing");
        } else if (searchParams.get("canceled") === "true") {
            toast.info("Checkout canceled", {
                description: "No charges were made. You can subscribe anytime.",
            });
            router.replace("/settings/billing");
        }
    }, [searchParams, router]);

    const isPaidPlan = !!currentPlan && currentPlan.price !== null && currentPlan.price > 0;
    const currentPlanName = currentPlan?.name || "No Active Plan";

    // If no active plan, force usage max limits to 0, except for businesses which should be 1.
    // Also set used to 0 so it clearly shows "0 / 0".
    // If no active plan, force usage max limits to 0, except for businesses which should be 1.
    // Also set used to 0 so it clearly shows "0 / 0".
    const displayUsage = (isPaidPlan || planStatus === "trialing")
        ? usage 
        : {
            emailRequests: { used: 0, max: 0 },
            smsRequests: { used: 0, max: 0 },
            linkRequests: { used: 0, max: 0 },
            aiReplies: { used: 0, max: 0 },
            businesses: { used: usage.businesses?.used || 0, max: 1 },
        };

    // Filter plans by selected interval (exclude enterprise)
    const displayPlans = plans.filter(
        (p) => p.interval === interval && p.id !== "enterprise"
    );
    const enterprisePlan = plans.find((p) => p.id === "enterprise");

    async function handleSubscribe(priceId: string) {
        setLoadingPlan(priceId);
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            if (data.switched) {
                // Plan was switched in-place (no Stripe checkout needed)
                toast.success("Plan switched!", {
                    description: "Your subscription has been updated. Changes take effect immediately.",
                });
                router.refresh();
            } else if (data.url) {
                // New subscription — redirect to Stripe checkout
                window.location.href = data.url;
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to start checkout");
        } finally {
            setLoadingPlan(null);
        }
    }

    async function handleManageSubscription() {
        setLoadingPortal(true);
        try {
            const res = await fetch("/api/billing/portal", {
                method: "POST",
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);
            if (data.url) window.location.href = data.url;
        } catch (error: any) {
            toast.error(error.message || "Failed to open billing portal");
        } finally {
            setLoadingPortal(false);
        }
    }

    const intervalLabel = interval === "month" ? "/mo" : "/yr";
    const monthlyStarterPrice = plans.find(p => p.id === "starter_monthly")?.price ?? 0;
    const yearlyStarterPrice = plans.find(p => p.id === "starter_yearly")?.price ?? 0;
    const yearlySavings = monthlyStarterPrice > 0 ? Math.round((1 - yearlyStarterPrice / (monthlyStarterPrice * 12)) * 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{dict.billing.title}</h1>
                <p className="text-muted-foreground">
                    {dict.billing.subtitle}
                </p>
            </div>

            {/* Past Due Warning */}
            {planStatus === "past_due" && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                    <div>
                        <p className="font-medium text-orange-800">
                            Payment Past Due
                        </p>
                        <p className="text-sm text-orange-700">
                            Your last payment failed. Please update your payment
                            method to avoid service interruption.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto shrink-0"
                        onClick={handleManageSubscription}
                    >
                        Update Payment
                    </Button>
                </div>
            )}

            {/* Current Plan Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">
                                {dict.billing.current_plan}
                            </CardTitle>
                            <CardDescription>
                                {dict.billing.active_subscription}
                            </CardDescription>
                        </div>
                        <Badge
                            variant={isPaidPlan ? "default" : "secondary"}
                            className="text-sm px-3 py-1"
                        >
                            {isPaidPlan ? currentPlan?.name : dict.billing.no_active_plan}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-baseline gap-2">
                        {isPaidPlan ? (
                            <>
                                {currentPlan?.originalPrice && currentPlan.originalPrice > (currentPlan.price || 0) && (
                                    <span className="text-xl line-through text-gray-400">
                                        ${currentPlan.originalPrice}
                                    </span>
                                )}
                                <span className="text-4xl font-bold">
                                    ${currentPlan?.price}
                                </span>
                                <span className="text-muted-foreground">
                                    /{currentPlan?.interval === "year" ? "year" : "month"}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-4xl font-bold">{dict.billing.no_active_plan}</span>
                                <span className="text-muted-foreground text-sm">{dict.billing.choose_plan}</span>
                            </>
                        )}
                    </div>

                    {/* Usage Stats */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                            {dict.billing.usage_title}
                        </h3>
                        <UsageBar
                            label={dict.billing.email_requests}
                            stat={displayUsage.emailRequests}
                            icon={<Mail className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label={dict.billing.sms_requests}
                            stat={displayUsage.smsRequests}
                            icon={<MessageSquare className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label={dict.billing.link_requests}
                            stat={displayUsage.linkRequests}
                            icon={<LinkIcon className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label={dict.billing.ai_replies}
                            stat={displayUsage.aiReplies}
                            icon={<Bot className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label={dict.billing.locations}
                            stat={displayUsage.businesses}
                            icon={<MapPin className="h-3.5 w-3.5" />}
                        />
                    </div>
                </CardContent>
                {isPaidPlan && hasStripeCustomer && (
                    <CardFooter>
                        <Button
                            variant="outline"
                            onClick={handleManageSubscription}
                            disabled={loadingPortal}
                            className="gap-2"
                        >
                            {loadingPortal ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CreditCard className="h-4 w-4" />
                            )}
                            {dict.billing.manage_subscription}
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </CardFooter>
                )}

                {/* Upgrade CTA for free users */}
                {!isPaidPlan && (
                    <CardFooter className="bg-blue-50/50 border-t flex items-center gap-3 p-4">
                        <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                                {dict.billing.starter_msg}
                            </p>
                            <p className="text-xs text-blue-700">
                                {dict.billing.starter_price}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 gap-1 shrink-0"
                            onClick={() => {
                                document.getElementById("plan-picker")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            {dict.billing.upgrade} <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* ─── Plan Picker ─── */}
            <div id="plan-picker" className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/20 p-6 md:p-8">
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
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h2 className="text-xl font-semibold">
                            {isPaidPlan ? "Change Plan" : "Choose a Plan"}
                        </h2>

                        <div
                            className="inline-flex items-center gap-0.5 rounded-full border border-stone-300/80 bg-stone-200/90 p-1 shadow-inner dark:border-border/60 dark:bg-muted/80"
                            role="tablist"
                            aria-label="Billing interval"
                        >
                            <button
                                type="button"
                                role="tab"
                                aria-selected={interval === "month"}
                                onClick={() => setInterval("month")}
                                className={cn(
                                    "rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2",
                                    interval === "month"
                                        ? "bg-white text-stone-900 shadow-sm ring-1 ring-orange-500/40 dark:bg-card dark:text-foreground dark:ring-orange-500/50"
                                        : "text-stone-600 hover:text-stone-900 dark:text-muted-foreground dark:hover:text-foreground",
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
                                    "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2",
                                    interval === "year"
                                        ? "bg-white text-stone-900 shadow-sm ring-1 ring-orange-500/40 dark:bg-card dark:text-foreground dark:ring-orange-500/50"
                                        : "text-stone-600 hover:text-stone-900 dark:text-muted-foreground dark:hover:text-foreground",
                                )}
                            >
                                Yearly
                                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
                                    Save {yearlySavings > 0 ? `~${yearlySavings}%` : "more"}
                                </Badge>
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {displayPlans.map((plan) => {
                            const isCurrentPlan = currentPlan?.id === plan.id;
                            const isPro = plan.name === "Professional";

                            return (
                                <PricingCard.Card
                                    key={plan.id}
                                    className={cn(
                                        "relative flex w-full max-w-none flex-col h-full",
                                        isPro &&
                                            "ring-2 ring-orange-500/50 shadow-[0_20px_50px_-12px_rgba(249,115,22,0.25)]",
                                        isCurrentPlan && "ring-2 ring-primary/60",
                                    )}
                                >
                                    {isPro && (
                                        <div className="absolute -top-2 right-3 z-20">
                                            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md">
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    <PricingCard.Header className="relative z-10 mb-3 p-3">
                                        <PricingCard.Plan>
                                            <PricingCard.PlanName>
                                                {isPro ? (
                                                    <Crown className="text-orange-500" aria-hidden />
                                                ) : (
                                                    <Zap className="text-orange-500" aria-hidden />
                                                )}
                                                <span className="text-foreground">{plan.name}</span>
                                            </PricingCard.PlanName>
                                            <PricingCard.Badge>
                                                {isPro
                                                    ? "Multi-location"
                                                    : "Single location"}
                                            </PricingCard.Badge>
                                        </PricingCard.Plan>
                                        <PricingCard.Description className="mb-2 text-[11px] leading-tight">
                                            {isPro
                                                ? "For growing multi-location businesses."
                                                : "Perfect for single-location businesses."}
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
                                        {!isPaidPlan && (
                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3">
                                                7-day free trial included
                                            </p>
                                        )}
                                        {isCurrentPlan ? (
                                            <Button variant="outline" className="w-full font-semibold" disabled>
                                                Current Plan
                                            </Button>
                                        ) : (
                                            <Button
                                                className={cn(
                                                    "w-full font-semibold text-white",
                                                    "bg-gradient-to-b from-orange-500 to-orange-600 shadow-[0_10px_25px_rgba(255,115,0,0.3)]",
                                                    "hover:from-orange-600 hover:to-orange-700",
                                                )}
                                                onClick={() => handleSubscribe(plan.stripePriceId!)}
                                                disabled={
                                                    !plan.stripePriceId ||
                                                    loadingPlan === plan.stripePriceId
                                                }
                                            >
                                                {loadingPlan === plan.stripePriceId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : null}
                                                {isPaidPlan
                                                    ? `Switch to ${plan.name}`
                                                    : "Start Free Trial"}
                                            </Button>
                                        )}
                                    </PricingCard.Header>
                                    <PricingCard.Body className="space-y-3 p-2">
                                        <PricingCard.List className="space-y-2">
                                            {plan.features.map((feature) => (
                                                <PricingCard.ListItem
                                                    key={feature}
                                                    className="text-xs gap-2"
                                                >
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
                            <PricingCard.Card className="relative flex w-full max-w-none flex-col border-dashed">
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
                                        href="mailto:sales@zyenereviews.com?subject=Interested%20in%20Zyene%20Enterprise&body=Hi%2C%20I%27m%20interested%20in%20your%20Enterprise%20plan.%20Can%20I%20get%20more%20details%3F"
                                        className="block w-full"
                                    >
                                        <Button variant="outline" className="w-full gap-2 font-semibold">
                                            <Mail className="h-4 w-4" />
                                            Contact Sales
                                        </Button>
                                    </a>
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
        </div>
    );
}
