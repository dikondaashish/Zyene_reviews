import { handlePlaceTool } from "@/lib/free-tools/place-tool-handler";

export async function POST(request: Request) {
    return handlePlaceTool(request, "reputation-score");
}
