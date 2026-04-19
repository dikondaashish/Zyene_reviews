"use client";

import { useState, useEffect, useCallback } from "react";
import { SlugEditor } from "./slug-editor";
import { BrandingForm } from "./branding-form";

import { ReviewContentForm } from "./review-content-form";
import { PublicReviewFlow } from "@/app/r/[slug]/review-flow";
import { cn } from "@/lib/utils";
import {
    DEFAULT_BRAND_COLOR_HEX,
    DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
    reviewPageBackdropGradient,
} from "@/lib/utils/review-page-background";
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
import type {
    PublicProfileBusinessRecord,
    PublicProfilePreviewValues,
} from "@/types/components";

interface PublicProfileEditorProps {
    business: PublicProfileBusinessRecord;
    initialSlug: string;
}

export function PublicProfileEditor({ business, initialSlug }: PublicProfileEditorProps) {
    const [previewState, setPreviewState] = useState<PublicProfilePreviewValues>({
        slug: initialSlug,
        brand_color: business.brand_color || DEFAULT_BRAND_COLOR_HEX,
        review_page_background_color:
            (business.review_page_background_color &&
                /^#([0-9A-F]{3}){1,2}$/i.test(business.review_page_background_color) &&
                business.review_page_background_color) ||
            DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
        logo_url: business.logo_url,
        min_stars_for_google: business.min_stars_for_google || 4,
        rating_style: business.rating_style || "emoji",
        enable_staff_selection: business.enable_staff_selection || false,
        staff_names: business.staff_names || [],
        welcome_message: business.welcome_message ?? undefined,
        apology_message: business.apology_message ?? undefined,
        rating_subtitle: business.rating_subtitle ?? undefined,
        tags_heading: business.tags_heading ?? undefined,
        tags_subheading: business.tags_subheading ?? undefined,
        custom_tags: business.custom_tags,
        google_heading: business.google_heading ?? undefined,
        google_subheading: business.google_subheading ?? undefined,
        google_button_text: business.google_button_text ?? undefined,
        google_review_url: business.google_review_url ?? undefined,
        negative_subheading: business.negative_subheading ?? undefined,
        negative_textarea_placeholder: business.negative_textarea_placeholder ?? undefined,
        negative_button_text: business.negative_button_text ?? undefined,
        private_feedback_email_mode:
            business.private_feedback_email_mode === "hidden" ||
            business.private_feedback_email_mode === "optional" ||
            business.private_feedback_email_mode === "required"
                ? business.private_feedback_email_mode
                : "optional",
        private_feedback_phone_mode:
            business.private_feedback_phone_mode === "hidden" ||
            business.private_feedback_phone_mode === "optional" ||
            business.private_feedback_phone_mode === "required"
                ? business.private_feedback_phone_mode
                : "hidden",
        private_feedback_offer_mode:
            business.private_feedback_offer_mode === "visible" ? "visible" : "hidden",
        private_feedback_offer_message: (business.private_feedback_offer_message as string | null) ?? "",
        thank_you_heading: business.thank_you_heading ?? undefined,
        thank_you_message: business.thank_you_message ?? undefined,
        footer_text: business.footer_text ?? undefined,
        footer_company_name: business.footer_company_name ?? undefined,
        footer_link: business.footer_link ?? undefined,
        footer_logo_url: business.footer_logo_url,
        hide_branding: business.hide_branding ?? false,
    });

    const [activeTab, setActiveTab] = useState("rating");

    const handleValuesChange = useCallback((values: Partial<PublicProfilePreviewValues>) => {
        setPreviewState(prev => ({ ...prev, ...values }));
    }, []);

    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab);
    }, []);

    // Map content tabs to flow steps
    const getPreviewStep = (tab: string): "rating" | "tags" | "generating" | "review" | "thankyou" | "negative" => {
        switch (tab) {
            case "rating": return "rating";
            case "tags": return "tags";
            case "google": return "review";
            case "feedback": return "negative";
            case "success": return "thankyou";
            default: return "rating";
        }
    };
    
    const previewStep = getPreviewStep(activeTab);

    const handleSlugChange = useCallback((slug: string) => {
        handleValuesChange({ slug });
    }, [handleValuesChange]);

    const handleLogoChange = useCallback((url: string | null) => {
        handleValuesChange({ logo_url: url });
    }, [handleValuesChange]);

    const previewUrl = `zyenereviews.com/${previewState.slug || initialSlug}`;
    const fullUrl = `https://${previewUrl}`;
    const previewBackdrop =
        previewState.review_page_background_color &&
        /^#([0-9A-F]{3}){1,2}$/i.test(previewState.review_page_background_color)
            ? reviewPageBackdropGradient(previewState.review_page_background_color)
            : reviewPageBackdropGradient(DEFAULT_REVIEW_PAGE_BACKGROUND_HEX);

    // Share & QR state
    const [copied, setCopied] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    // After slug save + router.refresh(), keep preview + share URL aligned with server slug
    useEffect(() => {
        setPreviewState((prev) => ({ ...prev, slug: initialSlug }));
    }, [initialSlug]);

    // QR image is generated from DB slug; drop cache when canonical slug changes so we never show an old link
    useEffect(() => {
        setQrDataUrl(null);
    }, [initialSlug]);

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
            const res = await fetch(`/api/businesses/${business.id}/qr-code`, {
                credentials: "include",
            });
            const data = (await res.json().catch(() => ({}))) as {
                qrCodeDataUrl?: string;
                error?: string;
            };
            if (!res.ok || !data.qrCodeDataUrl) {
                throw new Error(
                    typeof data.error === "string" ? data.error : "Failed to load QR code"
                );
            }
            setQrDataUrl(data.qrCodeDataUrl);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to load QR code");
        } finally {
            setQrLoading(false);
        }
    }, [business.id]);

    useEffect(() => {
        if (qrDialogOpen && !qrDataUrl) fetchQrCode();
    }, [qrDialogOpen, qrDataUrl, fetchQrCode]);

    const handleDownloadQr = () => {
        if (!qrDataUrl) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = 500;
        const height = 650;
        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, 16);
        ctx.fill();

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(20, 20, width - 40, height - 40, 16);
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Leave a Review", width / 2, 90);

        const qrImg = new Image();
        qrImg.onload = () => {
            const qrSize = 300;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(qrImg, (width - qrSize) / 2, 120, qrSize, qrSize);

            ctx.fillStyle = "#666666";
            ctx.font = "14px sans-serif";
            ctx.fillText(previewUrl, width / 2, 470);

            ctx.fillStyle = "#999999";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText("Powered by Zyene", width / 2, 520);

            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `${previewState.slug || initialSlug || "review"}-qr-code.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("QR code downloaded!");
        };
        qrImg.src = qrDataUrl;
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
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
            {/* Left Column: Forms */}
            <div className="space-y-8 w-full min-w-0 order-2 xl:order-1">
                <SlugEditor
                    businessId={business.id}
                    initialSlug={initialSlug}
                    onSlugChange={handleSlugChange}
                />

                <BrandingForm
                    business={business}
                    onValuesChange={handleValuesChange}
                    onLogoChange={handleLogoChange}
                />

                <ReviewContentForm
                    businessId={business.id}
                    onValuesChange={handleValuesChange}
                    onTabChange={handleTabChange}
                />
            </div>

            {/* Right Column: Preview (Sticky on xl+) */}
            <div className="hidden xl:flex flex-col gap-5 sticky top-6 order-1 xl:order-2">
                <div>
                    <div className="flex items-center gap-2 mb-3 justify-start px-1">
                        <span className="text-xs font-semibold text-muted-foreground/80 tracking-widest uppercase">PREVIEW</span>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>

                    {/* Preview Container */}
                    <div className="mx-auto h-[700px] w-full rounded-[2.5rem] overflow-hidden relative border-[4px] border-foreground ring-1 ring-border">
                        {/* Status Bar Area (Mock) */}
                        <div className="h-8 w-full bg-transparent absolute top-0 z-20 pointer-events-none" />

                        {/* Content */}
                        <div
                            className="h-full w-full overflow-y-auto no-scrollbar"
                            style={{ background: previewBackdrop }}
                        >
                            <PublicReviewFlow
                                businessId={business.id}
                                businessName={business.name}
                                businessCategory={business.category || ""}
                                brandColor={previewState.brand_color}
                                reviewPageBackgroundColor={previewState.review_page_background_color}
                                logoUrl={previewState.logo_url ?? undefined}
                                minStars={previewState.min_stars_for_google}
                                ratingStyle={previewState.rating_style}
                                welcomeMsg={previewState.welcome_message}
                                apologyMsg={previewState.apology_message}
                                ratingSubtitle={previewState.rating_subtitle}
                                tagsHeading={previewState.tags_heading}
                                tagsSubheading={previewState.tags_subheading}
                                customTags={previewState.custom_tags ?? undefined}
                                enableStaffSelection={previewState.enable_staff_selection}
                                staffNames={previewState.staff_names}
                                googleHeading={previewState.google_heading}
                                googleSubheading={previewState.google_subheading}
                                googleButtonText={previewState.google_button_text}
                                googleUrl={previewState.google_review_url}
                                negativeSubheading={previewState.negative_subheading}
                                negativeTextareaPlaceholder={previewState.negative_textarea_placeholder}
                                negativeButtonText={previewState.negative_button_text}
                                privateFeedbackEmailMode={previewState.private_feedback_email_mode}
                                privateFeedbackPhoneMode={previewState.private_feedback_phone_mode}
                                privateFeedbackOfferMode={previewState.private_feedback_offer_mode}
                                privateFeedbackOfferMessage={previewState.private_feedback_offer_message}
                                thankYouHeading={previewState.thank_you_heading}
                                thankYouMessage={previewState.thank_you_message}
                                footerText={previewState.footer_text}
                                footerCompanyName={previewState.footer_company_name}
                                footerLink={previewState.footer_link}
                                footerLogoUrl={previewState.footer_logo_url ?? undefined}
                                hideBranding={previewState.hide_branding}
                                isPreview={true}
                                previewStep={previewStep}
                                className="min-h-full w-full rounded-[2rem]"
                            />
                        </div>
                    </div>
                </div>

                {/* Shareable Link Section */}
                <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                    <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0 border border-primary/20">
                            <LinkIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm truncate text-foreground">Shareable Link</span>
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
                                ? "bg-chart-2 hover:bg-chart-2/90 text-primary-foreground"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground"
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
                        className="h-10 w-10 rounded-lg border border-border bg-card flex items-center justify-center shrink-0 hover:bg-muted transition-colors"
                        aria-label="Show QR Code"
                    >
                        <QrCode className="h-5 w-5 text-muted-foreground" />
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
                            <div className="bg-card p-4 rounded-xl border border-border">
                                {qrLoading ? (
                                    <div className="h-[200px] w-[200px] flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            </div>
        </div>
    );
}
