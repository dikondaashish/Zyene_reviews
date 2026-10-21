"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ReplyRuleRow, type ReplyRuleValue } from "./reply-rule-row";

type Candidate = { userId: string; label: string; role: string };
type Settings = {
    enabled: boolean;
    rules: ReplyRuleValue[];
    approverUserIds: string[];
    templates: { id: string; name: string }[];
};

export function ReplyRulesForm({
    businessId, initial, candidates, canManage,
}: {
    businessId: string; initial: Settings; candidates: Candidate[]; canManage: boolean;
}) {
    const router = useRouter();
    const [enabled, setEnabled] = useState(initial.enabled);
    const [rules, setRules] = useState(initial.rules);
    const [approvers, setApprovers] = useState(new Set(initial.approverUserIds));
    const [saving, startSaving] = useTransition();
    const disabled = !canManage || saving;

    const save = () => startSaving(async () => {
        const response = await fetch("/api/settings/reply-rules", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessId, enabled, rules, approverUserIds: [...approvers] }),
        });
        const body = await response.json().catch(() => null) as { error?: string } | null;
        if (!response.ok) {
            toast.error(body?.error || "Could not save reply rules");
            return;
        }
        toast.success("Reply rules saved");
        router.refresh();
    });

    const toggleApprover = (id: string, checked: boolean) => {
        setApprovers((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id); else next.delete(id);
            return next;
        });
    };

    return (
        <section className="space-y-4 rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Label htmlFor="reply-rules-enabled" className="text-base">Use reply rules</Label>
                    <p className="text-sm text-muted-foreground">
                        When on, these rules replace the single &quot;automatically publish&quot; switch on the Reviews page.
                        They apply to new Google reviews from now on.
                    </p>
                </div>
                <Switch id="reply-rules-enabled" checked={enabled} disabled={disabled} onCheckedChange={setEnabled} />
            </div>

            <div className="space-y-2">
                {rules.map((rule) => (
                    <ReplyRuleRow
                        key={rule.rating}
                        rule={rule}
                        templates={initial.templates}
                        disabled={disabled}
                        onChange={(next) => setRules((prev) => prev.map((r) => (r.rating === next.rating ? next : r)))}
                    />
                ))}
            </div>

            <div className="space-y-2">
                <Label className="text-base">Who approves drafts</Label>
                <p className="text-sm text-muted-foreground">
                    Pick specific people, or leave everyone unchecked to let any owner, admin or manager approve. Approvers get an email
                    when a draft is waiting.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {candidates.map((c) => (
                        <label key={c.userId} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                            <Checkbox checked={approvers.has(c.userId)} disabled={disabled}
                                onCheckedChange={(checked) => toggleApprover(c.userId, checked === true)} />
                            <span className="truncate">{c.label}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{c.role}</span>
                        </label>
                    ))}
                </div>
            </div>

            {canManage ? (
                <Button onClick={save} disabled={saving}>
                    {saving && <Loader2 className="mr-2 size-4 animate-spin" />}Save reply rules
                </Button>
            ) : (
                <p className="text-sm text-muted-foreground">Only owners, admins and managers can change reply rules.</p>
            )}
        </section>
    );
}
