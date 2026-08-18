export interface AeoAlertDigestItem {
    severity: "critical" | "high" | "medium" | "low";
    title: string;
    detail: string;
    evidenceUrl: string;
}

interface AeoAlertDigestProps {
    businessName: string;
    alerts: AeoAlertDigestItem[];
    /** Total alerts detected, which may exceed alerts.length once capped — the "+N more" the alert-storm edge case requires. */
    totalCount: number;
    dashboardUrl: string;
    settingsUrl: string;
}

const SEVERITY_COLOR: Record<AeoAlertDigestItem["severity"], string> = {
    critical: "#dc2626",
    high: "#ea580c",
    medium: "#ca8a04",
    low: "#71717a",
};

export function aeoAlertDigestEmail({
    businessName,
    alerts,
    totalCount,
    dashboardUrl,
    settingsUrl,
}: AeoAlertDigestProps): string {
    const rows = alerts
        .map(
            (alert) => `
            <div style="border-bottom: 1px solid #f4f4f5; padding: 16px 0;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="font-size: 11px; font-weight: 700; color: ${SEVERITY_COLOR[alert.severity]}; text-transform: uppercase; letter-spacing: 0.05em;">
                            ${alert.severity}
                        </td>
                    </tr>
                </table>
                <p style="margin: 4px 0 0; font-size: 15px; font-weight: 600; color: #18181b;">${alert.title}</p>
                <p style="margin: 4px 0 0; font-size: 14px; line-height: 1.5; color: #52525b;">${alert.detail}</p>
                <p style="margin: 8px 0 0; font-size: 13px;">
                    <a href="${alert.evidenceUrl}" style="color: #2563eb; text-decoration: underline;">View evidence</a>
                </p>
            </div>`
        )
        .join("");

    const overflowNote =
        totalCount > alerts.length
            ? `<p style="margin: 16px 0 0; font-size: 13px; color: #a1a1aa;">+${totalCount - alerts.length} more — view the full list on your dashboard.</p>`
            : "";

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>AEO Alerts - ${businessName}</title></head>
<body style="margin: 0; padding: 0; background-color: #fcfbfa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fcfbfa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e4e4e7;">
                    <tr>
                        <td style="padding: 32px 40px 48px;">
                            <div style="margin-bottom: 24px;">
                                <span style="display: inline-block; background-color: #f4f4f5; color: #18181b; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em;">
                                    AEO Alerts
                                </span>
                            </div>
                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b; letter-spacing: -0.025em;">
                                Something changed
                            </h1>
                            <p style="margin: 0 0 32px; font-size: 16px; color: #52525b;">for ${businessName}</p>

                            <div style="margin-bottom: 8px;">${rows}${overflowNote}</div>

                            <div style="margin: 32px 0; text-align: center;">
                                <a href="${dashboardUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; border: 1px solid #27272a;">
                                    View Details
                                </a>
                            </div>

                            <div style="padding-top: 32px; border-top: 1px solid #f4f4f5; text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                                    Only sent when a change clears a statistical significance bar — not every sampling wobble.
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <div style="font-size: 12px; color: #a1a1aa;">
                                © ${new Date().getFullYear()} Zyene Inc. <br>
                                <a href="${settingsUrl}" style="color: #71717a; text-decoration: underline;">Manage Notification Settings</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
