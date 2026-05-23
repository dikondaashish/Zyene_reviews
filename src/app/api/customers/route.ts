export const dynamic = "force-dynamic";
import type { NextRequest } from "next/server";

import { createCustomer, listCustomers, deleteCustomer, patchCustomer } from "@/services/customers/customers-api";

export async function POST(request: NextRequest) {
  return createCustomer(request);
}

export async function GET(request: NextRequest) {
  return listCustomers(request);
}

export async function DELETE(request: NextRequest) {
  return deleteCustomer(request);
}

export async function PATCH(request: NextRequest) {
  return patchCustomer(request);
}
