import { handleMergeCustomers } from "@/services/customers/merge-api";

export async function POST(request: Request) {
  return handleMergeCustomers(request);
}
