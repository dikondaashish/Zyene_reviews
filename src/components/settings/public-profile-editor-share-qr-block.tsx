"use client";

import { cn } from "@/lib/utils";
import { Link as LinkIcon, HelpCircle, QrCode, Check, Download, Printer, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface PublicProfileEditorShareQrBlockProps {
    previewUrl: string;
    copied: boolean;
    onShare: () => void;
    onOpenQr: () => void;
    qrDialogOpen: boolean;
    onQrDialogOpenChange: (open: boolean) => void;
    qrLoading: boolean;
    qrDataUrl: string | null;
    onDownloadQr: () => void;
    onPrintQr: () => void;
}

export function PublicProfileEditorShareQrBlock({
    previewUrl,
    copied,
    onShare,
    onOpenQr,
    qrDialogOpen,
    onQrDialogOpenChange,
    qrLoading,
    qrDataUrl,
    onDownloadQr,
    onPrintQr,
}: PublicProfileEditorShareQrBlockProps) {
    return (
        <>
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
                        <p className="text-xs text-muted-foreground truncate font-mono">{previewUrl}</p>
                    </div>
                </div>
                <Button
                    size="sm"
                    className={cn(
                        "shrink-0 font-semibold px-5 transition-all",
                        copied
                            ? "bg-chart-2 hover:bg-chart-2/90 text-primary-foreground"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground",
                    )}
                    onClick={onShare}
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            COPIED
                        </>
                    ) : (
                        "SHARE"
                    )}
                </Button>
                <button
                    type="button"
                    onClick={onOpenQr}
                    className="h-10 w-10 rounded-lg border border-border bg-card flex items-center justify-center shrink-0 hover:bg-muted transition-colors"
                    aria-label="Show QR Code"
                >
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                </button>
            </div>

            <Dialog open={qrDialogOpen} onOpenChange={onQrDialogOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            QR Code
                        </DialogTitle>
                        <DialogDescription>Scan this QR code to open your review page.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-5 py-4">
                        <div className="bg-card p-4 rounded-xl border border-border">
                            {qrLoading ? (
                                <div className="h-[200px] w-[200px] flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : qrDataUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={qrDataUrl} alt="QR Code" className="h-[200px] w-[200px] rounded-lg" />
                            ) : (
                                <div className="h-[200px] w-[200px] flex items-center justify-center text-sm text-muted-foreground">
                                    Failed to load
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{previewUrl}</p>
                        <div className="grid grid-cols-3 gap-2 w-full">
                            <Button variant="outline" size="sm" onClick={onDownloadQr} disabled={!qrDataUrl} className="text-xs">
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Download
                            </Button>
                            <Button variant="outline" size="sm" onClick={onPrintQr} disabled={!qrDataUrl} className="text-xs">
                                <Printer className="h-3.5 w-3.5 mr-1.5" />
                                Print
                            </Button>
                            <Button variant="outline" size="sm" onClick={onShare} className="text-xs">
                                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                                Share
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
