"use client";

import { Download, Printer, Share2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const secondaryActionClass =
    "h-10 w-full justify-start rounded-xl border border-border/70 bg-card/80 px-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-border hover:bg-muted hover:shadow-md";

const primaryActionClass =
    "h-10 w-full justify-start rounded-xl bg-foreground px-3 text-sm font-medium text-background shadow-sm transition-all duration-200 hover:bg-foreground/90";

export function QrCodeCardActionColumn({
    dictDownload,
    dictPrint,
    dictOrder,
    dictShare,
    onDownload,
    onPrint,
    onShare,
    qrReady,
}: {
    dictDownload: string;
    dictPrint: string;
    dictOrder: string;
    dictShare: string;
    onDownload: () => void;
    onPrint: () => void;
    onShare: () => void;
    qrReady: boolean;
}) {
    return (
        <div className="w-full px-6 py-6 flex flex-col justify-center gap-3 border-t border-border/60 md:w-auto md:border-t-0 md:border-r md:min-w-[180px] md:py-8 md:pr-8 lg:pr-12">
            <Button variant="outline" size="sm" onClick={onDownload} disabled={!qrReady} className={secondaryActionClass}>
                <Download className="h-3.5 w-3.5 mr-2" />
                {dictDownload}
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint} disabled={!qrReady} className={secondaryActionClass}>
                <Printer className="h-3.5 w-3.5 mr-2" />
                {dictPrint}
            </Button>
            <Button
                variant="default"
                size="sm"
                onClick={() => toast.info("Order QR coming soon!")}
                className={primaryActionClass}
            >
                <QrCode className="h-3.5 w-3.5 mr-2" />
                {dictOrder}
            </Button>
            <Button variant="outline" size="sm" onClick={onShare} className={secondaryActionClass}>
                <Share2 className="h-3.5 w-3.5 mr-2" />
                {dictShare}
            </Button>
        </div>
    );
}
