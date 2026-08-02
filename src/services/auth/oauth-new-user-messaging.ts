import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";
import { getAuthSiteUrl } from "@/lib/routing/platform-routes";

export async function sendOAuthNewUserMessages(params: {
    email: string;
    fullName: string;
    userId: string;
    organizationId: string;
}): Promise<void> {
    const { email, fullName, userId, organizationId } = params;
    const [{ sendEmail }, { welcomeEmail, welcomeEmailText }] = await Promise.all([
        import("@/services/resend/send-email"),
        import("@/services/resend/templates/welcome-email"),
    ]);
    const loginUrl = getAuthSiteUrl(
        process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com",
        "/login"
    );

    sendEmail({
        to: email,
        subject: "Welcome to Zyene Reviews — connect Google to get started",
        html: welcomeEmail({ userName: fullName || "User", loginUrl }),
        text: welcomeEmailText({ userName: fullName || "User", loginUrl }),
    }).catch((error: unknown) => {
        logger.error({ err: error }, "Failed to send welcome email:");
        Sentry.captureException(error, {
            tags: { route: "auth-callback", step: "send_welcome_email" },
        });
    });

    try {
        const { scheduleTrialNurture } = await import("@/lib/growth/schedule-growth-emails");
        await scheduleTrialNurture({
            email,
            userName: fullName || "there",
            userId,
            organizationId,
        });
    } catch (error) {
        logger.error({ err: error }, "Failed to schedule trial nurture:");
        Sentry.captureException(error, {
            tags: { route: "auth-callback", step: "schedule_trial_nurture" },
        });
    }
}
