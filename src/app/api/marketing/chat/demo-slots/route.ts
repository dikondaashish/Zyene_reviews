import { handleDemoSlots } from "@/services/support-chat/tools-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    return handleDemoSlots(request);
}
