import { sendEmail } from "@/services/resend/send-email";
import { teamInviteEmail } from "@/services/resend/templates/team-invite-email";
import { getAuthSiteUrl } from "@/lib/routing/platform-routes";

export function buildTeamInviteSignupLink(inviteToken: string): string {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com";
    const signupUrl = getAuthSiteUrl(rootDomain, "/signup");
    return `${signupUrl}?invite=${encodeURIComponent(inviteToken)}`;
}

export async function deliverTeamInviteEmail(args: {
    to: string;
    inviteToken: string;
    inviterName: string;
    orgName: string;
}): Promise<{
    sendResult: Awaited<ReturnType<typeof sendEmail>>;
    inviteLink: string;
}> {
    const inviteLink = buildTeamInviteSignupLink(args.inviteToken);
    const emailText = [
        `${args.inviterName} invited you to join ${args.orgName} on Zyene Reviews.`,
        "",
        `Accept the invitation (sign up or sign in with this email):`,
        inviteLink,
        "",
        "If you did not expect this, you can ignore this message.",
    ].join("\n");

    const sendResult = await sendEmail({
        to: args.to,
        subject: `Join ${args.orgName} on Zyene Reviews`,
        html: teamInviteEmail(inviteLink, args.inviterName, args.orgName),
        text: emailText,
    });

    return { sendResult, inviteLink };
}

/** Default pending-invite validity window after a resend (matches initial invite TTL). */
export function defaultInviteExpiresAtIso(): string {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
}
