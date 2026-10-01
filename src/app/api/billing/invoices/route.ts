import { handleBillingInvoices } from "@/services/stripe/invoices-api";

export async function GET(request: Request) {
    return handleBillingInvoices(request);
}
