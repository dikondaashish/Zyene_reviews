import Image from "next/image";

type CustomerPortalCardQrPreviewProps = {
    loading: boolean;
    qrDataUrl: string | null;
};

export function CustomerPortalCardQrPreview({ loading, qrDataUrl }: CustomerPortalCardQrPreviewProps) {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center mb-6">
            <h3 className="text-[28px] font-bold text-card-foreground mb-2">Scan to Review</h3>
            <div className="bg-white p-4 rounded-[20px] shadow-lg border border-border">
                {loading ? (
                    <div className="flex items-center justify-center text-[11px] text-muted-foreground font-medium bg-muted rounded-xl size-[180px]">
                        Generating...
                    </div>
                ) : qrDataUrl ? (
                    <Image
                        src={qrDataUrl}
                        alt="Scan to Review"
                        width={180}
                        height={180}
                        unoptimized
                        className="display-block size-[180px]"
                        style={{ imageRendering: "pixelated" }}
                    />
                ) : (
                    <div className="flex items-center justify-center text-[11px] text-destructive font-medium bg-card rounded-xl size-[180px]">
                        Failed to load QR
                    </div>
                )}
            </div>
        </div>
    );
}
