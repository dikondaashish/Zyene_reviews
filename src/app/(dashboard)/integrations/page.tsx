import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { GoogleIntegrationCard } from "@/components/integrations/google-card";
import { YelpIntegrationCard } from "@/components/integrations/yelp-card";
import { FacebookIntegrationCard } from "@/components/integrations/facebook-card";
import { PlaceholderCard } from "@/components/integrations/placeholder-card";
import { ZapierCard } from "@/components/integrations/zapier-card";
import { DeveloperApiCard } from "@/components/integrations/developer-api-card";
import { WidgetCard } from "@/components/integrations/widget-card";
import {
    Store,
    Utensils,
    CreditCard,
    Plug,
    Puzzle,
    Star,
    Zap,
    Code2,
    MonitorPlay
} from "lucide-react";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { planAllowsPublicReviewWidget } from "@/services/stripe/plans";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";

// ── Brand Icons ──

function TripAdvisorIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-chart-2"
            fill="currentColor"
        >
            <circle cx="6.5" cy="13.5" r="2" />
            <circle cx="17.5" cy="13.5" r="2" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
            <path d="M12 6c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z" />
        </svg>
    );
}

// ── Section Header Component ──

function SectionHeader({
    title,
    description,
    icon: Icon,
    badge,
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    badge?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                        {title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            {badge}
        </div>
    );
}

// ── Status Badge ──

function StatusBadge({
    count,
    label,
}: {
    count: number;
    label: string;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${count > 0
                ? "bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2"
                : "bg-muted text-muted-foreground"
                }`}
        >
            {count > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-chart-2/100 animate-pulse" />
            )}
            {count} {label}
        </span>
    );
}

// ── Page ──

export default async function IntegrationsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get active business from context
    const { business, organization } = await getActiveBusinessId();

    if (!business) {
        return (
            <BusinessContextEmptyState
                icon={Plug}
                title="Add a business to manage integrations"
                description="Connect Google, Yelp, Facebook, and more once you have at least one business location in Zyene."
            />
        );
    }

    const platforms = (business as any)?.review_platforms || [];

    const googlePlatform = platforms.find(
        (p: any) => p.platform === "google"
    );
    const yelpPlatform = platforms.find(
        (p: any) => p.platform === "yelp"
    );
    const facebookPlatform = platforms.find(
        (p: any) => p.platform === "facebook"
    );
    const apiPlatform = platforms.find(
        (p: any) => p.platform === "api"
    );
    const apiKey = apiPlatform?.external_id || null;

    const connectedPlatforms = [
        googlePlatform,
        yelpPlatform,
        facebookPlatform,
    ].filter((p) => !!p);
    const canUsePublicWidget = planAllowsPublicReviewWidget(
        (organization as any)?.plan ?? null,
        (organization as any)?.plan_status ?? null
    );
    const connectedCount = connectedPlatforms.length;

    /** User-facing total: `reviews` rows with `is_visible = true` only (excludes Google-deleted / hidden rows). */
    const visibleRollupMap = await fetchVisibleReviewRollupsByBusinessIds(supabase, [business.id]);
    const visibleRollup = visibleRollupMap.get(business.id);
    const totalReviews = visibleRollup?.totalVisible ?? 0;

    return (
        <div className="flex flex-1 flex-col gap-10 p-4 sm:p-6 lg:p-8">
            {/* ── Page Header ── */}
            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Integrations
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Connect your review platforms, POS systems, and
                        developer tools to consolidate reviews and automate
                        your workflow.
                    </p>
                </div>

                {/* Summary stats */}
                {connectedCount > 0 && (
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                            <Puzzle className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">
                                {`${connectedCount} platform${connectedCount !== 1 ? "s" : ""} connected`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                            <Star className="h-4 w-4 text-chart-4" />
                            <span className="text-sm font-medium">
                                {`${totalReviews.toLocaleString("en-US")} review${totalReviews !== 1 ? "s" : ""} in Zyene`}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Section 1: Review Platforms ── */}
            <section className="space-y-5">
                <SectionHeader
                    title="Review Platforms"
                    description="Monitor and respond to reviews across all major platforms"
                    icon={Star}
                    badge={
                        <StatusBadge
                            count={connectedCount}
                            label="connected"
                        />
                    }
                />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                    <GoogleIntegrationCard
                        platform={googlePlatform}
                        businessId={business.id}
                        businessName={business.name || ""}
                        dbGoogleSyncedRowCount={visibleRollup?.googleRowCount ?? 0}
                        dbVisibleGoogleReviewCount={visibleRollup?.googleVisibleCount ?? 0}
                        dbVisibleGoogleAverageRating={visibleRollup?.googleAverageRating ?? null}
                    />
                    <YelpIntegrationCard
                        platform={yelpPlatform}
                        businessId={business.id}
                        businessName={business.name || ""}
                        dbYelpSyncedRowCount={visibleRollup?.yelpRowCount ?? 0}
                        dbVisibleYelpReviewCount={visibleRollup?.yelpVisibleCount ?? 0}
                    />
                    <FacebookIntegrationCard
                        platform={facebookPlatform}
                        businessId={business.id}
                        businessName={business.name || ""}
                        dbFacebookSyncedRowCount={visibleRollup?.facebookRowCount ?? 0}
                        dbVisibleFacebookReviewCount={visibleRollup?.facebookVisibleCount ?? 0}
                        dbVisibleFacebookAverageRating={visibleRollup?.facebookAverageRating ?? null}
                    />
                    <PlaceholderCard
                        name="TripAdvisor"
                        description="Sync TripAdvisor reviews for hotels & businesses"
                        icon={<TripAdvisorIcon />}
                        accentColor="bg-chart-2/100"
                    />
                </div>
            </section>

            {/* ── Divider ── */}
            <hr className="border-border/50" />

            {/* ── Section 2: POS & Automation ── */}
            <section className="space-y-5">
                <SectionHeader
                    title="POS & Automation"
                    description="Trigger review requests automatically from payment and workflow tools"
                    icon={Zap}
                />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                    <PlaceholderCard
                        name="Square"
                        description="Auto-send review requests after Square payments"
                        icon={
                            <Store className="h-5 w-5 text-foreground/70" />
                        }
                        accentColor="bg-foreground/70"
                    />
                    <PlaceholderCard
                        name="Clover"
                        description="Trigger review requests from Clover transactions"
                        icon={
                            <CreditCard className="h-5 w-5 text-chart-2" />
                        }
                        accentColor="bg-chart-2/90"
                    />
                    <PlaceholderCard
                        name="Toast"
                        description="Connect Toast POS for automatic follow-ups"
                        icon={
                            <Utensils className="h-5 w-5 text-primary" />
                        }
                        accentColor="bg-primary"
                    />
                    <ZapierCard businessId={business.id} />
                </div>
            </section>

            {/* ── Divider ── */}
            <hr className="border-border/50" />

            {/* ── Section 3: Developer API ── */}
            <section className="space-y-5">
                <SectionHeader
                    title="Developer API"
                    description="Build custom integrations with our REST API"
                    icon={Code2}
                    badge={
                        apiKey ? (
                            <StatusBadge count={1} label="key active" />
                        ) : undefined
                    }
                />
                <div className="max-w-2xl">
                    <DeveloperApiCard
                        businessId={business.id}
                        apiKey={apiKey}
                    />
                </div>
            </section>

            {canUsePublicWidget && (
                <>
                    {/* ── Divider ── */}
                    <hr className="border-border/50" />

                    {/* ── Section 3: Website Elements ── */}
                    <section className="space-y-5">
                        <SectionHeader
                            title="Website Elements"
                            description="Embed your top reviews directly on your own website"
                            icon={MonitorPlay}
                        />
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                            <WidgetCard businessSlug={business.slug || ""} />
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
