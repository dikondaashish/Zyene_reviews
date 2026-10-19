import { emailLayout } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";
import { SUPPORT_AGENT_NAME } from "@/lib/support-chat/constants";

export interface SupportChatReport {
    conversations: number;
    leads: number;
    feedback: { up: number; down: number };
    gaps: Array<{ question: string; reply: string; reason: "unanswered" | "thumbs_down" }>;
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

function statRow(report: SupportChatReport): string {
    const cells: Array<[string, string]> = [
        ["Conversations", String(report.conversations)],
        ["Leads", String(report.leads)],
        ["👍 / 👎", `${report.feedback.up} / ${report.feedback.down}`],
        ["Gaps", String(report.gaps.length)],
    ];
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells
        .map(([label, value]) => `<td class="email-stat" align="center" style="padding:12px 6px;"><div class="email-stat-number" style="font-size:24px;font-weight:700;">${escapeHtml(value)}</div><div style="font-size:12px;">${escapeHtml(label)}</div></td>`)
        .join("")}</tr></table>`;
}

function gapList(report: SupportChatReport): string {
    if (report.gaps.length === 0) {
        return `<p>No unanswered questions or thumbs-down replies this week. ${SUPPORT_AGENT_NAME} covered everything.</p>`;
    }
    const items = report.gaps
        .map((gap) => {
            const tag = gap.reason === "thumbs_down" ? "👎 Visitor disliked the answer" : "❓ Not covered by our content";
            return `<li style="margin:0 0 14px;"><strong>${escapeHtml(clip(gap.question, 300))}</strong><br><span style="font-size:13px;">${tag}</span><br><span style="font-size:13px;color:#57534e;">${SUPPORT_AGENT_NAME}: ${escapeHtml(clip(gap.reply, 240))}</span></li>`;
        })
        .join("");
    return `<p>These are the questions ${SUPPORT_AGENT_NAME} couldn't answer well. Each one is a help article, FAQ or page worth adding.</p><ol style="padding-left:20px;">${items}</ol>`;
}

export function supportChatReportEmail(report: SupportChatReport): { subject: string; html: string } {
    return {
        subject: `Website chat weekly: ${report.conversations} chats, ${report.leads} leads, ${report.gaps.length} gaps`,
        html: emailLayout({
            title: `${SUPPORT_AGENT_NAME}'s week on the website`,
            preheader: `${report.gaps.length} questions to turn into content.`,
            bodyHtml: statRow(report) + `<h2 style="font-size:18px;margin:24px 0 12px;">Questions to answer better</h2>` + gapList(report),
            footerHtml: "Weekly report from the Zyene Reviews website chat",
        }),
    };
}
