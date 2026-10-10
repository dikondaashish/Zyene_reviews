import { handleGrowthDashboardLogin } from "@/services/growth/growth-dashboard-login";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    return handleGrowthDashboardLogin(request);
}
