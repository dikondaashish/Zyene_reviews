import { emailButton, emailLayout, emailParagraph } from "@/lib/email/email-layout";
import { emailHtmlToText } from "@/lib/email/html-to-text";

interface WelcomeEmailProps { userName: string; loginUrl: string }

export function welcomeEmail({ userName, loginUrl }: WelcomeEmailProps): string {
    return emailLayout({
        title: "Welcome to Zyene Reviews",
        preheader: "Your account is ready. Connect Google to start managing your reviews.",
        bodyHtml: emailParagraph(`Hi ${userName},`)
            + emailParagraph("Your account is ready. Connect your Google Business Profile to bring your reviews into one inbox.")
            + emailButton("Open your dashboard", loginUrl)
            + emailParagraph("From your dashboard, you can respond to reviews, send review requests, and choose your plan.")
            + emailParagraph("Need a hand getting started? Reply to this email — we're here to help."),
    });
}

export function welcomeEmailText(props: WelcomeEmailProps): string {
    return emailHtmlToText(welcomeEmail(props));
}
