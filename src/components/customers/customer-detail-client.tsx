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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/lib/db/supabase/database.types";
import type { CustomerDetailStats, TimelineItem } from "@/lib/customers/customer-detail-data";

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
    if (digits.length > 0) return digits.slice(-2);
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

interface CustomerDetailClientProps {
    customer: CustomerRow;
    businessId: string;
    timeline: TimelineItem[];
    stats: CustomerDetailStats;
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

    const campaignHref = `/campaigns/new?customerIds=${encodeURIComponent(customer.id)}`;

    return (
        <div className="space-y-8">
            {/* SECTION A */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl font-semibold text-primary">
                            {initials(customer)}
                        </div>
                        <div className="min-w-0 flex-1 space-y-4">
                            <div>
                                {editingName ? (
                                    <div className="flex max-w-md flex-col gap-2">
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
                                            className="text-lg font-semibold"
                                            autoFocus
                                        />
                                        <p className="text-[11px] text-muted-foreground">Enter to save · Esc to cancel</p>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNameDraft(displayName(customer) || "");
                                            setEditingName(true);
                                        }}
                                        className="text-left text-2xl font-semibold tracking-tight hover:underline"
                                    >
                                        {displayName(customer) ? (
                                            displayName(customer)
                                        ) : (
                                            <span className="text-muted-foreground font-normal">Unnamed Customer</span>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                {customer.phone ? (
                                    <span className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 shrink-0" />
                                        {customer.phone}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 italic">No phone</span>
                                )}
                                {customer.email ? (
                                    <span className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 shrink-0" />
                                        {customer.email}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 italic">No email</span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Tags</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="gap-1 pr-1"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                className="rounded p-0.5 hover:bg-muted"
                                                aria-label={`Remove ${tag}`}
                                                onClick={() => removeTag(tag)}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    <div className="flex items-center gap-1">
                                        <Input
                                            placeholder="Add tag"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                            className="h-8 w-36 text-xs"
                                        />
                                        <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={addTag}>
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Added {format(parseISO(customer.created_at), "MMM d, yyyy")}
                                </span>
                            </div>

                            {customer.is_opted_out ? (
                                <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-flex">
                                                <Button type="button" disabled className="rounded-lg">
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send Review Request
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            This contact opted out of review requests.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <Button asChild className="rounded-lg">
                                    <Link href={campaignHref}>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Review Request
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION B — Activity */}
            <div>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    Activity
                </h2>
                <Card>
                    <CardContent className="p-0">
                        {timeline.length === 0 ? (
                            <p className="p-6 text-sm text-muted-foreground">No activity yet.</p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {timeline.map((item) => (
                                    <li key={`${item.type}-${item.id}`} className="px-4 py-4 sm:px-6">
                                        {item.type === "request" ? (
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                    <MessageSquare className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-foreground">
                                                        Review request · {channelLabel(item.channel)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {item.sent_at
                                                            ? format(parseISO(item.sent_at), "MMM d, yyyy h:mm a")
                                                            : format(parseISO(item.sortAt), "MMM d, yyyy h:mm a")}
                                                        {" · "}
                                                        <span className="capitalize">{item.status}</span>
                                                        {item.review_left ? " · Review completed" : null}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : item.type === "feedback" ? (
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-4/15">
                                                    <Star className="h-4 w-4 text-chart-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-foreground">
                                                        Review left · Private feedback
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-3.5 w-3.5 ${
                                                                    i < item.rating
                                                                        ? "fill-chart-4 text-chart-4"
                                                                        : "text-muted-foreground/30"
                                                                }`}
                                                            />
                                                        ))}
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            {format(parseISO(item.sortAt), "MMM d, yyyy h:mm a")}
                                                        </span>
                                                    </div>
                                                    {item.content ? (
                                                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                                                            {item.content}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-4/15">
                                                    <Star className="h-4 w-4 text-chart-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-foreground">
                                                        Review left · {platformLabel(item.platform)}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-3.5 w-3.5 ${
                                                                    i < item.rating
                                                                        ? "fill-chart-4 text-chart-4"
                                                                        : "text-muted-foreground/30"
                                                                }`}
                                                            />
                                                        ))}
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            {format(parseISO(item.sortAt), "MMM d, yyyy h:mm a")}
                                                        </span>
                                                    </div>
                                                    {item.text ? (
                                                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
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
            </div>

            {/* SECTION C — Summary */}
            <div>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    Summary
                </h2>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2 pt-4">
                            <CardDescription>Total requests sent</CardDescription>
                            <CardTitle className="text-2xl">{stats.totalRequestsSent}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 pt-4">
                            <CardDescription>Reviews left</CardDescription>
                            <CardTitle className="text-2xl">{stats.reviewsLeftCount}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 pt-4">
                            <CardDescription>Last contacted</CardDescription>
                            <CardTitle className="text-base font-medium leading-snug">
                                {stats.lastContactedAt
                                    ? formatDistanceToNow(parseISO(stats.lastContactedAt), { addSuffix: true })
                                    : "—"}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 pt-4">
                            <CardDescription>Last request status</CardDescription>
                            <CardTitle className="text-base font-medium">{stats.lastRequestStatus}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    );
}
