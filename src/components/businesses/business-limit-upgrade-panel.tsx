"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeModal } from "@/components/settings/upgrade-modal";
import { getUpgradeModalCopy } from "@/lib/billing/upgrade-modal-copy";
import { BUSINESS_LIMIT_UPGRADE_BILLING_HREF } from "@/lib/billing/business-limit-upgrade-href";

/** Plan limit UI for /businesses/add ,  Phase 7.4 business location hook */
export function BusinessLimitUpgradePanel() {
    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const copy = getUpgradeModalCopy("business_location");

    useEffect(() => {
        setUpgradeOpen(true);
    }, []);

    return (
        <>
            <div className="max-w-lg mx-auto w-full">
                <Card className="border-primary/30 bg-primary/10 overflow-hidden">
                    <div className="bg-primary h-1.5 w-full" />
                    <CardHeader className="text-center pt-8">
                        <div className="mx-auto mb-4 flex items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30 size-14">
                            <Lock className="text-primary size-7" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">{copy.title}</CardTitle>
                        <CardDescription className="text-muted-foreground font-medium">
                            Maximum business locations reached for your current plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center pb-8">
                        <p className="text-sm text-muted-foreground leading-relaxed">{copy.description}</p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                            <Button type="button" size="lg" onClick={() => setUpgradeOpen(true)}>
                                View upgrade options
                            </Button>
                            <Button type="button" size="lg" variant="outline" asChild>
                                <Link href={BUSINESS_LIMIT_UPGRADE_BILLING_HREF}>Compare plans</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <UpgradeModal
                isOpen={upgradeOpen}
                onClose={() => setUpgradeOpen(false)}
                context="business_location"
            />
        </>
    );
}
