"use client";

import { useState } from "react";
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
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { Plan } from "@/lib/stripe/plans";

interface UsageStat {
    used: number;
    max: number; // -1 = unlimited
}

interface BillingClientProps {
    currentPlanKey: string;
    currentPlan: Plan;
    planStatus: string;
    hasStripeCustomer: boolean;
    usage: {
        reviewRequests: UsageStat;
        aiReplies: UsageStat;
        businesses: UsageStat;
    };
    plans: Record<string, Plan>;
}

function UsageBar({ label, stat }: { label: string; stat: UsageStat }) {
    const isUnlimited = stat.max === -1;
    const percentage = isUnlimited ? 0 : Math.min((stat.used / stat.max) * 100, 100);
    const isNearLimit = !isUnlimited && percentage >= 80;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">
                    {stat.used}
                    {isUnlimited ? " used" : ` / ${stat.max}`}
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

export function BillingClient({
    currentPlanKey,
    currentPlan,
    planStatus,
    hasStripeCustomer,
    usage,
    plans,
}: BillingClientProps) {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [loadingPortal, setLoadingPortal] = useState(false);

    const isPaidPlan = currentPlanKey !== "free";

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
            if (data.url) window.location.href = data.url;
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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
                <p className="text-muted-foreground">
                    Manage your subscription and billing
                </p>
            </div>

            {/* Current Plan Status */}
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
                            {currentPlan.name}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">
                            ${currentPlan.price}
                        </span>
                        {currentPlan.price > 0 && (
                            <span className="text-muted-foreground">/month</span>
                        )}
                    </div>

                    {/* Usage Stats */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                            This Month's Usage
                        </h3>
                        <UsageBar
                            label="Review Requests"
                            stat={usage.reviewRequests}
                        />
                        <UsageBar
                            label="AI Replies"
                            stat={usage.aiReplies}
                        />
                        <UsageBar
                            label="Businesses"
                            stat={usage.businesses}
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
            </Card>

            {/* Upgrade Cards (show for free users OR for starter wanting to upgrade) */}
            {(currentPlanKey === "free" || currentPlanKey === "starter") && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        {currentPlanKey === "free"
                            ? "Upgrade Your Plan"
                            : "Upgrade to Growth"}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Starter Plan */}
                        {currentPlanKey === "free" && (
                            <Card className="relative border-blue-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-500" />
                                        Starter
                                    </CardTitle>
                                    <CardDescription>
                                        Perfect for small businesses
                                    </CardDescription>
                                    <div className="flex items-baseline gap-1 pt-2">
                                        <span className="text-3xl font-bold">
                                            $39
                                        </span>
                                        <span className="text-muted-foreground">
                                            /month
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2.5 text-sm">
                                        {[
                                            "1 business location",
                                            "100 review requests/month",
                                            "30 AI-generated replies/month",
                                            "SMS & Email alerts",
                                            "Google, Yelp & Facebook",
                                            "Priority support",
                                        ].map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-center gap-2"
                                            >
                                                <Check className="h-4 w-4 text-green-500 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            handleSubscribe(
                                                plans.starter.stripePriceId!
                                            )
                                        }
                                        disabled={
                                            loadingPlan ===
                                            plans.starter.stripePriceId
                                        }
                                    >
                                        {loadingPlan ===
                                            plans.starter.stripePriceId ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : null}
                                        Subscribe to Starter
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {/* Growth Plan */}
                        <Card className="relative border-purple-200">
                            <div className="absolute -top-3 right-4">
                                <Badge className="bg-purple-600 text-white">
                                    Most Popular
                                </Badge>
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-purple-500" />
                                    Growth
                                </CardTitle>
                                <CardDescription>
                                    For growing businesses
                                </CardDescription>
                                <div className="flex items-baseline gap-1 pt-2">
                                    <span className="text-3xl font-bold">
                                        $79
                                    </span>
                                    <span className="text-muted-foreground">
                                        /month
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2.5 text-sm">
                                    {[
                                        "Up to 3 business locations",
                                        "Unlimited review requests",
                                        "Unlimited AI replies",
                                        "SMS & Email alerts",
                                        "Google, Yelp & Facebook",
                                        "Priority support",
                                        "Custom branding",
                                    ].map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-center gap-2"
                                        >
                                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                    onClick={() =>
                                        handleSubscribe(
                                            plans.growth.stripePriceId!
                                        )
                                    }
                                    disabled={
                                        loadingPlan ===
                                        plans.growth.stripePriceId
                                    }
                                >
                                    {loadingPlan ===
                                        plans.growth.stripePriceId ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    {currentPlanKey === "starter"
                                        ? "Upgrade to Growth"
                                        : "Subscribe to Growth"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
