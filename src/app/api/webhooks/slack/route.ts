import { handleSlackEvents } from "@/services/support-chat/slack/slack-events";

/** Slack Events API for the website chat live takeover (signature verified inside). */
export async function POST(request: Request) {
    return handleSlackEvents(request);
}
