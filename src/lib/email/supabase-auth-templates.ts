import { emailButton, emailLayout, emailPanel, emailParagraph } from "@/lib/email/email-layout";

interface AuthTemplateDefinition {
    slug: string; subject: string; title: string; message: string;
    action?: string; code?: boolean; caution: string;
}

const DEFINITIONS: AuthTemplateDefinition[] = [
    { slug: "confirm-sign-up", subject: "Confirm your Zyene Reviews account", title: "Confirm your email address",
        message: "Thanks for signing up for Zyene Reviews. Confirm your email address to finish setting up your account.",
        action: "Confirm email address", caution: "If you didn't create an account, you can ignore this email." },
    { slug: "invite-user", subject: "You're invited to Zyene Reviews", title: "You're invited to Zyene Reviews",
        message: "You've been invited to create a Zyene Reviews account. Accept the invitation below to get started.",
        action: "Accept invitation", caution: "If you weren't expecting this invitation, you can ignore this email." },
    { slug: "magic-link-or-otp", subject: "Your sign-in link for Zyene Reviews", title: "Sign in to Zyene Reviews",
        message: "Use the secure, one-time link below to sign in to your account.", action: "Sign in",
        caution: "Don't forward this email or share the link. If you didn't request it, you can ignore this email." },
    { slug: "change-email-address", subject: "Confirm your Zyene Reviews email change", title: "Confirm your email change",
        message: "You requested to change your account email from {{ .Email }} to {{ .NewEmail }}. Confirm this change below.",
        action: "Confirm email change", caution: "If you didn't request this change, don't use this link. Contact our team and review your account security." },
    { slug: "reset-password", subject: "Reset your Zyene Reviews password", title: "Reset your password",
        message: "We received a password reset request for your Zyene Reviews account. Use the link below to choose a new password.",
        action: "Reset password", caution: "If you didn't request a reset, you can ignore this email. Your password won't change unless you complete the reset." },
    { slug: "reauthentication", subject: "Your Zyene Reviews verification code", title: "Confirm it's you",
        message: "Enter this one-time code in Zyene Reviews to verify your identity before continuing.", code: true,
        caution: "Don't share this code with anyone. If you didn't request it, don't enter it and review your account security." },
    { slug: "password-changed", subject: "Your Zyene Reviews password changed", title: "Your password was changed",
        message: "The password for your Zyene Reviews account ({{ .Email }}) was changed.",
        caution: "If you didn't make this change, reset your password from the sign-in page and contact our team immediately." },
    { slug: "email-address-changed", subject: "Your Zyene Reviews email address changed", title: "Your email address was changed",
        message: "Your account email was changed from {{ .OldEmail }} to {{ .Email }}.",
        caution: "If you didn't make this change, contact our team immediately and review your account security." },
    { slug: "phone-number-changed", subject: "Your Zyene Reviews phone number changed", title: "Your phone number was changed",
        message: "The phone number for your account ({{ .Email }}) was changed from {{ .OldPhone }} to {{ .Phone }}.",
        caution: "If you didn't make this change, contact our team immediately and review your account security." },
    { slug: "sign-in-method-linked", subject: "A sign-in method was added to Zyene Reviews", title: "A sign-in method was added",
        message: "A sign-in method ({{ .Provider }}) was linked to your account ({{ .Email }}).",
        caution: "If you didn't make this change, contact our team immediately and review your account security." },
    { slug: "sign-in-method-removed", subject: "A sign-in method was removed from Zyene Reviews", title: "A sign-in method was removed",
        message: "A sign-in method ({{ .Provider }}) was removed from your account ({{ .Email }}).",
        caution: "If you didn't make this change, contact our team immediately and review your account security." },
    { slug: "mfa-method-added", subject: "A verification method was added to Zyene Reviews", title: "A verification method was added",
        message: "A multi-factor authentication method ({{ .FactorType }}) was added to your account ({{ .Email }}).",
        caution: "If you didn't make this change, contact our team immediately and review your account security." },
    { slug: "mfa-method-removed", subject: "A verification method was removed from Zyene Reviews", title: "A verification method was removed",
        message: "A multi-factor authentication method ({{ .FactorType }}) was removed from your account ({{ .Email }}).",
        caution: "If you didn't make this change, contact our team immediately and review your account security." },
];

/** Preserve Supabase's Go placeholders and provider-generated action URLs. */
export function supabaseAuthEmailTemplates(): { slug: string; subject: string; html: string }[] {
    return DEFINITIONS.map(definition => ({
        slug: definition.slug, subject: definition.subject,
        html: emailLayout({
            title: definition.title, preheader: definition.message, eyebrow: "Account security",
            bodyHtml: emailParagraph(definition.message)
                + (definition.action ? emailButton(definition.action, "{{ .ConfirmationURL }}")
                    + `<p style="font-size:14px;">If the button doesn't work, copy this link into your browser:</p>
<p style="font-size:14px;word-break:break-all;"><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>` : "")
                + (definition.code ? emailPanel(`<p style="margin:0;font-size:28px;font-weight:700;letter-spacing:4px;">{{ .Token }}</p>`) : "")
                + emailParagraph(definition.caution),
        }),
    }));
}
