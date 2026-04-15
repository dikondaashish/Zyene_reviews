"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateCompetitorWatchSettings } from "@/app/actions/competitor-watch-settings";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CompetitorAlertsForm({
    businessId,
    initialRatingDelta,
    initialReviewSpike,
    initialEmailEnabled,
}: {
    businessId: string;
    initialRatingDelta: number;
    initialReviewSpike: number;
    initialEmailEnabled: boolean;
}) {
    const [ratingDelta, setRatingDelta] = useState(String(initialRatingDelta));
    const [reviewSpike, setReviewSpike] = useState(String(initialReviewSpike));
    const [emailEnabled, setEmailEnabled] = useState(initialEmailEnabled);
    const [saving, setSaving] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await updateCompetitorWatchSettings({
                businessId,
                ratingAlertDelta: Number(ratingDelta),
                reviewSpikeThreshold: Number(reviewSpike),
                emailAlertsEnabled: emailEnabled,
            });
            if (res.success) {
                toast.success("Competitor alert settings saved.");
            } else {
                toast.error(res.error || "Could not save settings.");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-md">
            <div className="space-y-2">
                <Label htmlFor="rating-delta">Rating surge threshold</Label>
                <Input
                    id="rating-delta"
                    type="number"
                    step="0.05"
                    min={0.05}
                    max={2}
                    value={ratingDelta}
                    onChange={(e) => setRatingDelta(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    Alert when a competitor&apos;s rating jumps by at least this amount vs the last snapshot (e.g. 0.20).
                </p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="review-spike">Review spike threshold</Label>
                <Input
                    id="review-spike"
                    type="number"
                    min={1}
                    max={5000}
                    step={1}
                    value={reviewSpike}
                    onChange={(e) => setReviewSpike(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    Alert when a competitor gains at least this many new reviews vs the last snapshot.
                </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="email-alerts">Email when alerts fire</Label>
                    <p className="text-xs text-muted-foreground">
                        Sends email to team members who have email notifications enabled for this business.
                    </p>
                </div>
                <Switch id="email-alerts" checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>
            <Button type="submit" disabled={saving}>
                {saving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                    </>
                ) : (
                    "Save"
                )}
            </Button>
        </form>
    );
}
