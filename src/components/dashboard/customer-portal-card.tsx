"use client";

import { useState, useEffect } from "react";
import { Download, Printer, Share2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function CustomerPortalCard({ businessSlug, businessId }: { businessSlug: string, businessId: string }) {
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "collectratings.com";
    const portalUrl = `https://${domain.replace("localhost:3000", "collectratings.com")}/${businessSlug}`;

    useEffect(() => {
        if (!businessId) return;
        const fetchQr = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/businesses/${businessId}/qr-code`);
                if (res.ok) {
                    const data = await res.json();
                    setQrDataUrl(data.qrCodeDataUrl);
                }
            } catch (e) {
                console.error("Failed to load QR code", e);
            } finally {
                setLoading(false);
            }
        };
        fetchQr();
    }, [businessId]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(portalUrl);
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Leave us a review!",
                    url: portalUrl,
                });
                return;
            } catch {}
        }
        handleCopyLink();
    };

    return (
        <div className="h-full rounded-[24px] bg-[#223122] p-6 lg:p-8 flex flex-col justify-between overflow-hidden relative border border-[#3e4a3e]/30 shadow-sm min-h-[360px]">
            {/* Background decorative blob */}
            <svg className="absolute -right-8 -top-8 w-[280px] h-[280px] opacity-[0.03] text-white pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.6,-46.3C91.4,-33.5,98,-18.1,97.7,-2.8C97.4,12.5,90.2,27.7,80.1,40.6C70,53.5,57.1,64.1,42.8,71.4C28.5,78.7,12.8,82.8,-1.9,86.1C-16.7,89.4,-30.3,91.9,-43.3,86.9C-56.3,81.9,-68.8,69.5,-78.1,55.1C-87.5,40.8,-93.8,24.6,-94.1,8.4C-94.4,-7.8,-88.7,-24,-79.3,-38C-69.8,-52,-56.7,-63.9,-42.6,-71C-28.5,-78.1,-13.4,-80.4,1.4,-82.9C16.3,-85.4,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>

            <div className="relative z-10">
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">
                    YOUR CUSTOMER PORTAL
                </p>
                <h2 className="text-[28px] font-serif text-white/95 leading-tight mb-3" style={{ fontFamily: "Georgia, serif" }}>
                    Share it. Collect reviews.<br/>Drive repeat orders.
                </h2>
                <p className="text-[13px] text-white/60 leading-relaxed max-w-[90%] mb-6">
                    One link. Leave it on receipts, tables, or the door. We handle the rest.
                </p>
            </div>

            <div className="relative z-10 w-full space-y-3">
                {/* Link Box */}
                <div className="flex items-center justify-between bg-[#2f3d2f] rounded-[10px] p-1.5 pl-4 border border-white/5 hover:bg-[#384738] transition-colors cursor-pointer group" onClick={handleCopyLink}>
                    <div className="flex items-center gap-3 overflow-hidden text-white/80">
                        <Share2 className="w-4 h-4 text-white/40 shrink-0" />
                        <span className="text-[13px] truncate tracking-tight">{domain.replace("localhost:3000", "collectratings.com")}/{businessSlug}</span>
                    </div>
                    <div className="bg-[#1a251a] group-hover:bg-[#1a251a]/80 text-white/90 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors flex items-center justify-center shrink-0">
                        {copied ? "Copied" : "Copy"}
                    </div>
                </div>

                {/* 4 Action Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <Dialog open={showQr} onOpenChange={setShowQr}>
                        <Button variant="ghost" onClick={() => setShowQr(true)} className="w-full bg-[#d65d45] hover:bg-[#c2513a] text-white hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]">
                            <QrCode className="w-3.5 h-3.5 mr-2" />
                            Show QR code
                        </Button>
                        <DialogContent className="sm:max-w-md p-8 border-none flex flex-col items-center">
                            <DialogTitle className="text-center font-serif text-2xl mb-4">Scan to Review</DialogTitle>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border mt-2 mb-6 min-h-[240px] flex items-center justify-center">
                                {loading ? (
                                    <div className="text-sm text-muted-foreground">Loading...</div>
                                ) : qrDataUrl ? (
                                    <img src={qrDataUrl} alt="QR Code" className="w-[240px] h-[240px]" style={{ imageRendering: 'pixelated' }} />
                                ) : (
                                    <div className="text-sm text-muted-foreground">Failed to load QR code</div>
                                )}
                            </div>
                            <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => setShowQr(false)}>Close</Button>
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" onClick={handleShare} className="w-full bg-[#2f3d2f] hover:bg-[#384738] text-white/80 hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]">
                        <Share2 className="w-3.5 h-3.5 mr-2 opacity-70" />
                        Share link
                    </Button>
                    <Button variant="ghost" onClick={() => toast.info("Download available soon.")} className="w-full bg-[#2f3d2f] hover:bg-[#384738] text-white/80 hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]">
                        <Download className="w-3.5 h-3.5 mr-2 opacity-70" />
                        Download
                    </Button>
                    <Button variant="ghost" onClick={() => window.print()} className="w-full bg-[#2f3d2f] hover:bg-[#384738] text-white/80 hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]">
                        <Printer className="w-3.5 h-3.5 mr-2 opacity-70" />
                        Print poster
                    </Button>
                </div>
            </div>
        </div>
    );
}
