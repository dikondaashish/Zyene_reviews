"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Code2, LayoutTemplate, Smartphone, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parseWidgetConfig, type WidgetConfig } from "@/lib/widgets/config";

const WidgetBuilder = dynamic(() => import("@/components/widgets/builder/widget-builder").then(module => module.WidgetBuilder), {
    loading: () => <p className="p-8 text-center text-muted-foreground" role="status">Loading widget builder…</p>,
    ssr: false,
});

export function WidgetCard({ businessSlug }: { businessSlug: string }) {
    const [open, setOpen] = useState(false);
    const [initialConfig, setInitialConfig] = useState<WidgetConfig>(() => parseWidgetConfig(null));
    const launch = () => {
        try { setInitialConfig(parseWidgetConfig(localStorage.getItem(`zyene-widget:${businessSlug}`))); }
        catch { setInitialConfig(parseWidgetConfig(null)); }
        setOpen(true);
    };
    return <Card>
        <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary"><Code2 className="size-6" /></div>
            <div><CardTitle className="text-xl">Website Widgets</CardTitle>
                <CardDescription>Create your Google Reviews widget</CardDescription></div>
        </CardHeader>
        <CardContent className="space-y-6">
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Choose a template, customize its appearance, and embed your reviews on any website. Your widget shows the latest reviews synced to Zyene.</p>
            <div className="grid gap-4 sm:grid-cols-3">
                {[{ Icon: LayoutTemplate, title: "20 ready-to-use templates", text: "Carousels, grids, badges, stickers, and more" },
                    { Icon: Palette, title: "Make it yours", text: "Six themes, custom colors, fonts, and filters" },
                    { Icon: Smartphone, title: "Every screen", text: "Live desktop and mobile previews" }].map(({ Icon, title, text }) =>
                    <div key={title} className="rounded-xl border border-border bg-muted/30 p-4"><Icon className="mb-3 size-5 text-primary" />
                        <h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p></div>)}
            </div>
            <Button onClick={launch} disabled={!businessSlug.trim()}><LayoutTemplate className="mr-2 size-4" /> Open widget builder</Button>
            {!businessSlug.trim() && <p className="text-sm text-muted-foreground">Set your business slug in Business Information to create a widget.</p>}
        </CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="grid h-[94dvh] w-[calc(100vw-24px)] max-w-[1440px] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-[1440px]">
                <DialogHeader className="border-b px-5 py-4 pr-12">
                    <DialogTitle>Edit review widget</DialogTitle>
                    <DialogDescription>Choose a template and customize your widget. Copy the code when you’re ready.</DialogDescription>
                </DialogHeader>
                {open && <WidgetBuilder key={businessSlug} businessSlug={businessSlug} initialConfig={initialConfig} />}
            </DialogContent>
        </Dialog>
    </Card>;
}
