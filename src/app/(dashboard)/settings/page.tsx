import { redirect } from "next/navigation";
import { getSettingsAccessContext } from "@/lib/auth/settings-access-context";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab }, { access }] = await Promise.all([
    searchParams,
    getSettingsAccessContext(),
  ]);

  if (tab === "notifications" && access.notifications) {
    redirect("/settings/notifications");
  }

  redirect("/settings/general");
}
