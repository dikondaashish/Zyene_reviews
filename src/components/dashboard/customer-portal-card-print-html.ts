import { toast } from "sonner";
import { CUSTOMER_PORTAL_GOOGLE_G_SVG } from "@/components/dashboard/customer-portal-card-constants";

export function openCustomerPortalPrintWindow(params: {
    qrDataUrl: string;
    businessSlug: string;
    businessName: string;
    businessLogoUrl?: string | null;
    posterBg: string;
    posterFg: string;
    domain: string;
}): void {
    const { qrDataUrl, businessSlug, businessName, businessLogoUrl, posterBg, posterFg, domain } = params;

    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (!printWindow) {
        toast.error("Please allow popups to print.");
        return;
    }

    const logoHtml = businessLogoUrl
        ? `<img src="${businessLogoUrl}" alt="${businessName}" class="logo" crossorigin="anonymous" />`
        : "";

    printWindow.document.write(`
            <html>
                <head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Inter', system-ui, sans-serif; 
                            background: rgb(245,245,245); 
                            display: flex; justify-content: center; align-items: flex-start;
                            padding: 40px;
                        }
                        .card { 
                            background: ${posterBg} !important; 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact;
                            border-radius: 40px; 
                            overflow: hidden; 
                            width: 600px; 
                            box-shadow: 0 4px 50px rgba(0,0,0,0.15); 
                            text-align: center; 
                            color: ${posterFg} !important; 
                            padding: 60px 40px; 
                            border: 12px solid ${posterFg === "rgb(255,255,255)" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
                            page-break-inside: avoid;
                        }
                        .logo { max-height: 70px; max-width: 250px; object-fit: contain; margin-bottom: 20px; }
                        .biz-name { font-size: 32px; font-weight: 700; margin-bottom: 20px; line-height: 1.2; }
                        .divider { height: 1px; background: ${posterFg === "rgb(255,255,255)" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}; margin: 0 40px 30px; }
                        .cta-pill { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 14px 36px; border-radius: 999px; background: ${posterFg === "rgb(255,255,255)" ? "rgb(0,0,0)" : "rgba(0,0,0,0.85)"}; color: rgb(255,255,255); font-weight: 600; font-size: 16px; margin-bottom: 30px; }
                        .cta-pill img { width: 24px; height: 24px; }
                        .stars { display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; }
                        .stars svg { width: 28px; height: 28px; }
                        .qr-frame { display: inline-block; border-radius: 20px; background: rgb(255,255,255); padding: 16px; margin-bottom: 30px; }
                        .qr-frame img { width: 340px; height: 340px; image-rendering: pixelated; display: block; }
                        .url { color: ${posterFg === "rgb(255,255,255)" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"}; font-size: 16px; margin-bottom: 20px; font-weight: 500; }
                        .powered { font-weight: 700; font-size: 13px; color: ${posterFg === "rgb(255,255,255)" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}; letter-spacing: 1px; }
                        @media print { 
                            body { background: rgb(255,255,255) !important; padding: 20px !important; } 
                            .card { 
                                box-shadow: none !important; 
                                margin: 0 auto !important;
                                width: 550px !important;
                            } 
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        ${logoHtml}
                        <div class="biz-name">${businessName || "Business"}</div>
                        <div class="divider"></div>
                        <div class="cta-pill">
                            <img src="${CUSTOMER_PORTAL_GOOGLE_G_SVG}" alt="Google" />
                            <span>Scan to Leave Us a Google Review</span>
                        </div>
                        <div class="stars">
                            ${Array(5)
                                .fill(
                                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgb(255,193,7)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'
                                )
                                .join("")}
                        </div>
                        <div class="qr-frame"><img src="${qrDataUrl}" alt="QR" /></div>
                        <div class="url">${domain}/${businessSlug}</div>
                        <div class="powered">Powered by Zyene Reviews</div>
                    </div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
    printWindow.document.close();
    printWindow.focus();
}
