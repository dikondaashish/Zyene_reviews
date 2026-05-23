import { handleBillingPortal } from "@/services/stripe/portal-api";

export async function POST() {
    return handleBillingPortal();
}
