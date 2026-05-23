import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    MessageSquare,
    Star,
    ArrowRight,
    TrendingUp,
    ThumbsUp,
    Target,
    Send,
    Calendar,
    Eye,
    Phone,
    Navigation2,
    MousePointerClick,
    HelpCircle,
    Link2,
    ListChecks,
    BedDouble,
} from "lucide-react";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { MilestoneCelebration } from "@/components/dashboard/milestone-celebration";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { Progress } from "@/components/ui/progress";
import { SyncButton } from "@/components/dashboard/sync-button";
import { GettingStartedBanner } from "@/components/dashboard/getting-started-banner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProStatCard } from "@/components/dashboard/pro-stat-card";
import { SmartInsightsCard } from "@/components/dashboard/smart-insights-card";
import {
    DashboardAnimatedReviewCardsLazy,
    DashboardQrCodeLazy,
    DashboardRatingDistributionChartLazy,
    DashboardReviewTrendChartLazy,
} from "@/components/dashboard/dashboard-ssr-false-blocks";
import { mapAttentionRows } from "./helpers";
import type { DashboardViewProps } from "./types";

export function DashboardView({
    user,
    dict,
    business,
    organization,
    useDemoData,
    isGoogleConnected,
    customerCount,
    notificationsConfigured,
    requestsThisMonth,
    displayTotalReviews,
    displayAverageRating,
    responseRate,
    pendingCount,
    totalReviewsTrend,
    averageRatingTrend,
    responseRateLabel,
    showUnansweredQaCard,
    unansweredQaCount,
    brokenPlaceLinksCount,
    googleProfileHealthScore,
    showLodgingCard,
    googleLodgingHealthScore,
    googleLodgingApplicable,
    googleHealthMetricsGridClass,
    googlePerf,
    positivePercent,
    negativePercent,
    hasSentimentData,
    engagementRate,
    hasEngagementData,
    maxRequestsPerMonth,
    isPaidPlan,
    newReviews30d,
    trendData,
    ratingData,
    recentReviews,
    attentionReviews,
    planAllowsAiReplies,
}: DashboardViewProps) {
    return (
        <div className="flex min-w-0 w-full flex-col gap-6 overflow-x-hidden">
            <MilestoneCelebration currentCount={displayTotalReviews} type="reviews" isDemo={useDemoData} scopeKey={business.id || "default"} />
            
            {/* Demo Mode Banner */}
            {useDemoData && <DemoModeBanner className="mb-2" />}

            {/* Header */}
            <div className="mb-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-0.5">
                    <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-muted-foreground sm:text-[11px]">
                        WELCOME BACK, {user.user_metadata?.full_name?.toUpperCase() || user.user_metadata?.first_name?.toUpperCase() || user.email?.split('@')[0].toUpperCase() || "OWNER"}
                    </p>
                    <h1 className="break-words pb-1 font-serif text-3xl text-foreground lg:text-4xl" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
                        {business.name || dict.dashboard.title}
                    </h1>
                </div>
                <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:w-auto lg:shrink-0 lg:justify-end">
                    <Link href="/requests" className="min-w-0">
                        <Button variant="outline" className="h-[38px] w-full gap-2 rounded-full border-border/60 bg-background px-4 font-medium text-[13px] hover:bg-muted lg:w-auto">
                            <Send className="h-3.5 w-3.5 shrink-0" />
                            <span className="md:hidden">Request</span>
                            <span className="hidden md:inline">Request review</span>
                        </Button>
                    </Link>
                    <SyncButton 
                        businessId={business.id} 
                        variant="outline"
                        syncShortLabel="Sync"
                        className="h-[38px] gap-2 rounded-full border-border/60 bg-background px-4 font-medium text-[13px] text-foreground hover:bg-muted"
                    />
                </div>
            </div>
            
            {/* Getting Started Banner - Persists until all tasks are done or dismissed */}
            {(!organization?.onboarding_completed || !isGoogleConnected || customerCount === 0 || !notificationsConfigured) && (
                <div className="mt-2">
                    <GettingStartedBanner
                        googleConnected={isGoogleConnected}
                        customerCount={customerCount}
                        requestSent={requestsThisMonth > 0}
                        notificationsConfigured={notificationsConfigured}
                    />
                </div>
            )}

            {/* Smart Review Insights & Customer Portal Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 min-w-0 flex flex-col">
                    <SmartInsightsCard businessName={business.name || ""} />
                </div>
                <div className="lg:col-span-2 min-w-0 flex flex-col">
                    {business.slug ? (
                        <div className="h-full">
                            <DashboardQrCodeLazy
                                businessId={business.id}
                                businessSlug={business.slug}
                                businessName={business.name || "Business"}
                                businessLogoUrl={business.logo_url ?? null}
                                brandColor={business.brand_color ?? null}
                                reviewPageBackgroundColor={business.review_page_background_color ?? null}
                            />
                        </div>
                    ) : (
                        <div className="h-full rounded-2xl bg-[rgb(43,58,42)] p-6 text-white/50 flex flex-col justify-center items-center">
                            No active business configuration found.
                        </div>
                    )}
                </div>
            </div>



            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-tour-target="tour-stats">
                <ProStatCard
                    title={dict.dashboard.total_reviews}
                    value={displayTotalReviews}
                    iconName="reviews"
                    description={!isGoogleConnected ? dict.dashboard.connect_google : dict.dashboard.from_google}
                    trend={totalReviewsTrend}
                    trendLabel={(dict.dashboard as Record<string, string>).vs_last_year || "vs last year"}
                    delay={0.1}
                />
                <ProStatCard
                    title={dict.dashboard.average_rating}
                    value={displayAverageRating}
                    iconName="rating"
                    precision={1}
                    description={dict.dashboard.based_on_google}
                    trend={averageRatingTrend}
                    trendFormat="star_delta"
                    trendLabel={
                        (dict.dashboard as Record<string, string>).vs_last_year || "vs last year"
                    }
                    delay={0.2}
                />
                <ProStatCard
                    title={dict.dashboard.response_rate}
                    value={responseRate}
                    iconName="response"
                    suffix="%"
                    precision={1}
                    description={responseRateLabel}
                    delay={0.3}
                />
                <ProStatCard
                    title={dict.dashboard.pending_reviews}
                    value={pendingCount}
                    iconName="pending"
                    description={pendingCount === 0 ? dict.dashboard.all_caught_up : dict.dashboard.awaiting_response}
                    className={pendingCount === 0 ? "border-chart-2/30 bg-chart-2/5" : ""}
                    delay={0.4}
                />
            </div>

            {(isGoogleConnected || useDemoData) && (
                <div className={`grid gap-4 sm:grid-cols-2 ${googleHealthMetricsGridClass}`}>
                    {showUnansweredQaCard && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{dict.dashboard.unanswered_qa}</CardTitle>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl font-bold ${
                                        unansweredQaCount === 0 ? "text-chart-2" : "text-chart-4"
                                    }`}
                                >
                                    {unansweredQaCount}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {dict.dashboard.qa_desc}
                                </p>
                                <Link href="/questions" className="mt-3 inline-block">
                                    <Button variant="outline" size="sm">
                                        {dict.dashboard.manage_qa}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{dict.dashboard.broken_links}</CardTitle>
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${
                                    brokenPlaceLinksCount === 0 ? "text-chart-2" : "text-destructive"
                                }`}
                            >
                                {brokenPlaceLinksCount}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {dict.dashboard.links_desc}
                            </p>
                            <Link href="/settings/business-information" className="mt-3 inline-block">
                                <Button variant="outline" size="sm">
                                    {dict.dashboard.manage_links}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{dict.dashboard.listing_completeness}</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${
                                    googleProfileHealthScore === null
                                        ? "text-muted-foreground"
                                        : googleProfileHealthScore >= 80
                                          ? "text-chart-2"
                                          : googleProfileHealthScore >= 40
                                            ? "text-chart-4"
                                            : "text-destructive"
                                }`}
                            >
                                {googleProfileHealthScore !== null ? `${googleProfileHealthScore}` : "—"}
                                {googleProfileHealthScore !== null && (
                                    <span className="text-lg font-semibold text-muted-foreground">/100</span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {dict.dashboard.listing_desc}
                            </p>
                            <Link href="/settings/business-information" className="mt-3 inline-block">
                                <Button variant="outline" size="sm">
                                    {dict.dashboard.edit_listing}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    {showLodgingCard && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{dict.dashboard.lodging_completeness}</CardTitle>
                                <BedDouble className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl font-bold ${
                                        googleLodgingHealthScore === null
                                            ? "text-muted-foreground"
                                            : googleLodgingHealthScore >= 80
                                              ? "text-chart-2"
                                              : googleLodgingHealthScore >= 40
                                                ? "text-chart-4"
                                                : "text-destructive"
                                    }`}
                                >
                                    {googleLodgingHealthScore !== null ? `${googleLodgingHealthScore}` : "—"}
                                    {googleLodgingHealthScore !== null && (
                                        <span className="text-lg font-semibold text-muted-foreground">/100</span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {googleLodgingHealthScore === null && googleLodgingApplicable === null
                                        ? dict.dashboard.lodging_desc_empty
                                        : dict.dashboard.lodging_desc}
                                </p>
                                <Link href="/settings/business-information" className="mt-3 inline-block">
                                    <Button variant="outline" size="sm">
                                        {dict.dashboard.lodging_details}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Google Business Profile performance (last 12 months) */}
            {(useDemoData || isGoogleConnected) && googlePerf && (
                <div className="space-y-2">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Google listing performance
                        </h2>
                        <span className="shrink-0 text-xs text-muted-foreground">Last 12 months</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Profile views</CardTitle>
                                <Eye className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {googlePerf.profileViews.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Search + Maps impressions
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Phone calls</CardTitle>
                                <Phone className="h-4 w-4 text-chart-2" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {googlePerf.callClicks.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Call button taps</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Direction requests</CardTitle>
                                <Navigation2 className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {googlePerf.directionRequests.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Route opens</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{dict.dashboard.website_clicks}</CardTitle>
                                <MousePointerClick className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {googlePerf.websiteClicks.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{dict.dashboard.website_clicks_desc}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Extended Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Positive Experience % */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dict.dashboard.positive_experience}
                        </CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${!hasSentimentData ? "text-muted-foreground" :
                            positivePercent > 60 ? "text-chart-2" :
                                positivePercent >= 40 ? "text-chart-4" :
                                    "text-destructive"
                            }`}>
                            {hasSentimentData ? `${positivePercent.toFixed(0)}%` : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {hasSentimentData
                                ? `${negativePercent.toFixed(0)}% ${dict.dashboard.negative_mixed}`
                                : dict.dashboard.no_sentiment_data}
                        </p>
                    </CardContent>
                </Card>

                {/* Engagement Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dict.dashboard.engagement_rate}
                        </CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${!hasEngagementData ? "text-muted-foreground" : ""
                            }`}>
                            {hasEngagementData ? `${engagementRate.toFixed(1)}%` : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {hasEngagementData
                                ? dict.dashboard.engagement_desc
                                : dict.dashboard.no_engagement_data}
                        </p>
                    </CardContent>
                </Card>

                {/* Request Usage */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dict.dashboard.usage_title}
                        </CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className={`text-2xl font-bold ${maxRequestsPerMonth > 0 && (requestsThisMonth / maxRequestsPerMonth) > 0.95 ? "text-destructive" :
                                maxRequestsPerMonth > 0 && (requestsThisMonth / maxRequestsPerMonth) > 0.8 ? "text-chart-4" : ""
                                }`}>
                                {requestsThisMonth} / {maxRequestsPerMonth}
                            </div>
                            {!isPaidPlan && (
                                <Link href="/settings/billing" className="w-full shrink-0 lg:w-auto">
                                    <Button variant="outline" size="sm" className="h-7 w-full text-xs border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 lg:w-auto">
                                        <ArrowRight className="mr-1 h-3 w-3" />
                                        {dict.dashboard.upgrade_prompt || "Upgrade"}
                                    </Button>
                                </Link>
                            )}
                        </div>
                        <Progress
                            value={maxRequestsPerMonth > 0 ? Math.min((requestsThisMonth / maxRequestsPerMonth) * 100, 100) : 0}
                            className="mt-2 h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {dict.dashboard.usage_desc}
                        </p>
                    </CardContent>
                </Card>

                {/* New Reviews (30 days) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dict.dashboard.new_reviews_30d}
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {newReviews30d}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {dict.dashboard.new_reviews_30d_desc}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-col gap-2 pb-0 sm:flex-row sm:items-start sm:justify-between lg:items-center">
                        <div className="min-w-0">
                            <CardTitle className="text-base font-bold text-foreground">
                                Review volume
                            </CardTitle>
                            <CardDescription className="mt-0.5 text-[13px] text-muted-foreground/80">
                                Last 30 days &middot; hover any day for detail
                            </CardDescription>
                        </div>
                        {totalReviewsTrend !== undefined && totalReviewsTrend !== 0 && (
                            <div className={`flex shrink-0 items-center gap-1 self-start rounded-md px-2 py-1 text-xs font-semibold sm:self-auto ${totalReviewsTrend > 0 ? "bg-[rgb(229,238,221)] text-[rgb(62,95,46)]" : "bg-destructive/10 text-destructive"}`}>
                                {totalReviewsTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                                <span className="max-sm:sr-only">{Math.abs(totalReviewsTrend)}% vs 30d prior</span>
                                <span className="sm:hidden">{Math.abs(totalReviewsTrend)}%</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 pt-6 pb-2 px-0 pl-1">
                        <DashboardReviewTrendChartLazy data={trendData} />
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader className="flex flex-col gap-2 pb-0 sm:flex-row sm:items-start sm:justify-between lg:items-center">
                        <div className="min-w-0">
                            <CardTitle className="text-base font-bold text-foreground">
                                Star distribution
                            </CardTitle>
                            <CardDescription className="mt-0.5 text-[13px] text-muted-foreground/80">
                                All-time &middot; {displayTotalReviews} reviews
                            </CardDescription>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 text-xl font-medium tracking-tight">
                            {displayAverageRating.toFixed(1)}
                            <Star className="h-4 w-4 fill-chart-4 text-chart-4" strokeWidth={1} />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-6 pb-6">
                        <DashboardRatingDistributionChartLazy data={ratingData} />
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Recent Reviews + Needs Attention */}
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
                {/* Spotlight Reviews */}
                <div className="min-w-0 flex flex-col overflow-hidden" data-tour-target="tour-recent-reviews">
                    {recentReviews.length > 0 ? (
                        <div className="flex-1 flex flex-col">
                            <DashboardAnimatedReviewCardsLazy
                                reviews={recentReviews.slice(0, 15).map((r) => ({
                                    id: String(r.id),
                                    name: r.author_name || "Anonymous",
                                    avatar: r.author_avatar_url || "",
                                    text: r.text || "No review content provided.",
                                    rating:
                                        typeof r.rating === "number"
                                            ? r.rating
                                            : Number(r.rating) || 0,
                                    reviewedAt: r.review_date ?? new Date().toISOString(),
                                    platform: r.platform ?? "google",
                                    sentiment: r.sentiment ?? null,
                                }))}
                                labels={{
                                    hint: dict.dashboard.review_spotlight_hint,
                                    prev: dict.dashboard.review_spotlight_prev,
                                    next: dict.dashboard.review_spotlight_next,
                                    viewInReviews: dict.dashboard.review_spotlight_view_inbox,
                                }}
                                shellTitle={dict.dashboard.review_spotlight_title}
                                shellSubtitle={dict.dashboard.review_spotlight_desc}
                                manageAllHref="/reviews"
                                manageAllLabel={dict.dashboard.review_spotlight_manage_all}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 py-20">
                            <MessageSquare className="mb-4 h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">
                                {dict.dashboard.review_spotlight_empty}
                            </p>
                        </div>
                    )}
                </div>

                {/* Needs Attention */}
                <div className="min-w-0 overflow-hidden" data-tour-target="tour-needs-attention">
                    <NeedsAttention
                        reviews={mapAttentionRows(
                            attentionReviews.filter(
                                (r) => (r.response_status ?? "pending") === "pending",
                            ),
                        )}
                        viewAllHref="/reviews?status=needs_response&sort=lowest"
                        planAllowsAiReplies={planAllowsAiReplies}
                        isDemo={useDemoData}
                        copy={{
                            title: dict.dashboard.needs_attention_title,
                            subtitleZero: dict.dashboard.needs_attention_subtitle_zero,
                            subtitleOne: dict.dashboard.needs_attention_subtitle_one,
                            subtitleMany: dict.dashboard.needs_attention_subtitle_many,
                            viewAll: dict.dashboard.needs_attention_view_all,
                            yourReplyLabel:
                                dict.dashboard.needs_attention_your_reply_label,
                            sentToGoogle: dict.dashboard.needs_attention_sent_saved,
                            draftWithAi: dict.dashboard.needs_attention_draft_ai,
                            drafting: dict.dashboard.needs_attention_drafting,
                            writeYourOwn: dict.dashboard.needs_attention_write_own,
                            regenerate: dict.dashboard.needs_attention_regenerate,
                            adjustTone: dict.dashboard.needs_attention_adjust_tone,
                            toneProfessional:
                                dict.dashboard.needs_attention_tone_professional,
                            toneFriendly: dict.dashboard.needs_attention_tone_friendly,
                            toneConcise: dict.dashboard.needs_attention_tone_concise,
                            sendReply: dict.dashboard.needs_attention_send,
                            sent: dict.dashboard.needs_attention_sent,
                            urgencyLabel: dict.dashboard.needs_attention_urgency,
                            emptyTitle: dict.dashboard.needs_attention_empty_title,
                            emptyDescription:
                                dict.dashboard.needs_attention_empty_desc,
                            demoSendHint: dict.dashboard.needs_attention_demo_send_hint,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
