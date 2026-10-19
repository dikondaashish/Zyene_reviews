import { emailLayout } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";
import type { SupportChatLead } from "@/lib/support-chat/schemas";
import { SUPPORT_AGENT_NAME } from "@/lib/support-chat/constants";

const REASON_LABEL: Record<SupportChatLead["reason"], string> = {
    question_limit: "Asked several questions in the website chat",
    human_request: "Asked to talk to a person",
};

function fieldRows(lead: SupportChatLead, questionCount: number): string {
    const rows: Array<[string, string, string?]> = [
        ["Name", lead.name],
        ["Email", lead.email, `mailto:${lead.email}`],
        ["Phone", lead.phone, `tel:${lead.phone.replace(/[^\d+]/g, "")}`],
        ["Business type", lead.businessType],
        ["Why now", REASON_LABEL[lead.reason]],
        ["Questions asked", String(questionCount)],
        ["Page", lead.pagePath || "Unknown"],
    ];
    return rows
        .map(([label, value, href]) => {
            const shown = href ? `<a href="${escapeHtml(href)}">${escapeHtml(value)}</a>` : escapeHtml(value);
            return `<tr><td style="padding:6px 12px 6px 0;font-weight:600;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;">${shown}</td></tr>`;
        })
        .join("");
}

function transcriptHtml(lead: SupportChatLead): string {
    if (lead.transcript.length === 0) return "";
    const turns = lead.transcript
        .map((message) => {
            const speaker = message.role === "user" ? escapeHtml(lead.name) : message.role === "agent" ? "Team" : SUPPORT_AGENT_NAME;
            const body = escapeHtml(message.content).replace(/\n/g, "<br>");
            return `<p style="margin:0 0 12px;"><strong>${speaker}:</strong> ${body}</p>`;
        })
        .join("");
    return `<h2 style="font-size:18px;margin:24px 0 12px;">Chat transcript</h2>${turns}`;
}

export function supportChatLeadEmail(lead: SupportChatLead): { subject: string; html: string } {
    const questionCount = lead.transcript.filter((message) => message.role === "user").length;
    const subject = `[Website chat lead] ${lead.name.replace(/[\r\n]/g, " ")} - ${lead.businessType}`;
    const html = emailLayout({
        title: "New lead from the website chat",
        preheader: `${lead.name} (${lead.businessType}) wants to hear from the team.`,
        bodyHtml: `<p>Reply to this email to reach ${escapeHtml(lead.name)} directly.</p>`
            + `<table role="presentation" cellpadding="0" cellspacing="0" border="0">${fieldRows(lead, questionCount)}</table>`
            + transcriptHtml(lead),
        footerHtml: "Sent by the Zyene Reviews website chat",
    });
    return { subject, html };
}
