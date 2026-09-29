import Image from "next/image";
import { Download, Printer, Share2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type CustomerPortalCardActionsFooterProps = {
    domain: string;
    businessSlug: string;
    copied: boolean;
    showQr: boolean;
    onShowQrChange: (open: boolean) => void;
    loading: boolean;
    qrDataUrl: string | null;
    onCopyLink: () => void;
    onShare: () => void;
    onDownload: () => void;
    onPrint: () => void;
};

export function CustomerPortalCardActionsFooter({
    domain,
    businessSlug,
    copied,
    showQr,
    onShowQrChange,
    loading,
    qrDataUrl,
    onCopyLink,
    onShare,
    onDownload,
    onPrint,
}: CustomerPortalCardActionsFooterProps) {
    return (
        <div className="relative z-10 w-full space-y-3">
            <button
                type="button"
                aria-label={copied ? "Review link copied" : "Copy review link"}
                className="flex w-full items-center justify-between bg-muted rounded-[10px] p-1.5 pl-4 border border-border hover:bg-accent transition-colors group focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                onClick={onCopyLink}
            >
                <span className="flex items-center gap-3 overflow-hidden text-foreground">
                    <Share2 className="text-muted-foreground shrink-0 size-4" />
                    <span className="text-[13px] truncate tracking-tight">
                        {domain}/{businessSlug}
                    </span>
                </span>
                <span aria-live="polite" className="bg-card group-hover:bg-background text-foreground px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors flex items-center justify-center shrink-0">
                    {copied ? "Copied" : "Copy"}
                </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
                <Dialog open={showQr} onOpenChange={onShowQrChange}>
                    <Button
                        variant="ghost"
                        onClick={() => onShowQrChange(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground border-0 h-10 rounded-[10px] font-medium text-[12px]"
                    >
                        <QrCode className="mr-2 size-3.5" />
                        Show QR code
                    </Button>
                    <DialogContent className="sm:max-w-md p-8 border-none flex flex-col items-center">
                        <DialogTitle className="text-center font-serif text-2xl mb-4">Scan to Review</DialogTitle>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border mt-2 mb-6 min-h-[240px] flex items-center justify-center">
                            {loading ? (
                                <div className="text-sm text-muted-foreground">Loading...</div>
                            ) : qrDataUrl ? (
                                <Image
                                    src={qrDataUrl}
                                    alt="QR Code"
                                    width={240}
                                    height={240}
                                    unoptimized
                                    className="size-[240px]"
                                    style={{ imageRendering: "pixelated" }}
                                />
                            ) : (
                                <div className="text-sm text-muted-foreground">Failed to load QR code</div>
                            )}
                        </div>
                        <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => onShowQrChange(false)}>
                            Close
                        </Button>
                    </DialogContent>
                </Dialog>

                <Button
                    variant="ghost"
                    onClick={onShare}
                    className="w-full bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground border-0 h-10 rounded-[10px] font-medium text-[12px]"
                >
                    <Share2 className="mr-2 opacity-70 size-3.5" />
                    Share link
                </Button>
                <Button
                    variant="ghost"
                    onClick={onDownload}
                    disabled={!qrDataUrl}
                    className="w-full bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground border-0 h-10 rounded-[10px] font-medium text-[12px]"
                >
                    <Download className="mr-2 opacity-70 size-3.5" />
                    Download
                </Button>
                <Button
                    variant="ghost"
                    onClick={onPrint}
                    disabled={!qrDataUrl}
                    className="w-full bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground border-0 h-10 rounded-[10px] font-medium text-[12px]"
                >
                    <Printer className="mr-2 opacity-70 size-3.5" />
                    Print poster
                </Button>
            </div>
        </div>
    );
}
