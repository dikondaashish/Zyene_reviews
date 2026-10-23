import { createClient } from "@/lib/db/supabase/server";
import { RecentAutomationsCard } from "@/components/dashboard/recent-automations-card";
import { loadRecentAutomations } from "@/services/dashboard/load-recent-automations";

/** Streams in after the rest of the dashboard, like the task list above it. */
export async function DashboardViewRecentAutomations({ businessId }: { businessId: string }) {
    const supabase = await createClient();
    const items = await loadRecentAutomations(supabase, businessId);
    return <RecentAutomationsCard items={items} />;
}
