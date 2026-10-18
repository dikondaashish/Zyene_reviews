import { handleReputationCheck } from "@/services/support-chat/tools-api";

export async function POST(request: Request) {
    return handleReputationCheck(request);
}
