import { welcomeEmail } from "@/services/resend/templates/welcome-email";
import { paymentSuccessEmail } from "@/services/resend/templates/payment-success-email";
import { paymentFailedEmail } from "@/services/resend/templates/payment-failed-email";
import { subscriptionSuccessEmail } from "@/services/resend/templates/subscription-success-email";
import { subscriptionCanceledEmail } from "@/services/resend/templates/subscription-canceled-email";
import { recoveryEmailTemplate } from "@/services/resend/templates/recovery-email";
import { teamInviteEmail } from "@/services/resend/templates/team-invite-email";
import { reviewAlertEmail } from "@/services/resend/templates/review-alert-email";
import { weeklyDigestEmail } from "@/services/resend/templates/weekly-digest-email";
import { aeoAlertDigestEmail } from "@/services/resend/templates/aeo-alert-digest-email";
import { competitorAlertEmail } from "@/services/resend/templates/competitor-alert-email";
import { reviewRequestEmail } from "@/services/resend/templates/review-request-email";
import { trialNurtureEmail, onboardingDripEmail, winbackFollowUpEmail } from "@/services/resend/templates/growth-emails";
import { marketingNurtureEmail, newsletterWelcomeEmail, monthlyNewsletterEmail } from "@/services/resend/templates/growth-marketing-emails";
import { bookLeadEmail } from "@/services/resend/templates/book-lead-email";
import { reviewRequestTemplatePackEmail } from "@/services/resend/templates/review-request-templates-pack-email";
import { formNotificationEmail, formReceiptEmail } from "@/services/resend/templates/form-emails";
import { referralRewardEmailHtml, reputationScoreEmailHtml, reviewLinkEmailHtml, reviewResponseBonusEmailHtml, reviewResponseBonusItemHtml } from "@/lib/email/transactional-email-styles";
import { supabaseAuthEmailTemplates } from "@/lib/email/supabase-auth-templates";
import { renderAeoReportHtml } from "@/services/aeo/reporting/report-html";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaigns/templates";
import { TRIAL_NURTURE_STEPS, ONBOARDING_DRIP_STEPS, MARKETING_NURTURE_STEPS } from "@/lib/campaign-content/email-sequences-data";
import { MONTHLY_NEWSLETTER_EDITIONS } from "@/lib/campaign-content/monthly-newsletter-content";

export interface EmailPreview { id: string; html: string; subject?: string; authSource?: string }
const userName = "Alexandra-Joséphine Montgomery & Partners";
const businessName = "Montgomery & Partners Community Dental and Wellness Center";
const dashboardUrl = "https://app.zyenereviews.com/dashboard";
const settingsUrl = "https://app.zyenereviews.com/settings/notifications";
const reviewLink = `https://collectratings.com/r/montgomery?request=${"synthetic".repeat(24)}&source=email`;
const unsubscribeUrl = "https://zyenereviews.com/newsletter/unsubscribe?id=synthetic-subscriber";
const request = { customerName: userName, businessName, reviewLink };
const alert = { businessName, rating: 2, authorName: userName, reviewText: "Thank you for listening. We would appreciate clearer appointment reminders and a shorter wait next time.", urgencyScore: 8, dashboardUrl, settingsUrl };
const digest = { businessName, totalNew: 1234, avgRating: 4.6, pendingCount: 21, dashboardUrl, settingsUrl, reviews: [{ rating: 5, authorName: userName, text: alert.reviewText }, { rating: 2, authorName: "Sam & Jordan", text: "" }] };
const aeo = { businessName, totalCount: 10, dashboardUrl, settingsUrl, alerts: [{ severity: "high" as const, title: "Visibility decreased for a tracked prompt", detail: alert.reviewText, evidenceUrl: `${dashboardUrl}?prompt=synthetic&engine=chatgpt` }] };
const report = { brandName: "Montgomery Agency", businessName, periodStart: "2026-10-01", periodEnd: "2026-10-08", visibilityPercent: 57, successfulSamples: 40, totalSamples: 52, citations: 64, ownCitations: 20, competitorMentions: 15, technicalFindings: 7, topPrompts: [{ prompt: `Best family dentist near Montgomery & Partners ${"LongSearchTerm".repeat(12)}`, named: 8, samples: 10 }] };

export function emailPreviews(): EmailPreview[] {
    return [
        { id: "welcome", html: welcomeEmail({ userName, loginUrl: dashboardUrl }) },
        { id: "payment-success", html: paymentSuccessEmail({ userName, amount: "$1,234.56", date: "October 10, 2026", invoiceUrl: dashboardUrl }) },
        { id: "payment-success-no-invoice", html: paymentSuccessEmail({ userName, amount: "$29.99", date: "October 10, 2026", invoiceUrl: "" }) },
        { id: "payment-failed", html: paymentFailedEmail({ userName, amount: "$29.99", updateCardUrl: dashboardUrl }) },
        ...[true, false].map(isTrial => ({ id: `subscription-${isTrial ? "trial" : "paid"}`, html: subscriptionSuccessEmail({ userName, planName: "Professional", isTrial, dashboardUrl }) })),
        { id: "subscription-canceled", html: subscriptionCanceledEmail({ userName, endDate: "October 10, 2026", rejoinUrl: dashboardUrl }) },
        { id: "team-invite", html: teamInviteEmail(reviewLink, userName, businessName) },
        { id: "recovery-named", html: recoveryEmailTemplate({ businessName, customerName: userName }) },
        { id: "recovery-anonymous", html: recoveryEmailTemplate({ businessName }) },
        { id: "review-alert-urgent", html: reviewAlertEmail({ ...alert, customerEmail: "customer@example.test", customerPhone: "+1 (555) 010-0100" }) },
        { id: "review-alert-positive", html: reviewAlertEmail({ ...alert, rating: 5, urgencyScore: 1 }) },
        { id: "review-alert-rating-only", html: reviewAlertEmail({ ...alert, reviewText: "" }) },
        { id: "weekly-digest", html: weeklyDigestEmail(digest) },
        { id: "weekly-digest-empty", html: weeklyDigestEmail({ ...digest, totalNew: 0, avgRating: 0, pendingCount: 0, reviews: [] }) },
        { id: "aeo-alerts", html: aeoAlertDigestEmail(aeo) },
        { id: "aeo-alerts-empty", html: aeoAlertDigestEmail({ ...aeo, totalCount: 0, alerts: [] }) },
        { id: "aeo-report", html: renderAeoReportHtml(report) },
        { id: "aeo-report-empty", html: renderAeoReportHtml({ ...report, visibilityPercent: null, topPrompts: [] }) },
        { id: "aeo-report-white-label", html: renderAeoReportHtml({ ...report, hidePoweredBy: true, brandLogoUrl: "https://example.test/blocked-logo.png" }) },
        { id: "competitor-alert", html: competitorAlertEmail({ businessName, title: "A nearby competitor's rating changed", summary: alert.reviewText, dashboardUrl, settingsUrl }) },
        { id: "review-request", html: reviewRequestEmail(request) },
        { id: "review-request-sender", html: reviewRequestEmail({ ...request, senderName: "Sam" }) },
        { id: "review-request-custom-text", html: reviewRequestEmail({ ...request, template: "Hi {customer_name},\nYour feedback helps {business_name}.\n{review_link}\nThank you!" }) },
        { id: "review-request-custom-html", html: reviewRequestEmail({ ...request, template: '<p>Hello {customer_name},</p><p><a href="{review_link}">Share feedback with {business_name}</a></p>' }) },
        ...CAMPAIGN_TEMPLATES.map(campaign => ({ id: `campaign-${campaign.id}`, html: reviewRequestEmail({ ...request, template: campaign.defaultValues.email_template }) })),
        { id: "trial-day1", ...trialNurtureEmail({ userName, dashboardUrl, stepKey: "trial_day1_connect_google" }) },
        ...TRIAL_NURTURE_STEPS.map(step => ({ id: step.key, ...trialNurtureEmail({ userName, dashboardUrl, stepKey: step.key }) })),
        ...ONBOARDING_DRIP_STEPS.map(step => ({ id: step.key, ...onboardingDripEmail({ userName, dashboardUrl, stepKey: step.key }) })),
        { id: "winback", ...winbackFollowUpEmail({ userName, rejoinUrl: dashboardUrl }) },
        ...MARKETING_NURTURE_STEPS.map(step => ({ id: step.key, ...marketingNurtureEmail({ email: "customer@example.test", stepKey: step.key, unsubscribeUrl }) })),
        { id: "newsletter-welcome", ...newsletterWelcomeEmail({ email: "customer@example.test", unsubscribeUrl }) },
        ...MONTHLY_NEWSLETTER_EDITIONS.map((edition, i) => ({ id: `monthly-newsletter-${i + 1}`, ...monthlyNewsletterEmail({ ...edition, monthLabel: "October 2026", caseStudyLink: `https://zyenereviews.com/case-studies/${edition.caseStudySlug}`, unsubscribeUrl }) })),
        { id: "book-guide", ...bookLeadEmail({ downloadUrl: "https://zyenereviews.com/resources" }) },
        { id: "template-pack", ...reviewRequestTemplatePackEmail({ unsubscribeUrl }) },
        { id: "referral-reward", html: referralRewardEmailHtml(userName) },
        { id: "reputation-snapshot", html: reputationScoreEmailHtml({ name: businessName, averageRating: 4.6, totalReviews: 1234 }) },
        { id: "google-review-link", html: reviewLinkEmailHtml(businessName, reviewLink) },
        { id: "bonus-replies", html: reviewResponseBonusEmailHtml(alert.reviewText, Array.from({ length: 5 }, (_, i) => reviewResponseBonusItemHtml(`Template ${i + 1}`, alert.reviewText)).join("")) },
        { id: "contact-receipt", html: formReceiptEmail("contact", userName, "Support") },
        { id: "demo-receipt", html: formReceiptEmail("demo", userName) },
        ...["Contact submission", "Demo request", "Agency waitlist"].map((title, i) => ({ id: `internal-form-${i + 1}`, html: formNotificationEmail(title, { Name: userName, Email: "customer@example.test", Company: businessName }, alert.reviewText, "Submitted via zyenereviews.com") })),
        ...supabaseAuthEmailTemplates().map(template => ({ id: `auth-${template.slug}`, subject: template.subject, authSource: template.html,
            html: template.html.replace(/\{\{ \.(\w+) \}\}/g, (_, key: string) => ({ ConfirmationURL: reviewLink.replaceAll("&", "&amp;"), Token: "123456", Email: "customer@example.test", NewEmail: "new@example.test", OldEmail: "old@example.test", Phone: "+1 555 010 0100", OldPhone: "+1 555 010 0101", Provider: "Google", FactorType: "Authenticator app" })[key] ?? "Synthetic value") })),
    ];
}
