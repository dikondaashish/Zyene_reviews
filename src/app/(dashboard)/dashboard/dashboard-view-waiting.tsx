import { createClient } from "@/lib/db/supabase/server";
import { WaitingOnYouCard } from "@/components/dashboard/waiting-on-you-card";
import { loadWaitingTasks } from "@/services/dashboard/load-waiting-tasks";
import type { DashboardViewProps } from "./types";

type Props = Pick<DashboardViewProps, "user" | "business" | "isGoogleConnected" | "brokenPlaceLinksCount"> & {
    /** False while the Getting started checklist is showing, so setup is not asked for twice. */
    includeSetup: boolean;
};

/** Streams in after the rest of the dashboard so its extra queries never slow the page down. */
export async function DashboardViewWaiting({ user, business, isGoogleConnected, brokenPlaceLinksCount, includeSetup }: Props) {
    const supabase = await createClient();
    const tasks = await loadWaitingTasks(supabase, {
        businessId: business.id,
        googleConnected: isGoogleConnected,
        brokenLinks: brokenPlaceLinksCount,
        includeSetup,
    });
    // "All caught up" would contradict the Getting started checklist shown below it.
    if (tasks.length === 0 && !includeSetup) return null;
    const name = user.user_metadata?.first_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
    return <WaitingOnYouCard tasks={tasks} userName={String(name)} />;
}
