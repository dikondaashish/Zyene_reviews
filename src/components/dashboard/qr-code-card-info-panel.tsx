"use client";

import { Copy, Check, QrCode } from "lucide-react";
import { getDisplayDomain } from "@/components/dashboard/qr-code-helpers";

export function QrCodeCardInfoPanel({
    businessName,
    portalTitle,
    description,
    businessSlug,
    copied,
    onCopyLink,
}: {
    businessName: string;
    portalTitle: string;
    description: string;
    businessSlug: string;
    copied: boolean;
    onCopyLink: () => void;
}) {
    const domain = getDisplayDomain();
    return (
        <div className="flex min-w-0 flex-1 flex-col justify-center p-6 md:py-10 md:pl-16 md:pr-8 lg:pl-24">
            <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 text-muted-foreground">
                    <QrCode className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">{businessName}</h2>
                    <h3 className="text-xl font-medium text-foreground mb-4">{portalTitle}</h3>
                    <p className="text-muted-foreground text-base max-w-md mb-6 leading-relaxed">{description}</p>
                    <div
                        onClick={onCopyLink}
                        className="flex max-w-full items-center text-sm font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                        <span className="truncate" title={`${domain}/${businessSlug}`}>
                            {domain}/{businessSlug}
                        </span>
                        {copied ? <Check className="w-4 h-4 ml-2 text-green-500" /> : <Copy className="w-4 h-4 ml-2" />}
                    </div>
                </div>
            </div>
        </div>
    );
}
