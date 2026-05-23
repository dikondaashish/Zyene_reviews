import {
    handleCampaignDelete,
    handleCampaignGet,
    handleCampaignPatch,
} from "@/services/campaigns/campaign-by-id-api";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleCampaignGet(id);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleCampaignPatch(request, id);
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleCampaignDelete(id);
}
