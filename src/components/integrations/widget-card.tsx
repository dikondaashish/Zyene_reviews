"use client";

import { useState } from "react";
import { Check, Copy, Code2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function WidgetCard({ businessSlug }: { businessSlug: string }) {
    const [copiedType, setCopiedType] = useState<"carousel" | "badge" | null>(null);
    const [previewType, setPreviewType] = useState<"carousel" | "badge" | null>(null);

    // Always use the public apex domain for iframes — app.* requires login and redirects to auth.* (breaks embeds).
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com";
    const protocol = rootDomain.includes("localhost") ? "http" : "https";
    const embedBase = `${protocol}://${rootDomain}`;
    const embedUrl = `${embedBase}/w/${businessSlug}`;
    const carouselPreviewUrl = embedUrl;
    const badgePreviewUrl = `${embedUrl}?type=badge`;

    const carouselEmbedCode = `<iframe src="${embedUrl}" width="100%" height="400px" frameborder="0" style="border:none; overflow:hidden;" allowtransparency="true"></iframe>`;
    const badgeEmbedCode = `<iframe src="${embedUrl}?type=badge" style="width: 100%; border: none; min-height: 300px;" title="Reviews Widget"></iframe>`;

    const handleCopy = async (type: "carousel" | "badge") => {
        const code = type === "badge" ? badgeEmbedCode : carouselEmbedCode;
        try {
            await navigator.clipboard.writeText(code);
            setCopiedType(type);
            toast.success("Embed code copied to clipboard");
            setTimeout(() => setCopiedType(null), 2000);
        } catch (err) {
            toast.error("Failed to copy code");
        }
    };

    return (
        <Card className="flex flex-col relative overflow-hidden transition-all duration-300 hover:border-primary/50 group">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <Code2 className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle className="text-xl">Website Widgets</CardTitle>
                    <CardDescription>Embed a review carousel or rating badge</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Showcase your top reviews directly on your website to build trust and increase conversions. Both widgets update automatically.
                </p>

                <div className="space-y-2 mt-auto">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Carousel embed</p>
                    <div className="space-y-2">
                        <pre className="p-3 bg-foreground text-background rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                            {carouselEmbedCode}
                        </pre>
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPreviewType("carousel")}>
                                <Eye className="mr-1 h-4 w-4" />
                                Preview
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleCopy("carousel")}>
                                {copiedType === "carousel" ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                                {copiedType === "carousel" ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Badge embed</p>
                    <div className="space-y-2">
                        <pre className="p-3 bg-foreground text-background rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                            {badgeEmbedCode}
                        </pre>
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPreviewType("badge")}>
                                <Eye className="mr-1 h-4 w-4" />
                                Preview
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleCopy("badge")}>
                                {copiedType === "badge" ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                                {copiedType === "badge" ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>

            <Dialog open={previewType !== null} onOpenChange={(open) => !open && setPreviewType(null)}>
                <DialogContent className="sm:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>
                            {previewType === "badge" ? "Badge Widget Preview" : "Carousel Widget Preview"}
                        </DialogTitle>
                        <DialogDescription>
                            Live preview of your embeddable widget for this business.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="w-full overflow-hidden rounded-lg border border-border bg-background">
                        {previewType ? (
                            <iframe
                                src={previewType === "badge" ? badgePreviewUrl : carouselPreviewUrl}
                                title={previewType === "badge" ? "Badge preview" : "Carousel preview"}
                                className="w-full border-0"
                                style={{ minHeight: previewType === "badge" ? 360 : 440 }}
                            />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
