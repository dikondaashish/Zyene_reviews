import { handleCampaignSend } from "@/services/campaigns/campaign-send-api";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: campaignId } = await params;
    return handleCampaignSend(request, campaignId);
}
