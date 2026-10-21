"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Template = { id: string; name: string; body: string };

async function send(url: string, method: string, body?: unknown) {
    const response = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) throw new Error(json?.error || "Request failed");
}

/** Saved reply templates used by "post a saved template" rules (and as approval drafts without AI). */
export function ReplyTemplatesManager({
    businessId, templates, canManage,
}: { businessId: string; templates: Template[]; canManage: boolean }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [body, setBody] = useState("Thank you {reviewer_name}! We're glad you chose {business_name}.");
    const [pending, startTransition] = useTransition();

    const run = (fn: () => Promise<void>, ok: string) => startTransition(async () => {
        try {
            await fn();
            toast.success(ok);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        }
    });

    return (
        <section className="space-y-4 rounded-lg border bg-card p-4">
            <div>
                <h2 className="ui-section-title">Saved reply templates</h2>
                <p className="text-sm text-muted-foreground">
                    Use {"{reviewer_name}"} (first name) and {"{business_name}"}. Deleting a template switches rules that use it back to approval.
                </p>
            </div>
            {templates.length === 0 && <p className="text-sm text-muted-foreground">No templates yet.</p>}
            <ul className="space-y-2">
                {templates.map((t) => (
                    <li key={t.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">{t.name}</p>
                            {canManage && (
                                <Button variant="ghost" size="sm" disabled={pending}
                                    onClick={() => run(() => send(`/api/settings/reply-templates/${t.id}`, "DELETE"), "Template deleted")}>
                                    Delete
                                </Button>
                            )}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{t.body}</p>
                    </li>
                ))}
            </ul>
            {canManage && (
                <div className="space-y-2 border-t pt-4">
                    <Label htmlFor="template-name">New template</Label>
                    <Input id="template-name" placeholder="e.g. Thank-you (5 stars)" value={name} onChange={(e) => setName(e.target.value)} />
                    <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Template reply" />
                    <Button variant="outline" disabled={pending || !name.trim() || body.trim().length < 3}
                        onClick={() => run(async () => {
                            await send("/api/settings/reply-templates", "POST", { businessId, name, body });
                            setName("");
                        }, "Template saved")}>
                        Add template
                    </Button>
                </div>
            )}
        </section>
    );
}
