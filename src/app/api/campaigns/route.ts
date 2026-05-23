import { handleCampaignCreate, handleCampaignsList } from "@/services/campaigns/campaigns-list-api";

export async function GET() {
    return handleCampaignsList();
}

export async function POST(request: Request) {
    return handleCampaignCreate(request);
}
