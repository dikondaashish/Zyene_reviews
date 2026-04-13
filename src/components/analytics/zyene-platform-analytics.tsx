"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/index";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell,
} from "recharts";
import {
    MousePointer2,
    TrendingUp,
    Star,
    AlertTriangle,
    Send,
    Mail,
    MessageSquare,
    Link2,
    ChevronRight,
    Hash,
    MessageCircle,
    User,
    Clock,
    ArrowDownRight,
    Sparkles,
    Eye,
    CheckCircle2,
    XCircle,
    Zap,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ReviewRequest {
    id: string;
    status: string;
    channel: string;
    trigger_source: string;
    created_at: string;
    sent_at: string | null;
    delivered_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    completed_at: string | null;
    rating_given: number | null;
    tags_selected: string[] | null;
    review_left: boolean;
    customer_name: string | null;
    customer_email: string | null;
    follow_up_sent_at: string | null;
    ai_review_text: string | null;
}

interface PrivateFeedback {
    id: string;
    rating: number;
    content: string | null;
    created_at: string;
}

interface ZyenePlatformAnalyticsProps {
    requests: ReviewRequest[];
    previousRequests: ReviewRequest[];
    privateFeedback: PrivateFeedback[];
    dateRange: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pct(num: number, den: number): number {
    return den > 0 ? Math.round((num / den) * 100) : 0;
}

function getDelta(curr: number, prev: number): number {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ZyenePlatformAnalytics({
    requests,
    previousRequests,
    privateFeedback,
    dateRange,
}: ZyenePlatformAnalyticsProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // ── Funnel Aggregations ────────────────────────────────────────────
    const totalSent = requests.filter((r) => r.sent_at).length;
    const totalDelivered = requests.filter((r) => r.delivered_at).length;
    const totalOpened = requests.filter((r) => r.opened_at).length;
    const totalClicked = requests.filter((r) => r.clicked_at).length;
    const totalCompleted = requests.filter(
        (r) => r.status === "completed" || r.status === "feedback_left"
    ).length;
    const totalReviewLeft = requests.filter((r) => r.review_left).length;

    // Previous period for deltas
    const prevSent = previousRequests.filter((r) => r.sent_at).length;
    const prevClicked = previousRequests.filter((r) => r.clicked_at).length;
    const prevCompleted = previousRequests.filter(
        (r) => r.status === "completed" || r.status === "feedback_left"
    ).length;

    // ── Key Metrics ────────────────────────────────────────────────────
    const ratingsGiven = requests.filter((r) => r.rating_given !== null);
    const avgRating =
        ratingsGiven.length > 0
            ? ratingsGiven.reduce((acc, r) => acc + (r.rating_given || 0), 0) / ratingsGiven.length
            : 0;
    const lowRatings = requests.filter((r) => r.rating_given !== null && r.rating_given <= 3);
    const clickRate = pct(totalClicked, totalSent);
    const conversionRate = pct(totalCompleted, totalClicked);

    const prevRatingsGiven = previousRequests.filter((r) => r.rating_given !== null);
    const prevAvgRating =
        prevRatingsGiven.length > 0
            ? prevRatingsGiven.reduce((acc, r) => acc + (r.rating_given || 0), 0) / prevRatingsGiven.length
            : 0;
    const prevLowRatings = previousRequests.filter((r) => r.rating_given !== null && r.rating_given <= 3);

    // ── Channel Breakdown ──────────────────────────────────────────────
    const channels = ["email", "sms", "link"] as const;
    const channelData = channels.map((ch) => {
        const chReqs = requests.filter((r) => r.channel === ch);
        const sent = chReqs.filter((r) => r.sent_at).length;
        const clicked = chReqs.filter((r) => r.clicked_at).length;
        const completed = chReqs.filter(
            (r) => r.status === "completed" || r.status === "feedback_left"
        ).length;
        return {
            channel: ch === "sms" ? "SMS" : ch === "email" ? "Email" : "Link",
            sent,
            clicked,
            completed,
            clickRate: pct(clicked, sent),
            conversionRate: pct(completed, clicked),
        };
    });

    // ── Rating Distribution ────────────────────────────────────────────
    const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
        star: `${star}★`,
        value: star,
        count: requests.filter((r) => r.rating_given === star).length,
    }));
    const maxRatingCount = Math.max(...ratingDist.map((d) => d.count), 1);
    const ratingColors: Record<number, string> = {
        5: "#10b981",
        4: "#34d399",
        3: "#f59e0b",
        2: "var(--primary)",
        1: "#ef4444",
    };

    // ── Popular Tags ───────────────────────────────────────────────────
    const tagMap = new Map<string, number>();
    requests.forEach((r) => {
        if (r.tags_selected) {
            r.tags_selected.forEach((tag) => {
                const clean = tag.replace(/^[^\s]+\s/, ""); // strip emoji prefix
                tagMap.set(clean, (tagMap.get(clean) || 0) + 1);
            });
        }
    });
    const popularTags = Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);
    const maxTagCount = Math.max(...popularTags.map((t) => t.count), 1);

    // ── Daily Timeline ─────────────────────────────────────────────────
    const dailyMap = new Map<
        string,
        { date: string; sent: number; clicked: number; completed: number }
    >();
    requests.forEach((r) => {
        const date = new Date(r.created_at).toISOString().split("T")[0];
        if (!dailyMap.has(date))
            dailyMap.set(date, { date, sent: 0, clicked: 0, completed: 0 });
        const entry = dailyMap.get(date)!;
        if (r.sent_at) entry.sent++;
        if (r.clicked_at) entry.clicked++;
        if (r.status === "completed" || r.status === "feedback_left") entry.completed++;
    });
    const dailyData = Array.from(dailyMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    // ── Low Rating Timeline ────────────────────────────────────────────
    const lowRatingEntries = lowRatings
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

    // ── Funnel Steps ───────────────────────────────────────────────────
    const funnelSteps = [
        { label: "Sent", count: totalSent, icon: Send, color: "var(--primary)" },
        { label: "Delivered", count: totalDelivered, icon: CheckCircle2, color: "var(--primary)" },
        { label: "Opened", count: totalOpened, icon: Eye, color: "#ff7a45" },
        { label: "Link Clicked", count: totalClicked, icon: MousePointer2, color: "#ff7a45" },
        { label: "Completed", count: totalCompleted, icon: Sparkles, color: "#c2410c" },
        { label: "Posted to Google", count: totalReviewLeft, icon: Star, color: "#10b981" },
    ];

    if (!mounted) return <div className="h-[600px] w-full" />;

    // ── Render ──────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-8 w-full">
            {/* ──────────── 1. REQUEST FUNNEL ──────────── */}
            <Card className="bg-card/60 border-border/50 backdrop-blur-md overflow-hidden">
                <CardHeader>
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            Review Request Funnel
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">
                            Track every step from send to Google review — {dateRange}
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {funnelSteps.map((step, idx) => {
                            const dropOff =
                                idx > 0 && funnelSteps[idx - 1].count > 0
                                    ? pct(step.count, funnelSteps[idx - 1].count)
                                    : 100;
                            return (
                                <motion.div
                                    key={step.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                >
                                    <div className="relative flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 transition-all group">
                                        <div
                                            className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors"
                                            style={{
                                                backgroundColor: `${step.color}15`,
                                            }}
                                        >
                                            <step.icon
                                                className="h-5 w-5"
                                                style={{ color: step.color }}
                                            />
                                        </div>
                                        <span className="text-2xl font-black tracking-tight">
                                            {step.count.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            {step.label}
                                        </span>
                                        {idx > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "text-[9px] font-bold px-1.5 py-0",
                                                    dropOff >= 50
                                                        ? "bg-emerald-500/10 text-emerald-600"
                                                        : dropOff >= 20
                                                        ? "bg-amber-500/10 text-amber-600"
                                                        : "bg-rose-500/10 text-rose-600"
                                                )}
                                            >
                                                {dropOff}%
                                            </Badge>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Funnel flow bar */}
                    <div className="mt-6 h-3 w-full bg-muted/30 rounded-full overflow-hidden flex">
                        {funnelSteps.map((step, idx) => {
                            const widthPct = totalSent > 0 ? (step.count / totalSent) * 100 : 0;
                            return (
                                <motion.div
                                    key={step.label}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${widthPct}%` }}
                                    transition={{ duration: 1, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
                                    className="h-full first:rounded-l-full last:rounded-r-full"
                                    style={{
                                        backgroundColor: step.color,
                                        opacity: 1 - idx * 0.12,
                                    }}
                                />
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* ──────────── 2. KEY METRICS ROW ──────────── */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: "Link Opens",
                        value: totalClicked,
                        desc: `${clickRate}% of sent requests`,
                        delta: getDelta(totalClicked, prevClicked),
                        icon: MousePointer2,
                    },
                    {
                        title: "Conversion Rate",
                        value: `${conversionRate}%`,
                        desc: `${totalCompleted} completed of ${totalClicked} clicks`,
                        delta: getDelta(
                            pct(totalCompleted, totalClicked),
                            pct(prevCompleted, prevClicked)
                        ),
                        icon: TrendingUp,
                    },
                    {
                        title: "Avg Rating Given",
                        value: avgRating > 0 ? avgRating.toFixed(1) : "—",
                        desc: `From ${ratingsGiven.length} ratings`,
                        delta: getDelta(avgRating, prevAvgRating),
                        icon: Star,
                    },
                    {
                        title: "Low Ratings (≤3★)",
                        value: lowRatings.length,
                        desc: "Intercepted before Google",
                        delta: getDelta(lowRatings.length, prevLowRatings.length),
                        icon: AlertTriangle,
                        invertTrend: true,
                    },
                ].map((metric, idx) => {
                    const isPositive = metric.delta > 0;
                    const isNeg = metric.delta < 0;
                    let trendColor = "text-muted-foreground bg-muted/20";
                    if (isPositive)
                        trendColor = metric.invertTrend
                            ? "text-rose-600 bg-rose-50 dark:bg-rose-950/20"
                            : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20";
                    if (isNeg)
                        trendColor = metric.invertTrend
                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                            : "text-rose-600 bg-rose-50 dark:bg-rose-950/20";

                    return (
                        <motion.div
                            key={metric.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -4, scale: 1.01 }}
                        >
                            <Card className="relative h-full overflow-hidden border-2 border-transparent bg-background/60 p-1 backdrop-blur-xl transition-all hover:border-primary/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground truncate">
                                        {metric.title}
                                    </CardTitle>
                                    <metric.icon className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-3xl font-black tracking-tight leading-none">
                                        {metric.value}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div
                                            className={cn(
                                                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                                                trendColor
                                            )}
                                        >
                                            {isPositive && <TrendingUp className="h-3 w-3" />}
                                            {isNeg && <ArrowDownRight className="h-3 w-3" />}
                                            {Math.abs(metric.delta).toFixed(1)}%
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                                            {metric.desc}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* ──────────── 3. DAILY ACTIVITY + CHANNEL PERFORMANCE ──────────── */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* Daily Activity Chart */}
                <Card className="lg:col-span-3 bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                    <CardHeader>
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Daily Activity
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">
                                Requests sent vs link clicks vs completions
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-0 pb-6">
                        {dailyData.length > 0 ? (
                            <div className="w-full h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={dailyData}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradClicked" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ff7a45" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ff7a45" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="hsl(var(--border))"
                                            opacity={0.5}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(v) => {
                                                const d = new Date(v);
                                                return `${d.getMonth() + 1}/${d.getDate()}`;
                                            }}
                                            minTickGap={40}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "12px",
                                                padding: "8px 12px",
                                            }}
                                            labelClassName="font-bold text-xs mb-1"
                                            labelFormatter={(label) =>
                                                new Date(label).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                            }
                                            itemStyle={{ fontSize: "11px", fontWeight: 600 }}
                                        />
                                        <Legend
                                            verticalAlign="top"
                                            align="right"
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ paddingBottom: "20px", fontSize: "11px", fontWeight: 500 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sent"
                                            name="Sent"
                                            stroke="var(--primary)"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#gradSent)"
                                            animationDuration={1500}
                                            activeDot={{ r: 4, strokeWidth: 2, stroke: "white" }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="clicked"
                                            name="Clicked"
                                            stroke="#ff7a45"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#gradClicked)"
                                            animationDuration={1500}
                                            activeDot={{ r: 4, strokeWidth: 2, stroke: "white" }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="completed"
                                            name="Completed"
                                            stroke="#10b981"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#gradCompleted)"
                                            animationDuration={1500}
                                            activeDot={{ r: 4, strokeWidth: 2, stroke: "white" }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex h-[280px] items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-muted/5">
                                No daily data for this period
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Channel Performance */}
                <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                    <CardHeader>
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Send className="w-5 h-5 text-primary" />
                                Channel Performance
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">
                                Compare SMS, Email, and Link effectiveness
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {channelData.map((ch) => {
                            const ChannelIcon =
                                ch.channel === "SMS"
                                    ? MessageSquare
                                    : ch.channel === "Email"
                                    ? Mail
                                    : Link2;
                            return (
                                <div key={ch.channel} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <ChannelIcon className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{ch.channel}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {ch.sent} sent
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-0.5">
                                            <p className="text-sm font-black text-primary">
                                                {ch.clickRate}% CTR
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {ch.conversionRate}% converted
                                            </p>
                                        </div>
                                    </div>
                                    {/* Stacked progress bar */}
                                    <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-primary rounded-l-full transition-all duration-700"
                                            style={{
                                                width: `${ch.sent > 0 ? (ch.completed / ch.sent) * 100 : 0}%`,
                                            }}
                                        />
                                        <div
                                            className="h-full bg-primary/40 transition-all duration-700"
                                            style={{
                                                width: `${ch.sent > 0 ? ((ch.clicked - ch.completed) / ch.sent) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            {ch.completed} completed
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                            {ch.clicked - ch.completed} clicked only
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {channelData.every((ch) => ch.sent === 0) && (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
                                <Send className="w-8 h-8 opacity-20" />
                                <p className="text-sm">No requests sent in this period</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ──────────── 4. RATING DISTRIBUTION + POPULAR TAGS ──────────── */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Rating Distribution */}
                <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                    <CardHeader>
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Star className="w-5 h-5 text-primary" />
                                Rating Distribution
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">
                                How customers rated their experience on your link
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {ratingDist.map((d) => (
                            <div key={d.star} className="flex items-center gap-3">
                                <span className="text-sm font-bold w-8 text-right">{d.star}</span>
                                <div className="flex-1 h-6 bg-muted/20 rounded-lg overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${maxRatingCount > 0 ? (d.count / maxRatingCount) * 100 : 0}%`,
                                        }}
                                        transition={{ duration: 0.8, delay: 0.2 + (5 - d.value) * 0.1 }}
                                        className="h-full rounded-lg flex items-center justify-end pr-2"
                                        style={{ backgroundColor: ratingColors[d.value] }}
                                    >
                                        {d.count > 0 && (
                                            <span className="text-[10px] font-bold text-white">
                                                {d.count}
                                            </span>
                                        )}
                                    </motion.div>
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground w-10 text-right">
                                    {pct(d.count, ratingsGiven.length)}%
                                </span>
                            </div>
                        ))}
                        {ratingsGiven.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
                                <Star className="w-8 h-8 opacity-20" />
                                <p className="text-sm">No ratings given yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Popular Tags */}
                <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                    <CardHeader>
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Hash className="w-5 h-5 text-primary" />
                                What Customers Loved
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">
                                Most selected positive tags from the review flow
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {popularTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {popularTags.map((t, idx) => {
                                    const intensity = Math.max(0.3, t.count / maxTagCount);
                                    return (
                                        <motion.div
                                            key={t.tag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.04 }}
                                        >
                                            <div
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-default"
                                                style={{ opacity: 0.5 + intensity * 0.5 }}
                                            >
                                                <span className="text-sm font-semibold">{t.tag}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 font-bold"
                                                >
                                                    {t.count}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
                                <Hash className="w-8 h-8 opacity-20" />
                                <p className="text-sm">No tags selected yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ──────────── 5. LOW RATING TIMELINE + PRIVATE FEEDBACK ──────────── */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Low Rating Alerts */}
                <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    Low Rating Alerts
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Ratings ≤ 3★ intercepted before reaching Google
                                </p>
                            </div>
                            {lowRatingEntries.length > 0 && (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
                                    {lowRatings.length} total
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {lowRatingEntries.length > 0 ? (
                            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                                {lowRatingEntries.map((r, idx) => {
                                    const stars = r.rating_given || 0;
                                    const ratingEmoji =
                                        stars === 1 ? "😞" : stars === 2 ? "😕" : "😐";
                                    return (
                                        <motion.div
                                            key={r.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors"
                                        >
                                            <span className="text-2xl">{ratingEmoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-bold truncate">
                                                        {r.customer_name || r.customer_email || "Anonymous"}
                                                    </p>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "h-3 w-3",
                                                                    i < stars
                                                                        ? "fill-amber-400 text-amber-400"
                                                                        : "text-muted-foreground/30"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        {new Date(r.created_at).toLocaleDateString(undefined, {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[9px] px-1.5 py-0 bg-muted/40 font-bold capitalize"
                                                    >
                                                        {r.channel}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                                <CheckCircle2 className="w-10 h-10 opacity-20 text-emerald-500" />
                                <p className="text-sm font-medium">No low ratings in this period! 🎉</p>
                                <p className="text-xs">All your customers are happy</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Private Feedback Feed */}
                <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-primary" />
                                    Private Feedback
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Direct feedback from customers who rated low
                                </p>
                            </div>
                            {privateFeedback.length > 0 && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                                    {privateFeedback.length}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {privateFeedback.length > 0 ? (
                            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                                {privateFeedback.slice(0, 10).map((fb, idx) => {
                                    const ratingEmoji =
                                        fb.rating === 1
                                            ? "😞"
                                            : fb.rating === 2
                                            ? "😕"
                                            : fb.rating === 3
                                            ? "😐"
                                            : "😊";
                                    return (
                                        <motion.div
                                            key={fb.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-3 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{ratingEmoji}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "h-3 w-3",
                                                                    i < fb.rating
                                                                        ? "fill-amber-400 text-amber-400"
                                                                        : "text-muted-foreground/30"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {new Date(fb.created_at).toLocaleDateString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                            {fb.content ? (
                                                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                                                    &ldquo;{fb.content}&rdquo;
                                                </p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">
                                                    No written feedback provided
                                                </p>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                                <MessageCircle className="w-10 h-10 opacity-20" />
                                <p className="text-sm font-medium">No private feedback yet</p>
                                <p className="text-xs">Feedback appears when customers rate ≤3 stars</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
