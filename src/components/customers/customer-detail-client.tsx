"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
    Mail,
    Phone,
    Calendar,
    Send,
    Star,
    MessageSquare,
    Activity,
    BarChart3,
    X,
    Plus,
    ChevronLeft,
    ChevronRight,
    UserRound,
    Clock,
    Sparkles,
    CircleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/db/supabase/database.types";
import type { CustomerDetailStats, TimelineItem } from "@/lib/customers/customer-detail-data";
import { humanizeRequestStatus } from "@/lib/customers/customer-detail-data";

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

function parseFullName(input: string): { first_name: string | null; last_name: string | null } {
    const t = input.trim();
    if (!t) return { first_name: null, last_name: null };
    const i = t.indexOf(" ");
    if (i === -1) return { first_name: t, last_name: null };
    const rest = t.slice(i + 1).trim();
    return { first_name: t.slice(0, i), last_name: rest || null };
}

function displayName(c: CustomerRow): string {
    return `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
}

function initials(c: CustomerRow): string {
    const name = displayName(c);
    if (name) {
        const parts = name.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].slice(0, 2).toUpperCase();
    }
    const digits = (c.phone ?? "").replace(/\D/g, "");
    if (digits.length >= 4) return digits.slice(-4);
    if (digits.length > 0) return digits.slice(-2);
    const email = (c.email ?? "").trim();
    if (email.length >= 2) {
        const local = email.split("@")[0] ?? email;
        const letters = local.replace(/[^a-zA-Z0-9]/g, "");
        if (letters.length >= 2) return letters.slice(0, 2).toUpperCase();
        return email.slice(0, 2).toUpperCase();
    }
    return "?";
}

function channelLabel(ch: string): string {
    const x = ch.toLowerCase();
    if (x === "sms") return "SMS";
    if (x === "email") return "Email";
    if (x === "link") return "Link";
    return ch;
}

function platformLabel(p: string): string {
    const x = p.toLowerCase();
    if (x === "google") return "Google";
    if (x === "facebook") return "Facebook";
    if (x === "yelp") return "Yelp";
    return p.charAt(0).toUpperCase() + p.slice(1);
}

function requestStatusTone(status: string): { className: string; dot: string } {
    const s = status.toLowerCase();
    if (s === "failed" || s === "skipped")
        return {
            className: "border-destructive/30 bg-destructive/10 text-destructive",
            dot: "bg-destructive",
        };
    if (s === "sending" || s === "queued" || s === "pending")
        return {
            className: "border-chart-4/35 bg-chart-4/10 text-chart-4",
            dot: "bg-chart-4 animate-pulse",
        };
    if (s === "sent" || s === "delivered" || s === "opened" || s === "clicked" || s === "completed" || s === "review_left")
        return {
            className: "border-chart-2/35 bg-chart-2/10 text-chart-2",
            dot: "bg-chart-2",
        };
    return {
        className: "border-border bg-muted/60 text-muted-foreground",
        dot: "bg-muted-foreground",
    };
}

interface CustomerDetailClientProps {
    customer: CustomerRow;
    businessId: string;
    timeline: TimelineItem[];
    stats: CustomerDetailStats;
}

function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </span>
                    {title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

export function CustomerDetailClient({ customer: initial, businessId, timeline, stats }: CustomerDetailClientProps) {
    const router = useRouter();
    const [customer, setCustomer] = React.useState(initial);
    const [editingName, setEditingName] = React.useState(false);
    const [nameDraft, setNameDraft] = React.useState(displayName(initial) || "");
    const [tagInput, setTagInput] = React.useState("");
    const skipBlurName = React.useRef(false);

    React.useEffect(() => {
        setCustomer(initial);
        if (!editingName) setNameDraft(displayName(initial) || "");
    }, [initial, editingName]);

    const saveName = async () => {
        const committed = displayName(customer);
        const trimmed = nameDraft.trim();
        if (trimmed === committed) {
            setEditingName(false);
            return;
        }
        const { first_name, last_name } = parseFullName(trimmed);
        try {
            const res = await fetch("/api/customers", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: customer.id,
                    businessId,
                    first_name,
                    last_name,
                }),
            });
            const payload = await res.json();
            if (!res.ok || !payload.success) throw new Error(payload.error || "Failed to update");
            setCustomer(payload.data);
            toast.success("Name updated");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not save");
        } finally {
            setEditingName(false);
        }
    };

    const saveTags = async (tags: string[]) => {
        try {
            const res = await fetch("/api/customers", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: customer.id,
                    businessId,
                    tags,
                }),
            });
            const payload = await res.json();
            if (!res.ok || !payload.success) throw new Error(payload.error || "Failed to update tags");
            setCustomer(payload.data);
            router.refresh();
            toast.success("Tags updated");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not save tags");
        }
    };

    const tags = customer.tags ?? [];
    const name = displayName(customer);
    const avatarText = initials(customer);
    const avatarCompact = avatarText.length > 2;
    const campaignHref = `/campaigns/new?customerIds=${encodeURIComponent(customer.id)}`;
    const pageHeading =
        name || customer.phone?.trim() || customer.email?.trim() || "Unnamed contact";
    const missingPhoneAndEmail = !customer.phone?.trim() && !customer.email?.trim();
    const summaryHasNoEngagement =
        stats.totalRequestsSent === 0 && stats.reviewsLeftCount === 0;

    const addTag = () => {
        const t = tagInput.trim();
        if (!t) return;
        if (tags.includes(t)) {
            setTagInput("");
            return;
        }
        void saveTags([...tags, t]);
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        void saveTags(tags.filter((x) => x !== tag));
    };

    const sendReviewRequestButton =
        customer.is_opted_out ? (
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-flex w-full sm:w-auto">
                            <Button
                                type="button"
                                disabled
                                className="h-9 w-full rounded-lg px-4 text-sm font-semibold sm:w-auto"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Send review request
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">This contact opted out of review requests.</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ) : (
            <Button
                asChild
                className="h-9 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 sm:w-auto"
            >
                <Link href={campaignHref}>
                    <Sparkles className="mr-2 h-4 w-4 opacity-90" />
                    Send review request
                </Link>
            </Button>
        );

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            {/* Page chrome aligned with /customers list */}
            <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="min-w-0 space-y-1">
                    <Link
                        href="/customers"
                        className={cn(
                            "group mb-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors",
                            "hover:text-foreground"
                        )}
                    >
                        <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                        Customers
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg border border-primary/20 bg-primary/10 p-1.5">
                            <UserRound className="h-4 w-4 text-primary" />
                        </div>
                        <h1 className="min-w-0 truncate text-2xl font-bold tracking-tight text-foreground">
                            {pageHeading}
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        View contact details, review outreach, and activity for this person.
                    </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                    {sendReviewRequestButton}
                </div>
            </header>

            {missingPhoneAndEmail ? (
                <Alert className="border-chart-4/35 bg-chart-4/5 text-foreground [&>svg]:text-chart-4">
                    <CircleAlert className="h-4 w-4" />
                    <AlertTitle>Add phone or email</AlertTitle>
                    <AlertDescription>
                        Campaigns need at least one channel to reach this contact. Add details below before sending a
                        review request.
                    </AlertDescription>
                </Alert>
            ) : null}

            {/* Profile + contact */}
            <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_100%_0%,var(--primary)_0%,transparent_55%)] opacity-[0.06]"
                    aria-hidden
                />
                <div className="relative border-b border-border/60 bg-muted/20 px-5 py-5 sm:px-8 sm:py-7">
                    <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
                        <div
                            className={cn(
                                "relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/18 to-primary/5 ring-2 ring-primary/12 ring-offset-2 ring-offset-card",
                                avatarCompact ? "h-[4.75rem] w-[4.75rem]" : "h-[5.25rem] w-[5.25rem]"
                            )}
                        >
                            <span
                                className={cn(
                                    "font-semibold tracking-tight text-primary",
                                    avatarCompact ? "text-base tabular-nums" : "text-xl"
                                )}
                            >
                                {avatarText}
                            </span>
                        </div>

                        <div className="min-w-0 flex-1 space-y-5">
                            <div className="space-y-2">
                                {editingName ? (
                                    <div className="flex max-w-xl flex-col gap-2">
                                        <Input
                                            value={nameDraft}
                                            onChange={(e) => setNameDraft(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    void saveName();
                                                }
                                                if (e.key === "Escape") {
                                                    e.preventDefault();
                                                    skipBlurName.current = true;
                                                    setEditingName(false);
                                                    setNameDraft(displayName(customer) || "");
                                                }
                                            }}
                                            onBlur={() => {
                                                if (skipBlurName.current) {
                                                    skipBlurName.current = false;
                                                    return;
                                                }
                                                void saveName();
                                            }}
                                            className="h-11 max-w-xl text-lg font-semibold"
                                            autoFocus
                                            placeholder="Full name"
                                        />
                                        <p className="text-xs text-muted-foreground">Enter to save · Esc to cancel</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNameDraft(displayName(customer) || "");
                                                setEditingName(true);
                                            }}
                                            className="group block text-left"
                                        >
                                            {name ? (
                                                <span className="text-xl font-semibold tracking-tight text-foreground underline-offset-4 group-hover:underline sm:text-2xl">
                                                    {name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
                                                    <UserRound className="h-7 w-7 shrink-0 opacity-60" />
                                                    Add a display name
                                                    <ChevronRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
                                                </span>
                                            )}
                                        </button>
                                        {!name && customer.phone && (
                                            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                                                Showing phone below — add a name so this contact is easier to find.
                                            </p>
                                        )}
                                        {customer.is_opted_out ? (
                                            <Badge
                                                variant="outline"
                                                className="mt-2 w-fit border-chart-4/40 bg-chart-4/10 text-chart-4"
                                            >
                                                Opted out of review requests
                                            </Badge>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div
                                    className={cn(
                                        "flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors",
                                        customer.phone
                                            ? "border-border/80 bg-background/80"
                                            : "border-dashed border-muted-foreground/20 bg-muted/15"
                                    )}
                                >
                                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/80">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            Phone
                                        </p>
                                        {customer.phone ? (
                                            <p className="mt-1 font-medium text-foreground tabular-nums">{customer.phone}</p>
                                        ) : (
                                            <p className="mt-1 text-sm text-muted-foreground">Not set</p>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        "flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors",
                                        customer.email
                                            ? "border-border/80 bg-background/80"
                                            : "border-dashed border-muted-foreground/20 bg-muted/15"
                                    )}
                                >
                                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/80">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            Email
                                        </p>
                                        {customer.email ? (
                                            <p className="mt-1 break-all font-medium text-foreground">{customer.email}</p>
                                        ) : (
                                            <p className="mt-1 text-sm text-muted-foreground">Not set</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/80 bg-muted/15 p-4 sm:p-5">
                                <div className="mb-3">
                                    <p className="text-sm font-semibold text-foreground">Tags</p>
                                    <p className="text-xs text-muted-foreground">
                                        Organize this contact for campaigns and filters.
                                    </p>
                                </div>
                                {tags.length === 0 ? (
                                    <p className="mb-3 text-sm text-muted-foreground">No tags yet — add labels to find this contact in filters.</p>
                                ) : null}
                                <div className="flex flex-wrap items-center gap-2">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="gap-1 border border-border/60 bg-background py-1 pr-1 pl-2.5 text-xs font-medium shadow-sm"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                aria-label={`Remove ${tag}`}
                                                onClick={() => removeTag(tag)}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    <div className="flex min-w-[12rem] flex-1 items-center gap-2 sm:max-w-md">
                                        <Input
                                            placeholder="Type a tag and press Enter"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                            className="h-9 flex-1 text-sm"
                                        />
                                        <Button type="button" size="sm" variant="secondary" className="shrink-0" onClick={addTag}>
                                            <Plus className="mr-1 h-3.5 w-3.5" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 shrink-0 opacity-70" />
                                <span>
                                    Customer since{" "}
                                    <span className="font-medium text-foreground">
                                        {format(parseISO(customer.created_at), "MMMM d, yyyy")}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Summary before activity */}
            <section>
                <SectionHeading
                    icon={BarChart3}
                    title="Summary"
                    description="Quick stats for requests and engagement with this contact."
                />
                <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
                    <CardContent className="p-0">
                        <div className="grid divide-y divide-border/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
                            <div className="px-5 py-5 sm:px-6 sm:py-6">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Requests sent
                                </p>
                                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                                    {stats.totalRequestsSent}
                                </p>
                            </div>
                            <div className="px-5 py-5 sm:px-6 sm:py-6">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Reviews left
                                </p>
                                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                                    {stats.reviewsLeftCount}
                                </p>
                            </div>
                            <div className="px-5 py-5 sm:px-6 sm:py-6">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Last contacted
                                </p>
                                <p className="mt-2 text-lg font-semibold leading-snug text-foreground">
                                    {stats.lastContactedAt
                                        ? formatDistanceToNow(parseISO(stats.lastContactedAt), { addSuffix: true })
                                        : "Never"}
                                </p>
                            </div>
                            <div className="px-5 py-5 sm:px-6 sm:py-6">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Last request
                                </p>
                                <p className="mt-2 text-lg font-semibold leading-snug text-foreground">
                                    {stats.lastRequestStatus}
                                </p>
                            </div>
                        </div>
                        {summaryHasNoEngagement ? (
                            <div className="border-t border-border/80 bg-muted/15 px-5 py-4 text-center text-sm text-muted-foreground sm:px-6">
                                No review requests or feedback recorded for this contact yet. Send a request to start
                                the timeline below.
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </section>

            {/* Activity */}
            <section>
                <SectionHeading
                    icon={Activity}
                    title="Activity"
                    description="Review requests and feedback for this contact, newest first."
                />
                <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
                    <CardContent className="p-0">
                        {timeline.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground">No activity yet</p>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    When you send a request or this contact leaves feedback, it will show up here.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-border/80">
                                {timeline.map((item) => (
                                    <li key={`${item.type}-${item.id}`} className="px-5 py-5 sm:px-8">
                                        {item.type === "request" ? (
                                            <div className="flex gap-4">
                                                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-inner">
                                                    <MessageSquare className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                                                        <p className="font-medium text-foreground">
                                                            {channelLabel(item.channel)} review request
                                                        </p>
                                                        {(() => {
                                                            const tone = requestStatusTone(item.status);
                                                            return (
                                                                <span
                                                                    className={cn(
                                                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                                                        tone.className
                                                                    )}
                                                                >
                                                                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)} />
                                                                    {humanizeRequestStatus(item.status)}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                                            {item.sent_at
                                                                ? format(parseISO(item.sent_at), "MMM d, yyyy · h:mm a")
                                                                : format(parseISO(item.sortAt), "MMM d, yyyy · h:mm a")}
                                                        </span>
                                                        {item.review_left ? (
                                                            <>
                                                                <span className="hidden sm:inline" aria-hidden>
                                                                    ·
                                                                </span>
                                                                <span className="text-chart-2">Review completed</span>
                                                            </>
                                                        ) : null}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : item.type === "feedback" ? (
                                            <div className="flex gap-4">
                                                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-chart-4/15 text-chart-4 shadow-inner">
                                                    <Star className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <p className="font-medium text-foreground">Private feedback</p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="flex items-center gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={cn(
                                                                        "h-4 w-4",
                                                                        i < item.rating
                                                                            ? "fill-chart-4 text-chart-4"
                                                                            : "text-muted-foreground/25"
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(parseISO(item.sortAt), "MMM d, yyyy · h:mm a")}
                                                        </span>
                                                    </div>
                                                    {item.content ? (
                                                        <p className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm leading-relaxed text-muted-foreground">
                                                            {item.content}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-4">
                                                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-chart-2/15 text-chart-2 shadow-inner">
                                                    <Star className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <p className="font-medium text-foreground">
                                                        Public review · {platformLabel(item.platform)}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="flex items-center gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={cn(
                                                                        "h-4 w-4",
                                                                        i < item.rating
                                                                            ? "fill-chart-2 text-chart-2"
                                                                            : "text-muted-foreground/25"
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(parseISO(item.sortAt), "MMM d, yyyy · h:mm a")}
                                                        </span>
                                                    </div>
                                                    {item.text ? (
                                                        <p className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm leading-relaxed text-muted-foreground">
                                                            {item.text}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
