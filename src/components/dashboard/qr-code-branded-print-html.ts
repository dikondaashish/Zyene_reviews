import { contrastText, QR_CODE_GOOGLE_G_SVG } from "@/components/dashboard/qr-code-helpers";

export function buildQrCodePrintDocumentHtml(params: {
    businessName: string;
    businessSlug: string;
    accent: string;
    accentFg: string;
    resolvedBgColor: string;
    logoUrl: string | null;
    qrDataUrl: string;
    rootDomain: string;
}): string {
    const { businessName, businessSlug, accent, accentFg, resolvedBgColor, logoUrl, qrDataUrl, rootDomain } = params;
    const logoHtml = logoUrl
        ? `<img src="${logoUrl}" alt="${businessName}" class="logo" crossorigin="anonymous" />`
        : "";

    return `
            <html>
                <head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            background: #f5f5f5;
                            padding: 24px;
                        }
                        .card {
                            background: ${resolvedBgColor};
                            border-radius: 24px;
                            overflow: hidden;
                            max-width: 420px;
                            width: 100%;
                            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                        }
                        .accent-top { height: 8px; background: ${accent}; }
                        .accent-bottom { height: 8px; background: ${accent}; }
                        .inner { padding: 36px 32px 28px; text-align: center; }
                        .logo {
                            max-height: 56px;
                            max-width: 180px;
                            object-fit: contain;
                            margin-bottom: 16px;
                        }
                        .biz-name {
                            font-size: 24px;
                            font-weight: 700;
                            color: ${contrastText(resolvedBgColor)};
                            margin-bottom: 16px;
                        }
                        .divider {
                            height: 1px;
                            background: ${resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#e5e5e5" : "rgba(255,255,255,0.2)"};
                            margin: 0 20px 20px;
                        }
                        .cta-pill {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                            padding: 10px 28px;
                            border-radius: 999px;
                            background: ${accent};
                            color: ${accentFg};
                            font-weight: 600;
                            font-size: 15px;
                            margin-bottom: 24px;
                        }
                        .cta-pill img { width: 22px; height: 22px; }
                        .stars { display: flex; justify-content: center; gap: 10px; margin-bottom: 24px; }
                        .stars svg { width: 24px; height: 24px; }
                        .qr-frame {
                            display: inline-block;
                            border: 1.5px solid ${resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#e5e5e5" : "rgba(255,255,255,0.3)"};
                            border-radius: 16px;
                            background: #ffffff;
                            padding: 12px;
                            margin-bottom: 20px;
                        }
                        .qr-frame img {
                            width: 260px;
                            height: 260px;
                            image-rendering: pixelated;
                            display: block;
                        }
                        .url {
                            color: ${resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#888" : "rgba(255,255,255,0.7)"};
                            font-size: 13px;
                            margin-bottom: 20px;
                        }
                        .powered {
                            font-weight: 700;
                            font-size: 11px;
                            color: ${resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#aaa" : "rgba(255,255,255,0.5)"};
                            margin-bottom: 8px;
                        }
                        @page { margin: 0; }
                        @media print {
                            body {
                                background: #ffffff;
                                padding: 1.5cm;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            .card { box-shadow: none; max-width: 100%; border: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="accent-top"></div>
                        <div class="inner">
                            ${logoHtml}
                            <div class="biz-name">${businessName}</div>
                            <div class="divider"></div>
                            <div class="cta-pill">
                                <img src="${QR_CODE_GOOGLE_G_SVG}" alt="Google" />
                                <span>Scan to Leave Us a Google Review</span>
                            </div>
                            <div class="stars">
                                ${Array(5)
                                    .fill(
                                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFC107"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'
                                    )
                                    .join("")}
                            </div>
                            <div class="qr-frame">
                                <img src="${qrDataUrl}" alt="QR Code" />
                            </div>
                            <div class="url">${rootDomain}/${businessSlug}</div>
                            <div class="powered">Powered by Zyene Reviews</div>
                        </div>
                        <div class="accent-bottom"></div>
                    </div>
                </body>
            </html>
            `;
}
