export const dynamic = "force-dynamic";

import { handleOAuthCallback } from "@/services/auth/oauth-callback";

export async function GET(request: Request) {
  return handleOAuthCallback(request);
}
