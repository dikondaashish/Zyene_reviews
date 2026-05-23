import { handleYelpConfirm } from "@/services/yelp/confirm-api";

export async function POST(req: Request) {
    return handleYelpConfirm(req);
}
