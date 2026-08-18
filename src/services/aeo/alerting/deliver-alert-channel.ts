import { createHmac } from "node:crypto";
import { checkOriginIsPublic } from "@/services/aeo/crawler/ssrf-guard";
import { decryptAlertSecret } from "./channel-secrets";

type AlertItem = { id: string; severity: string; title: string; detail: string; created_at: string };
type Channel = { channel_type: "slack" | "webhook"; endpoint_ciphertext: string; signing_secret_ciphertext: string | null };

export async function deliverAlertChannel(channel: Channel, alerts: readonly AlertItem[]): Promise<void> {
    const endpoint = decryptAlertSecret(channel.endpoint_ciphertext);
    const parsed = new URL(endpoint);
    if (parsed.protocol !== "https:") throw new Error("Alert endpoints must use HTTPS");
    if (channel.channel_type === "slack" && parsed.hostname !== "hooks.slack.com") throw new Error("Invalid Slack webhook host");
    const safety = await checkOriginIsPublic(endpoint);
    if (!safety.safe) throw new Error(safety.reason);
    const payload = channel.channel_type === "slack"
        ? { text: alerts.map((alert) => `*${alert.title}*\n${alert.detail}`).join("\n\n") }
        : { event: "aeo.alert.digest", createdAt: new Date().toISOString(), alerts };
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = { "Content-Type": "application/json", "User-Agent": "Zyene-AEO-Alerts/1.0" };
    if (channel.signing_secret_ciphertext) {
        const secret = decryptAlertSecret(channel.signing_secret_ciphertext);
        headers["X-Zyene-Signature"] = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
    }
    const response = await fetch(endpoint, { method: "POST", headers, body, redirect: "error", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`Alert channel returned HTTP ${response.status}`);
}
