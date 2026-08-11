import { handleContactPost } from "@/services/marketing/contact-api";

export async function POST(request: Request) {
    return handleContactPost(request);
}
