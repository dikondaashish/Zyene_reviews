export type ReportBranding = { name: string; primaryColor: string; logoUrl: string | null; hidePoweredBy: boolean };

export function applyReportBranding(template: string, branding: ReportBranding): string {
    const brand = branding.logoUrl
        ? `<img src="${branding.logoUrl.replace(/"/g, "&quot;")}" alt="${branding.name.replace(/"/g, "&quot;")}" height="40">`
        : branding.name;
    return template
        .replaceAll("BRAND_COLOR", branding.primaryColor)
        .replaceAll("BRAND", brand)
        .replaceAll("POWERED_BY", branding.hidePoweredBy ? "" : "Powered by Zyene Reviews");
}
