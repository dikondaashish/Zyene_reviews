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
            <div
                className="flex items-center justify-between bg-[rgb(47,61,47)] rounded-[10px] p-1.5 pl-4 border border-white/5 hover:bg-[rgb(56,71,56)] transition-colors cursor-pointer group"
                onClick={onCopyLink}
            >
                <div className="flex items-center gap-3 overflow-hidden text-white/80">
                    <Share2 className="text-white/40 shrink-0 size-4" />
                    <span className="text-[13px] truncate tracking-tight">
                        {domain}/{businessSlug}
                    </span>
                </div>
                <div className="bg-[rgb(26,37,26)] group-hover:bg-[rgba(26,37,26,0.8)] text-white/90 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors flex items-center justify-center shrink-0">
                    {copied ? "Copied" : "Copy"}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Dialog open={showQr} onOpenChange={onShowQrChange}>
                    <Button
                        variant="ghost"
                        onClick={() => onShowQrChange(true)}
                        className="w-full bg-[rgb(214,93,69)] hover:bg-[rgb(194,81,58)] text-white hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]"
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
                                <img
                                    src={qrDataUrl}
                                    alt="QR Code"
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
                    className="w-full bg-[rgb(47,61,47)] hover:bg-[rgb(56,71,56)] text-white/80 hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]"
                >
                    <Share2 className="mr-2 opacity-70 size-3.5" />
                    Share link
                </Button>
                <Button
                    variant="ghost"
                    onClick={onDownload}
                    disabled={!qrDataUrl}
                    className="w-full bg-[rgb(47,61,47)] hover:bg-[rgb(56,71,56)] text-white/80 hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]"
                >
                    <Download className="mr-2 opacity-70 size-3.5" />
                    Download
                </Button>
                <Button
                    variant="ghost"
                    onClick={onPrint}
                    disabled={!qrDataUrl}
                    className="w-full bg-[rgb(47,61,47)] hover:bg-[rgb(56,71,56)] text-white/80 hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]"
                >
                    <Printer className="mr-2 opacity-70 size-3.5" />
                    Print poster
                </Button>
            </div>
        </div>
    );
}
