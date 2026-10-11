import { escapeHtml } from "@/lib/security/html-escape";

/** Company details confirmed by the owner; use absolute URLs for inbox assets. */
export const EMAIL_BRAND = {
    name: "Zyene Reviews",
    company: "Zyene, Inc.",
    address: "28 Geary St Ste 650 #1892, San Francisco, CA 94108",
    website: "https://www.zyenereviews.com",
    logo: "https://www.zyenereviews.com/Main%20logo.png",
    support: "support@zyenereviews.com",
    accent: "#ff4f00",
    buttonText: "#18181b",
    link: "#b93800",
    darkLink: "#ffad85",
} as const;

export function emailCompanyFooter(): string {
    const linkStyle = `color:${EMAIL_BRAND.link};text-decoration:underline;`;
    return `<p style="margin:16px 0 8px;"><a href="mailto:${EMAIL_BRAND.support}" style="${linkStyle}">Contact support</a> &nbsp;·&nbsp; <a href="${EMAIL_BRAND.website}" style="${linkStyle}">Visit website</a> &nbsp;·&nbsp; <a href="${EMAIL_BRAND.website}/privacy" style="${linkStyle}">Privacy policy</a></p>
<p style="margin:0 0 4px;font-weight:700;">${EMAIL_BRAND.name} · ${EMAIL_BRAND.company}</p>
<p style="margin:0;">${escapeHtml(EMAIL_BRAND.address)}</p>
<p style="margin:8px 0 0;">© ${new Date().getFullYear()} ${EMAIL_BRAND.company} All rights reserved.</p>`;
}

export function emailCompanyPlainText(): string {
    return `${EMAIL_BRAND.name} · ${EMAIL_BRAND.company}\n${EMAIL_BRAND.address}\nSupport: ${EMAIL_BRAND.support}\n${EMAIL_BRAND.website}`;
}
