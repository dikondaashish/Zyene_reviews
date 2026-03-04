"use client";

import { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function WidgetCard({ businessSlug }: { businessSlug: string }) {
    const [copied, setCopied] = useState(false);

    const embedUrl = typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}/w/${businessSlug}`
        : `https://zyenereviews.com/w/${businessSlug}`;

    const embedCode = `<iframe src="${embedUrl}" width="100%" height="400px" frameborder="0" style="border:none; overflow:hidden;" allowtransparency="true"></iframe>`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(embedCode);
            setCopied(true);
            toast.success("Embed code copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy code");
        }
    };

    return (
        <Card className="flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50 group">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <Code2 className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle className="text-xl">Website Carousel</CardTitle>
                    <CardDescription>Embed your best 4.5+ star reviews</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Showcase your top reviews directly on your website to build trust and increase conversions. It updates automatically.
                </p>

                <div className="space-y-2 mt-auto">
                    <div className="relative group/code">
                        <pre className="p-3 bg-slate-950 text-slate-50 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono relative">
                            {embedCode}
                        </pre>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
