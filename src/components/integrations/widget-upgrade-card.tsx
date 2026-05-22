"use client";

import { useState } from "react";
import { MonitorPlay } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/settings/upgrade-modal";

/** Shown when the org plan does not include public review widgets (Phase 7.4). */
export function WidgetUpgradeCard() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Card className="max-w-2xl">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <MonitorPlay className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Website Widgets</CardTitle>
                        <CardDescription>Embed review carousels and rating badges on your site</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Showcase 5-star reviews on your website with auto-updating embeds. Available on paid plans.
                    </p>
                    <Button type="button" onClick={() => setOpen(true)}>
                        View upgrade options
                    </Button>
                </CardContent>
            </Card>
            <UpgradeModal isOpen={open} onClose={() => setOpen(false)} context="widget" />
        </>
    );
}
