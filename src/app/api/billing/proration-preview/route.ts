export type { ProrationPreviewPayload } from "@/services/stripe/proration-preview-api";

import { handleProrationPreview } from "@/services/stripe/proration-preview-api";

export async function POST(request: Request) {
    return handleProrationPreview(request);
}
