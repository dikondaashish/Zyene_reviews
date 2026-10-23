import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { DashboardView } from "./dashboard-view";
import { loadDashboardPageData } from "./load-dashboard-data";
import { getSettingsAccessContext } from "@/lib/auth/settings-access-context";

export const metadata = {
    title: "Dashboard",
    description: "Your reviews, requests and Google listing at a glance.",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const localeVal = cookieStore.get("locale")?.value || "en";
  const dict = getDictionary(localeVal);

  const result = await loadDashboardPageData(dict);

  if ("errorElement" in result) {
    return result.errorElement;
  }

  const { access } = await getSettingsAccessContext();
  return (
    <DashboardView
      {...result.data}
      canConfigureNotifications={access.notifications}
    />
  );
}
