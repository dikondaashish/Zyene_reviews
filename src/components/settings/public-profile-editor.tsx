"use client";

import { useState, useEffect, useCallback } from "react";
import { SlugEditor } from "./slug-editor";
import { BrandingForm } from "./branding-form";

import { ReviewContentForm } from "./review-content-form";
import { PublicReviewFlow } from "@/app/r/[slug]/review-flow";
import { cn } from "@/lib/utils";
import { Link as LinkIcon, HelpCircle, QrCode, Check, Download, Printer, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface PublicProfileEditorProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    business: any;
    initialSlug: string;
}

export function PublicProfileEditor({ business, initialSlug }: PublicProfileEditorProps) {
    const [previewState, setPreviewState] = useState({
        slug: initialSlug,
        brand_color: business.brand_color || "#0f172a",
        logo_url: business.logo_url,
        min_stars_for_google: business.min_stars_for_google || 4,
        welcome_message: business.welcome_message,
        apology_message: business.apology_message,
        rating_subtitle: business.rating_subtitle,
        tags_heading: business.tags_heading,
        tags_subheading: business.tags_subheading,
        custom_tags: business.custom_tags,
        google_heading: business.google_heading,
        google_subheading: business.google_subheading,
        google_button_text: business.google_button_text,
        google_review_url: business.google_review_url,
        negative_subheading: business.negative_subheading,
        negative_textarea_placeholder: business.negative_textarea_placeholder,
        negative_button_text: business.negative_button_text,
        thank_you_heading: business.thank_you_heading,
        thank_you_message: business.thank_you_message,
        footer_text: business.footer_text,
        footer_company_name: business.footer_company_name,
        footer_link: business.footer_link,
        footer_logo_url: business.footer_logo_url,
        hide_branding: business.hide_branding,
    });

    const handleValuesChange = (values: any) => {
        setPreviewState(prev => ({ ...prev, ...values }));
    };

    const previewUrl = `zyene.in/${previewState.slug}`;
    const fullUrl = `https://${previewUrl}`;

    // Share & QR state
    const [copied, setCopied] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: `${business.name} — Leave a Review`, url: fullUrl });
                return;
            } catch { /* user cancelled */ }
        }
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const fetchQrCode = useCallback(async () => {
        setQrLoading(true);
        try {
            const res = await fetch(`/api/businesses/${business.id}/qr-code`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setQrDataUrl(data.qrCodeDataUrl);
        } catch {
            toast.error("Failed to load QR code");
        } finally {
            setQrLoading(false);
        }
    }, [business.id]);

    useEffect(() => {
        if (qrDialogOpen && !qrDataUrl) fetchQrCode();
    }, [qrDialogOpen, qrDataUrl, fetchQrCode]);

    const handleDownloadQr = () => {
        if (!qrDataUrl) return;
        const link = document.createElement("a");
        link.href = qrDataUrl;
        link.download = `${previewState.slug}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR code downloaded!");
    };

    const handlePrintQr = () => {
        if (!qrDataUrl) return;
        const printWindow = window.open("", "_blank", "width=400,height=600");
        if (!printWindow) { toast.error("Please allow popups to print."); return; }
        printWindow.document.write(`<html><head><style>body{font-family:sans-serif;text-align:center;padding:40px}.container{border:2px solid #000;padding:40px;display:inline-block;border-radius:16px}h1{margin-bottom:20px}img{width:300px;height:300px;image-rendering:pixelated}.url{margin-top:20px;color:#666;font-size:14px}.logo{font-weight:bold;margin-top:30px;font-size:12px;color:#999}</style></head><body><div class="container"><h1>Leave a Review</h1><img src="${qrDataUrl}"/><p class="url">${previewUrl}</p><p class="logo">Powered by Zyene</p></div></body></html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
    };

    return (
        <div className="flex flex-col xl:flex-row gap-12 items-start">
            {/* Left Column: Forms */}
            <div className="flex-1 space-y-8 w-full min-w-0">
                <SlugEditor
                    businessId={business.id}
                    initialSlug={initialSlug}
                    onSlugChange={(slug) => handleValuesChange({ slug })}
                />

                <BrandingForm
                    business={business}
                    onValuesChange={handleValuesChange}
                    onLogoChange={(url) => handleValuesChange({ logo_url: url })}
                />

                <ReviewContentForm
                    businessId={business.id}
                    onValuesChange={handleValuesChange}
                />
            </div>

            {/* Right Column: Preview (Simplified Model) */}
            <div className="hidden xl:flex flex-col gap-6 w-[380px] flex-shrink-0 sticky top-6">
                <div>
                    <div className="flex items-center gap-2 mb-3 justify-start px-2">
                        <span className="text-xs font-semibold text-muted-foreground/80 tracking-widest uppercase">PREVIEW</span>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>

                    {/* Preview Container */}
                    <div className="mx-auto h-[740px] w-full bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-[4px] border-slate-900 ring-1 ring-white/10">
                        {/* Status Bar Area (Mock) */}
                        <div className="h-8 w-full bg-transparent absolute top-0 z-20 pointer-events-none" />

                        {/* Content */}
                        <div className="h-full w-full overflow-y-auto no-scrollbar bg-slate-900">
                            <PublicReviewFlow
                                businessId={business.id}
                                businessName={business.name}
                                businessCategory={business.category}
                                brandColor={previewState.brand_color}
                                logoUrl={previewState.logo_url}
                                minStars={previewState.min_stars_for_google}
                                welcomeMsg={previewState.welcome_message}
                                apologyMsg={previewState.apology_message}
                                ratingSubtitle={previewState.rating_subtitle}
                                tagsHeading={previewState.tags_heading}
                                tagsSubheading={previewState.tags_subheading}
                                customTags={previewState.custom_tags}
                                googleHeading={previewState.google_heading}
                                googleSubheading={previewState.google_subheading}
                                googleButtonText={previewState.google_button_text}
                                googleUrl={previewState.google_review_url}
                                negativeSubheading={previewState.negative_subheading}
                                negativeTextareaPlaceholder={previewState.negative_textarea_placeholder}
                                negativeButtonText={previewState.negative_button_text}
                                thankYouHeading={previewState.thank_you_heading}
                                thankYouMessage={previewState.thank_you_message}
                                footerText={previewState.footer_text}
                                footerCompanyName={previewState.footer_company_name}
                                footerLink={previewState.footer_link}
                                footerLogoUrl={previewState.footer_logo_url}
                                hideBranding={previewState.hide_branding}
                                isPreview={true}
                                className="min-h-full w-full rounded-[2rem]"
                            />
                        </div>
                    </div>
                </div>

                {/* Shareable Link Section */}
                <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border p-4 flex items-center gap-3">
                    <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            <LinkIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm truncate">Shareable Link</span>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground truncate font-mono">
                                {previewUrl}
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        className={cn(
                            "shrink-0 font-semibold px-5 transition-all",
                            copied
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                        onClick={handleShare}
                    >
                        {copied ? (
                            <><Check className="h-3.5 w-3.5 mr-1.5" />COPIED</>
                        ) : (
                            "SHARE"
                        )}
                    </Button>
                    <button
                        onClick={() => setQrDialogOpen(true)}
                        className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        aria-label="Show QR Code"
                    >
                        <QrCode className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                {/* QR Code Dialog */}
                <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5" />
                                QR Code
                            </DialogTitle>
                            <DialogDescription>
                                Scan this QR code to open your review page.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-5 py-4">
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                {qrLoading ? (
                                    <div className="h-[200px] w-[200px] flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                    </div>
                                ) : qrDataUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={qrDataUrl}
                                        alt="QR Code"
                                        className="h-[200px] w-[200px] rounded-lg"
                                    />
                                ) : (
                                    <div className="h-[200px] w-[200px] flex items-center justify-center text-sm text-muted-foreground">
                                        Failed to load
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{previewUrl}</p>
                            <div className="grid grid-cols-3 gap-2 w-full">
                                <Button variant="outline" size="sm" onClick={handleDownloadQr} disabled={!qrDataUrl} className="text-xs">
                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                    Download
                                </Button>
                                <Button variant="outline" size="sm" onClick={handlePrintQr} disabled={!qrDataUrl} className="text-xs">
                                    <Printer className="h-3.5 w-3.5 mr-1.5" />
                                    Print
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleShare} className="text-xs">
                                    <Share2 className="h-3.5 w-3.5 mr-1.5" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Footer */}
                <div className="text-center px-4">
                    <p className="text-xs text-muted-foreground items-center justify-center flex gap-1">
                        Want to customize more?
                    </p>
                    <a href="#" className="text-xs text-blue-600 hover:underline font-medium mt-1 block">
                        Contact sales
                    </a>
                </div>
            </div>
        </div>
    );
}
