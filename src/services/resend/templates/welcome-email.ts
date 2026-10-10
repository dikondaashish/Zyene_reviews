import { emailButton, emailLayout, emailParagraph } from "@/lib/email/email-layout";

interface WelcomeEmailProps { userName: string; loginUrl: string }

export function welcomeEmail({ userName, loginUrl }: WelcomeEmailProps): string {
    return emailLayout({
        title: `Welcome, ${userName}`,
        preheader: "Your account is ready. Connect Google to start managing your reviews.",
        eyebrow: "Getting started",
        bodyHtml: emailParagraph("Welcome to Zyene Reviews. Your account is ready to set up.")
            + emailParagraph("Start by connecting your Google Business Profile to bring your reviews into one inbox. You can choose your plan and check trial details in your dashboard.")
            + emailButton("Open your dashboard", loginUrl)
            + `<h2 style="margin:24px 0 12px;font-size:18px;color:#18181b;">Your first steps</h2>
<ol style="margin:0;padding-left:24px;line-height:1.8;">
<li>Connect your Google Business Profile.</li>
<li>Review your customer feedback.</li>
<li>Send your first review request.</li>
</ol>`,
    });
}

export function welcomeEmailText({ userName, loginUrl }: WelcomeEmailProps): string {
    return [`Hi ${userName},`, "", "Welcome to Zyene Reviews. Your account is ready to set up.", "",
        "Connect your Google Business Profile to bring your reviews into one inbox. Choose your plan and check trial details in your dashboard:",
        loginUrl, "", "Your first steps:", "1. Connect your Google Business Profile.",
        "2. Review your customer feedback.", "3. Send your first review request.", "",
        "Need help? Email contact@zyenereviews.com."].join("\n");
}
