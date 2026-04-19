"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

type ListingForm = {
    title: string;
    websiteUri: string;
    primaryPhone: string;
    description: string;
};

type ProfileHealthCheck = { id: string; label: string; ok: boolean; hint?: string };

export function GoogleListingEditor({ businessId }: { businessId: string }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<ListingForm>({
        title: "",
        websiteUri: "",
        primaryPhone: "",
        description: "",
    });
    const initialRef = useRef<ListingForm | null>(null);
    const [profileHealth, setProfileHealth] = useState<{
        score: number;
        checks: ProfileHealthCheck[];
    } | null>(null);
    const [notConnected, setNotConnected] = useState(false);
    const [meta, setMeta] = useState<{
        primaryCategoryDisplay: string;
        mapsUri: string;
        hasRegularHours: boolean;
    } | null>(null);

    const unwrapApiData = <T,>(payload: unknown): T => {
        const root = payload as { data?: T } & T;
        return (root?.data ?? root) as T;
    };

    const load = useCallback(async () => {
        setLoading(true);
        setNotConnected(false);
        try {
            const res = await fetch(`/api/google/listing?businessId=${encodeURIComponent(businessId)}`);
            const payload = await res.json();
            
            if (!res.ok) {
                if (res.status === 404 || payload.code === "GOOGLE_NOT_CONNECTED") {
                    setNotConnected(true);
                    return; // Fail gracefully
                }
                throw new Error(payload.error || "Failed to load listing");
            }

            const data = unwrapApiData<{
                listing?: {
                    title?: string;
                    websiteUri?: string;
                    primaryPhone?: string;
                    description?: string;
                    primaryCategoryDisplay?: string;
                    mapsUri?: string;
                    hasRegularHours?: boolean;
                };
                profileHealth?: { score: number; checks: ProfileHealthCheck[] };
            }>(payload);
            const L = data?.listing;
            if (!L) {
                throw new Error("Google listing payload missing listing details");
            }
            const next: ListingForm = {
                title: L.title || "",
                websiteUri: L.websiteUri || "",
                primaryPhone: L.primaryPhone || "",
                description: L.description || "",
            };
            setForm(next);
            initialRef.current = { ...next };
            setProfileHealth(data.profileHealth ?? null);
            setMeta({
                primaryCategoryDisplay: L.primaryCategoryDisplay || "",
                mapsUri: L.mapsUri || "",
                hasRegularHours: !!L.hasRegularHours,
            });
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to load Google listing");
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialRef.current) return;

        const body: Record<string, string> = { businessId };
        const init = initialRef.current;
        if (form.title !== init.title) body.title = form.title;
        if (form.websiteUri !== init.websiteUri) body.websiteUri = form.websiteUri;
        if (form.primaryPhone !== init.primaryPhone) body.primaryPhone = form.primaryPhone;
        if (form.description !== init.description) body.description = form.description;

        if (Object.keys(body).length === 1) {
            toast.message("No changes to save.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/google/listing", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload.error || "Update failed");
            const data = unwrapApiData<{
                listing?: {
                    title?: string;
                    websiteUri?: string;
                    primaryPhone?: string;
                    description?: string;
                };
                profileHealth?: { score: number; checks: ProfileHealthCheck[] };
            }>(payload);

            toast.success("Google listing updated");
            if (data.listing) {
                const L = data.listing;
                const next: ListingForm = {
                    title: L.title || "",
                    websiteUri: L.websiteUri || "",
                    primaryPhone: L.primaryPhone || "",
                    description: L.description || "",
                };
                setForm(next);
                initialRef.current = { ...next };
            }
            if (data.profileHealth) {
                setProfileHealth(data.profileHealth);
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Update failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading listing from Google…
            </div>
        );
    }

    if (notConnected) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <CheckCircle2 className="h-6 w-6 text-primary opacity-50" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-foreground">Google not connected</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Connect your Google Business Profile to edit your live listing details directly from this dashboard.
                    </p>
                </div>
                <Button variant="outline" className="mt-2 bg-background" asChild>
                    <a href="/settings/general">Go to Integrations</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {profileHealth && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium">Profile completeness</p>
                            <p className="text-xs text-muted-foreground">
                                Based on your live Google Business Profile fields.
                            </p>
                        </div>
                        <span className="text-2xl font-bold tabular-nums">{profileHealth.score}</span>
                    </div>
                    <Progress value={profileHealth.score} className="h-2" />
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {profileHealth.checks.map((c) => (
                            <li key={c.id} className="flex items-start gap-2 text-sm">
                                {c.ok ? (
                                    <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0 mt-0.5" />
                                ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                )}
                                <span className={c.ok ? "" : "text-muted-foreground"}>
                                    {c.label}
                                    {!c.ok && c.hint && (
                                        <span className="block text-xs text-muted-foreground mt-0.5">{c.hint}</span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {meta?.mapsUri && (
                <p className="text-sm">
                    <a
                        href={meta.mapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                    >
                        View on Google Maps
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {meta.primaryCategoryDisplay && (
                        <span className="text-muted-foreground">
                            {" "}
                            · {meta.primaryCategoryDisplay}
                        </span>
                    )}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                    <Label htmlFor="gbp-title">Business title (Google)</Label>
                    <Input
                        id="gbp-title"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        autoComplete="off"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gbp-website">Website</Label>
                    <Input
                        id="gbp-website"
                        type="url"
                        placeholder="https://"
                        value={form.websiteUri}
                        onChange={(e) => setForm((f) => ({ ...f, websiteUri: e.target.value }))}
                        autoComplete="off"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gbp-phone">Primary phone</Label>
                    <Input
                        id="gbp-phone"
                        type="tel"
                        value={form.primaryPhone}
                        onChange={(e) => setForm((f) => ({ ...f, primaryPhone: e.target.value }))}
                        autoComplete="off"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gbp-desc">Description</Label>
                    <Textarea
                        id="gbp-desc"
                        rows={5}
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Describe your business for Google Search and Maps."
                        className="resize-y"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Save to Google"
                        )}
                    </Button>
                    <Button type="button" variant="outline" onClick={load} disabled={saving || loading}>
                        Reload from Google
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Updates are sent to Google immediately. Hours and categories must still be edited in Google Business
                    Profile if you need full control.
                </p>
            </form>
        </div>
    );
}
