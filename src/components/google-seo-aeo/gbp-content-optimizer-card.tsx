"use client";

import * as React from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ServiceDraft = { name: string; description: string };
type PostDraft = { topicType: string; summary: string; rationale: string };

/**
 * F6.6 — the services and posts arms of the GBP optimizer, alongside the
 * description card that already shipped.
 *
 * Drafts are shown for copying, never published. Writing to a customer's
 * Google listing is a Phase 2 decision (F6.10) and needs its own confirmation
 * step; nothing here touches their public profile.
 */
export function GbpContentOptimizerCard({
    businessId,
    topKeywords,
}: {
    businessId: string;
    topKeywords: string[];
}) {
    const [pending, setPending] = React.useState<"services" | "posts" | null>(null);
    const [services, setServices] = React.useState<ServiceDraft[]>([]);
    const [posts, setPosts] = React.useState<PostDraft[]>([]);
    const [publishingIndex, setPublishingIndex] = React.useState<number | null>(null);

    async function generate(surface: "services" | "posts") {
        setPending(surface);
        try {
            const res = await fetch("/api/ai/optimize-gbp-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, surface, topKeywords }),
            });
            const body = await res.json();
            if (!res.ok) {
                toast.error(body?.error ?? "Could not generate content.");
                return;
            }
            if (surface === "services") setServices(body.data?.services ?? []);
            else setPosts(body.data?.posts ?? []);
        } catch {
            toast.error("Could not reach the optimizer.");
        } finally {
            setPending(null);
        }
    }

    async function publishPost(post: PostDraft, index: number) {
        if (!window.confirm("Publish this post to your live Google Business Profile now?")) return;
        setPublishingIndex(index);
        try {
            const response = await fetch("/api/google/local-posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId, summary: post.summary, topicType: post.topicType }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error ?? "Publish failed");
            toast.success("Post published to Google.");
        } catch (error) { toast.error(error instanceof Error ? error.message : "Publish failed"); }
        finally { setPublishingIndex(null); }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Services &amp; posts optimizer</CardTitle>
                <CardDescription>
                    Drafts built from your real Google category and the services you already list.
                    Anything we cannot verify comes back as a <code>{"{{placeholder}}"}</code> for you
                    to fill. Publishing always requires a separate confirmation.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generate("services")}
                        disabled={pending !== null}
                    >
                        <Sparkles className="mr-2 size-4" />
                        {pending === "services" ? "Writing…" : "Describe my services"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generate("posts")}
                        disabled={pending !== null}
                    >
                        <Sparkles className="mr-2 size-4" />
                        {pending === "posts" ? "Drafting…" : "Draft posts"}
                    </Button>
                </div>

                {services.length > 0 ? (
                    <ul className="space-y-3">
                        {services.map((service) => (
                            <li key={service.name} className="rounded-lg border p-3">
                                <p className="text-sm font-medium">{service.name}</p>
                                <p className="text-muted-foreground mt-1 text-sm">{service.description}</p>
                            </li>
                        ))}
                    </ul>
                ) : null}

                {posts.length > 0 ? (
                    <ul className="space-y-3">
                        {posts.map((post, index) => (
                            <li key={`${post.topicType}:${post.summary}`} className="rounded-lg border p-3">
                                <Badge variant="secondary" className="text-xs">
                                    {post.topicType}
                                </Badge>
                                <p className="mt-2 text-sm">{post.summary}</p>
                                <p className="text-muted-foreground mt-1 text-xs">{post.rationale}</p>
                                <Button className="mt-2" size="sm" onClick={() => publishPost(post, index)} disabled={publishingIndex !== null}>{publishingIndex === index ? "Publishing…" : "Publish to Google"}</Button>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </CardContent>
        </Card>
    );
}
