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
    Check,
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
import { toast } from "sonner";
import type { Plan } from "@/lib/stripe/plans";

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
                <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
                <p className="text-muted-foreground">
                    Manage your subscription and billing
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
                                Current Plan
                            </CardTitle>
                            <CardDescription>
                                Your active subscription
                            </CardDescription>
                        </div>
                        <Badge
                            variant={isPaidPlan ? "default" : "secondary"}
                            className="text-sm px-3 py-1"
                        >
                            {currentPlanName}
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
                                <span className="text-4xl font-bold">No Active Plan</span>
                                <span className="text-muted-foreground text-sm">Choose a plan below to get started</span>
                            </>
                        )}
                    </div>

                    {/* Usage Stats */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                            This Month&apos;s Usage
                        </h3>
                        <UsageBar
                            label="Email Requests"
                            stat={usage.emailRequests}
                            icon={<Mail className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label="SMS Requests"
                            stat={usage.smsRequests}
                            icon={<MessageSquare className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label="Link Requests"
                            stat={usage.linkRequests}
                            icon={<LinkIcon className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label="AI Replies"
                            stat={usage.aiReplies}
                            icon={<Bot className="h-3.5 w-3.5" />}
                        />
                        <UsageBar
                            label="Locations"
                            stat={usage.businesses}
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
                            Manage Subscription
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
                                Get started with Zyene Reviews
                            </p>
                            <p className="text-xs text-blue-700">
                                Choose a plan below — starting at ${monthlyStarterPrice}/month
                            </p>
                        </div>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 gap-1 shrink-0"
                            onClick={() => {
                                document.getElementById("plan-picker")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            Upgrade <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* ─── Plan Picker ─── */}
            <div id="plan-picker">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                        {isPaidPlan ? "Change Plan" : "Choose a Plan"}
                    </h2>

                    {/* Monthly / Yearly Toggle */}
                    <div className="bg-slate-100 p-1 rounded-lg inline-flex items-center">
                        <button
                            onClick={() => setInterval("month")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${interval === "month"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setInterval("year")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${interval === "year"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            Yearly
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                                Save {yearlySavings > 0 ? `~${yearlySavings}%` : "more"}
                            </Badge>
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Starter / Professional cards */}
                    {displayPlans.map((plan) => {
                        const isCurrentPlan = currentPlan?.id === plan.id;
                        const isPro = plan.name === "Professional";

                        return (
                            <Card
                                key={plan.id}
                                className={`relative flex flex-col ${isPro
                                    ? "border-blue-500 border-2 shadow-lg"
                                    : "border-slate-200"
                                    }`}
                            >
                                {isPro && (
                                    <div className="absolute -top-3 right-4">
                                        <Badge className="bg-blue-600 text-white">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {isPro ? (
                                            <Crown className="h-5 w-5 text-blue-500" />
                                        ) : (
                                            <Zap className="h-5 w-5 text-blue-500" />
                                        )}
                                        {plan.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {isPro
                                            ? "For growing multi-location businesses"
                                            : "Perfect for single-location businesses"}
                                    </CardDescription>
                                    <div className="flex items-baseline gap-2 pt-2">
                                        {plan.originalPrice && plan.originalPrice > (plan.price || 0) && (
                                            <span className="text-lg line-through text-gray-400">
                                                ${plan.originalPrice}
                                            </span>
                                        )}
                                        <span className="text-3xl font-bold">
                                            ${plan.price}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {intervalLabel}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ul className="space-y-2.5 text-sm">
                                        {plan.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start gap-2"
                                            >
                                                <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {isCurrentPlan ? (
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            disabled
                                        >
                                            Current Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            className={`w-full ${isPro
                                                ? "bg-blue-600 hover:bg-blue-700"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                handleSubscribe(plan.stripePriceId!)
                                            }
                                            disabled={
                                                !plan.stripePriceId ||
                                                loadingPlan === plan.stripePriceId
                                            }
                                        >
                                            {loadingPlan === plan.stripePriceId ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            {isPaidPlan
                                                ? `Switch to ${plan.name}`
                                                : `Get ${plan.name}`}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}

                    {/* Enterprise Card */}
                    {enterprisePlan && (
                        <Card className="relative flex flex-col border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-slate-600" />
                                    Enterprise
                                </CardTitle>
                                <CardDescription>
                                    For large organizations with custom needs
                                </CardDescription>
                                <div className="pt-2">
                                    <span className="text-3xl font-bold">
                                        Custom
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-2.5 text-sm">
                                    {enterprisePlan.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-2"
                                        >
                                            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <a
                                    href="mailto:sales@zyenereviews.com?subject=Interested%20in%20Zyene%20Enterprise&body=Hi%2C%20I%27m%20interested%20in%20your%20Enterprise%20plan.%20Can%20I%20get%20more%20details%3F"
                                    className="w-full"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Contact Sales
                                    </Button>
                                </a>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
