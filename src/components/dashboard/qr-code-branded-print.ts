import { toast } from "sonner";
import { contrastText, getDisplayDomain, resolveBrandColor } from "@/components/dashboard/qr-code-helpers";
import { buildQrCodePrintDocumentHtml } from "@/components/dashboard/qr-code-branded-print-html";

export function openBrandedQrPrintWindow(params: {
    businessName: string;
    businessSlug: string;
    brandColor: string | null;
    pageBgColor: string | null;
    logoUrl: string | null;
    qrDataUrl: string;
}): void {
    const printWindow = window.open("", "_blank", "width=500,height=700");
    if (!printWindow) {
        toast.error("Please allow popups to print.");
        return;
    }

    const accent = resolveBrandColor(params.brandColor);
    const accentFg = contrastText(accent);
    const resolvedBgColor = params.pageBgColor ?? "#ffffff";
    const rootDomain = getDisplayDomain();

    printWindow.document.write(
        buildQrCodePrintDocumentHtml({
            businessName: params.businessName,
            businessSlug: params.businessSlug,
            accent,
            accentFg,
            resolvedBgColor,
            logoUrl: params.logoUrl,
            qrDataUrl: params.qrDataUrl,
            rootDomain,
        })
    );
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 400);
}
