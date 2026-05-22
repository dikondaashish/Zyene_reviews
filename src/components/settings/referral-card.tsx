"use client";

import { useEffect, useState } from "react";
import { Gift, Copy, Check, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ReferralPayload = {
    referralUrl: string;
    successfulReferrals: number;
    referrerReward: string;
    refereeReward: string;
};

export function ReferralCard() {
    const [data, setData] = useState<ReferralPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch("/api/referral", { credentials: "include" })
            .then((r) => r.json())
            .then((json) => {
                if (json.referralUrl) setData(json as ReferralPayload);
            })
            .catch(() => toast.error("Could not load referral link"))
            .finally(() => setLoading(false));
    }, []);

    async function copyLink() {
        if (!data?.referralUrl) return;
        try {
            await navigator.clipboard.writeText(data.referralUrl);
            setCopied(true);
            toast.success("Referral link copied");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Copy failed");
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Gift className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle>Refer a friend</CardTitle>
                        <CardDescription>
                            Share Zyene Reviews and earn rewards when friends subscribe.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <p className="text-sm text-muted-foreground">Loading your referral link…</p>
                ) : data ? (
                    <>
                        <div className="grid gap-3 sm:grid-cols-2 text-sm">
                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                                <p className="font-semibold text-foreground">You get</p>
                                <p className="text-muted-foreground mt-1">{data.referrerReward}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                                <p className="font-semibold text-foreground">They get</p>
                                <p className="text-muted-foreground mt-1">{data.refereeReward}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                readOnly
                                value={data.referralUrl}
                                className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-sm font-mono"
                            />
                            <Button type="button" variant="secondary" onClick={copyLink} className="shrink-0">
                                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                                Copy link
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            {data.successfulReferrals} successful referral
                            {data.successfulReferrals === 1 ? "" : "s"} so far
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Referral program unavailable.</p>
                )}
            </CardContent>
        </Card>
    );
}
