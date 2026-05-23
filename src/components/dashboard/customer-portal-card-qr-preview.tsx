type CustomerPortalCardQrPreviewProps = {
    loading: boolean;
    qrDataUrl: string | null;
};

export function CustomerPortalCardQrPreview({ loading, qrDataUrl }: CustomerPortalCardQrPreviewProps) {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center mb-6">
            <h3 className="text-[28px] font-bold text-white mb-2">Scan to Review</h3>
            <div className="bg-white p-4 rounded-[20px] shadow-lg border border-white/10">
                {loading ? (
                    <div className="w-[180px] h-[180px] flex items-center justify-center text-[11px] text-[rgb(161,161,170)] font-medium bg-[rgba(24,24,27,0.5)] rounded-xl">
                        Generating...
                    </div>
                ) : qrDataUrl ? (
                    <img
                        src={qrDataUrl}
                        alt="Scan to Review"
                        className="w-[180px] h-[180px] display-block"
                        style={{ imageRendering: "pixelated" }}
                    />
                ) : (
                    <div className="w-[180px] h-[180px] flex items-center justify-center text-[11px] text-[rgba(248,113,113,0.7)] font-medium bg-[rgba(69,10,10,0.1)] rounded-xl">
                        Failed to load QR
                    </div>
                )}
            </div>
        </div>
    );
}
