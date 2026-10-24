import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createClient } from "@/lib/db/supabase/server";
import { loadWelcomeTour } from "@/services/dashboard/load-welcome-tour";
import { DashboardView } from "./dashboard-view";
import { loadDashboardPageData } from "./load-dashboard-data";
import { getSettingsAccessContext } from "@/lib/auth/settings-access-context";

export const metadata = {
    title: "Dashboard",
    description: "Your reviews, requests and Google listing at a glance.",
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const [cookieStore, sp] = await Promise.all([cookies(), searchParams]);
  const localeVal = cookieStore.get("locale")?.value || "en";
  const dict = getDictionary(localeVal);

  const result = await loadDashboardPageData(dict);

  if ("errorElement" in result) {
    return result.errorElement;
  }

  const { access } = await getSettingsAccessContext();
  // Only straight after onboarding: the one-time welcome and its short tour.
  const welcome =
    sp.welcome === "1"
      ? await loadWelcomeTour(await createClient(), {
          user: result.data.user,
          business: result.data.business,
          googleConnected: result.data.isGoogleConnected,
        })
      : null;
  return (
    <DashboardView
      {...result.data}
      canConfigureNotifications={access.notifications}
      welcome={welcome}
    />
  );
}
