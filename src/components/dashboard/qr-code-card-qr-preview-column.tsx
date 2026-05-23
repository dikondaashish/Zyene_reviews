"use client";

import { Copy, Check, Download, Printer, Share2, QrCode, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getDisplayDomain } from "@/components/dashboard/qr-code-helpers";

export function QrCodeCardQrPreviewColumn({
    businessName,
    businessSlug,
    dictTapIcon,
    dictReviewPage,
    dictDownloadShort,
    dictShareLink,
    dictPrintShort,
    dictOrderNow,
    loading,
    error,
    qrDataUrl,
    copied,
    onCopyLink,
    onDownload,
    onPrint,
    onShare,
}: {
    businessName: string;
    businessSlug: string;
    dictTapIcon: string;
    dictReviewPage: string;
    dictDownloadShort: string;
    dictShareLink: string;
    dictPrintShort: string;
    dictOrderNow: string;
    loading: boolean;
    error: boolean;
    qrDataUrl: string | null;
    copied: boolean;
    onCopyLink: () => void;
    onDownload: () => void;
    onPrint: () => void;
    onShare: () => void;
}) {
    const domain = getDisplayDomain();
    return (
        <div className="flex w-full flex-col items-center justify-center border-t border-border/60 bg-canvas-elevated p-6 md:w-auto md:min-w-[280px] md:border-t-0 md:py-10 md:pl-8 md:pr-16 lg:pl-12 lg:pr-24">
            <Dialog>
                <DialogTrigger asChild>
                    <div className="group cursor-pointer flex flex-col items-center justify-center">
                        <div className="mb-6 flex items-center justify-center rounded-[2rem] border-[4px] border-border bg-muted/60 p-6 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/25 size-[228px]">
                            <QrCode className="text-foreground size-[140px]" strokeWidth={1} />
                        </div>
                        <p className="text-[13px] text-foreground font-medium text-center group-hover:text-primary transition-colors">
                            {dictTapIcon}
                        </p>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-8 border-none">
                    <DialogTitle className="sr-only">QR Code for {businessName}</DialogTitle>
                    <div className="flex flex-col items-center mb-2">
                        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
                            {businessName} {dictReviewPage}
                        </h2>
                        <div
                            onClick={onCopyLink}
                            className="flex max-w-full items-center text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors mx-auto"
                        >
                            <span className="truncate" title={`${domain}/${businessSlug}`}>
                                {domain}/{businessSlug}
                            </span>
                            {copied ? (
                                <Check className="ml-1.5 text-green-500 size-3.5" />
                            ) : (
                                <Copy className="ml-1.5 size-3.5" />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center my-6">
                        {loading ? (
                            <Skeleton className="rounded-xl size-[220px]" />
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center gap-3 bg-muted rounded-xl border border-dashed size-[220px]">
                                <p className="text-sm text-muted-foreground">Couldn't load QR code.</p>
                            </div>
                        ) : (
                            <img
                                src={qrDataUrl!}
                                alt={`QR code for ${businessName}`}
                                className="size-[220px]"
                                style={{ imageRendering: "pixelated" }}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button
                            variant="outline"
                            onClick={onDownload}
                            disabled={!qrDataUrl}
                            className="h-10 w-full rounded-xl border border-border/70 bg-card/80 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-border hover:bg-muted hover:shadow-md"
                        >
                            <Download className="mr-2 size-4" />
                            {dictDownloadShort}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onShare}
                            className="h-10 w-full rounded-xl border border-border/70 bg-card/80 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-border hover:bg-muted hover:shadow-md"
                        >
                            <Share2 className="mr-2 size-4" />
                            {dictShareLink}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onPrint}
                            disabled={!qrDataUrl}
                            className="h-10 w-full rounded-xl border border-border/70 bg-card/80 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-border hover:bg-muted hover:shadow-md"
                        >
                            <Printer className="mr-2 size-4" />
                            {dictPrintShort}
                        </Button>
                        <Button
                            onClick={() => toast.info("Order QR coming soon!")}
                            className="h-10 w-full rounded-xl bg-foreground text-sm font-medium text-background shadow-sm transition-all duration-200 hover:bg-foreground/90"
                        >
                            <ShoppingCart className="mr-2 size-4" />
                            {dictOrderNow}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
