"use client";
 
import { useState, useEffect, useCallback } from "react";
import { PublicProfileForm } from "./public-profile-form";
import { PublicReviewFlow } from "@/app/r/[slug]/review-flow";
import { QrCode, Download, Printer, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
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
 
    const handleValuesChange = useCallback((values: any) => {
        setPreviewState(prev => ({ ...prev, ...values }));
    }, []);
 
    const previewUrl = `zyenereviews.com/${previewState.slug}`;
    const fullUrl = `https://${previewUrl}`;
 
    // Share & QR state
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
 
    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: `${business.name} — Leave a Review`, url: fullUrl });
                return;
            } catch { /* user cancelled */ }
        }
        try {
            await navigator.clipboard.writeText(fullUrl);
            toast.success("Link copied to clipboard!");
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
 
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
 
        const width = 500;
        const height = 650;
        canvas.width = width;
        canvas.height = height;
 
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        // @ts-ignore
        ctx.roundRect(0, 0, width, height, 16);
        ctx.fill();
 
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        // @ts-ignore
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
            link.download = `${previewState.slug}-qr-code.png`;
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
        <div className="flex flex-col xl:flex-row gap-12 items-start pb-20">
            {/* Left Column: Form */}
            <div className="flex-1 w-full min-w-0">
                <PublicProfileForm 
                    business={business} 
                    onValuesChange={handleValuesChange} 
                />
            </div>
 
            {/* Right Column: Preview & Share */}
            <div className="hidden xl:flex flex-col gap-8 w-[400px] flex-shrink-0 sticky top-6">
                <div>
                    <div className="flex items-center gap-2 mb-4 justify-start px-2">
                        <span className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">LIVE PREVIEW</span>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>
 
                    {/* Preview Container */}
                    <div className="mx-auto h-[780px] w-full bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative border-[8px] border-slate-900 ring-4 ring-slate-100/50">
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
                                className="min-h-full w-full"
                            />
                        </div>
                    </div>
                </div>
 
                {/* Share & QR Section */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex gap-8 items-center relative overflow-hidden group">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors" />
                    
                    {/* Left: Actions & Icon */}
                    <div className="flex flex-col gap-4 shrink-0 relative">
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleDownloadQr} className="p-3 bg-slate-50 hover:bg-white border hover:border-blue-200 rounded-2xl flex items-center justify-center transition-all hover:shadow-md group/btn" title="Download">
                                <Download className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-600" />
                            </button>
                            <button onClick={handlePrintQr} className="p-3 bg-slate-50 hover:bg-white border hover:border-blue-200 rounded-2xl flex items-center justify-center transition-all hover:shadow-md group/btn" title="Print">
                                <Printer className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-600" />
                            </button>
                            <button onClick={() => toast.info("Coming soon!")} className="p-3 bg-slate-50 hover:bg-white border hover:border-blue-200 rounded-2xl flex items-center justify-center transition-all hover:shadow-md group/btn" title="Order QR Now">
                                <QrCode className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-600" />
                            </button>
                            <button onClick={handleShare} className="p-3 bg-slate-50 hover:bg-white border hover:border-blue-200 rounded-2xl flex items-center justify-center transition-all hover:shadow-md group/btn" title="Share link">
                                <Share2 className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-600" />
                            </button>
                        </div>
 
                        <div className="flex flex-col items-center">
                            <button 
                                onClick={() => setQrDialogOpen(true)}
                                className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-white relative group/qr"
                            >
                                <QrCode className="h-8 w-8" />
                                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <div className="h-1 w-1 bg-white rounded-full animate-ping" />
                                </div>
                            </button>
                            <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight text-center">QR Code for {business.name}</span>
                            <span className="text-[9px] text-slate-300 mt-0.5 text-center">Tap icon to view</span>
                        </div>
                    </div>
 
                    {/* Right: Info */}
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-lg leading-tight">{business.name}</h4>
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Your Review Portal</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">
                            Share this with customers to collect reviews and drive orders.
                        </p>
                        <div className="mt-6 flex flex-col gap-1">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Live Link</p>
                            <div className="flex items-center gap-2 group/link cursor-pointer" onClick={handleShare}>
                                <span className="text-sm font-bold text-slate-900 truncate">{previewUrl}</span>
                                <Share2 className="h-3 w-3 text-slate-300 group-hover/link:text-blue-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
 
                {/* QR Code Dialog */}
                <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                    <DialogContent className="sm:max-w-md rounded-[2rem] border-0 p-0 overflow-hidden">
                        <div className="bg-slate-900 p-10 text-center space-y-8 relative">
                            {/* Decorative elements for popup */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                            
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Your Direct QR Code</h2>
                                <p className="text-slate-400 text-sm">Customers can scan this to leave a review instantly.</p>
                            </div>
 
                            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl inline-block border-[6px] border-slate-800">
                                {qrLoading ? (
                                    <div className="h-[240px] w-[240px] flex items-center justify-center">
                                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                                    </div>
                                ) : qrDataUrl ? (
                                    <picture>
                                        <img src={qrDataUrl} alt="QR Code" className="h-[240px] w-[240px] rounded-2xl" />
                                    </picture>
                                ) : (
                                    <div className="h-[240px] w-[240px] flex items-center justify-center text-sm text-slate-400">Failed to load</div>
                                )}
                            </div>
 
                            <div className="flex flex-col items-center gap-4 pt-4">
                                <p className="text-blue-400 font-mono text-sm font-bold">{previewUrl}</p>
                                <div className="flex gap-3 w-full">
                                    <Button onClick={handleDownloadQr} className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl h-12 shadow-xl shadow-white/5 transition-all">
                                        <Download className="h-4 w-4 mr-2" /> Download
                                    </Button>
                                    <Button onClick={handlePrintQr} variant="outline" className="flex-1 border-slate-700 text-white hover:bg-slate-800 font-bold rounded-2xl h-12 transition-all">
                                        <Printer className="h-4 w-4 mr-2" /> Print
                                    </Button>
                                </div>
                                <button onClick={() => setQrDialogOpen(false)} className="text-xs text-slate-500 hover:text-white transition-colors font-medium">Close / Done</button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
 
                {/* Footer Message */}
                <div className="text-center px-4">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                        Need a custom design? <a href="#" className="text-blue-600 hover:underline">Contact our support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
