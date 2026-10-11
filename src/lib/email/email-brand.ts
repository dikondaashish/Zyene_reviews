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
    button: "#c93c00",
    buttonText: "#ffffff",
    link: "#b93800",
    darkLink: "#ffad85",
} as const;

export function emailCompanyFooter(): string {
    const linkStyle = `color:${EMAIL_BRAND.link};text-decoration:underline;`;
    return `<p style="margin:16px 0 4px;">© ${new Date().getFullYear()} ${EMAIL_BRAND.company}</p>
<p style="margin:0;">${escapeHtml(EMAIL_BRAND.address)}</p>
<p style="margin:12px 0 0;"><a href="mailto:${EMAIL_BRAND.support}" style="${linkStyle}">Support</a> &nbsp;·&nbsp; <a href="${EMAIL_BRAND.website}" style="${linkStyle}">Website</a> &nbsp;·&nbsp; <a href="${EMAIL_BRAND.website}/privacy" style="${linkStyle}">Privacy</a></p>`;
}

export function emailCompanyPlainText(): string {
    return `${EMAIL_BRAND.name} · ${EMAIL_BRAND.company}\n${EMAIL_BRAND.address}\nSupport: ${EMAIL_BRAND.support}\n${EMAIL_BRAND.website}`;
}
