import { growthEmailLayout } from "@/services/resend/templates/growth-emails";
import { TEMPLATE_PACK_SOURCE } from "@/lib/marketing/template-pack-events";
import { LOCAL_SEO_CHECKLIST_SOURCE } from "@/lib/marketing/local-seo-checklist-events";

const P = 'style="font-size:16px;line-height:1.6;color:#52525b;"';

function whatTheyAskedFor(source: string): string {
    if (source === TEMPLATE_PACK_SOURCE) return "the review request template pack";
    if (source === LOCAL_SEO_CHECKLIST_SOURCE) return "the local SEO checklist";
    return "Zyene Reviews Monthly";
}

/**
 * Double opt-in request. It is the only mail a public-form sign-up receives until
 * the address owner presses Confirm, so it carries no marketing content.
 */
export function newsletterConfirmEmail({ confirmUrl, source }: { confirmUrl: string; source: string }): {
    subject: string;
    html: string;
} {
    const item = whatTheyAskedFor(source);
    return {
        subject: "Confirm your email for Zyene Reviews",
        html: growthEmailLayout({
            userName: "there",
            title: "Confirm your email",
            preheader: `One click to get ${item}.`,
            bodyHtml: `<p ${P}>Someone, hopefully you, asked for ${item} with this email address. Confirm it's you and we'll send it right over.</p>
<p ${P}>If this wasn't you, ignore this email. You won't hear from us again.</p>
`,
            ctaLabel: "Confirm my email",
            ctaUrl: confirmUrl,
        }),
    };
}
