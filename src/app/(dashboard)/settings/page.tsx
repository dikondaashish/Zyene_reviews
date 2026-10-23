import { redirect } from "next/navigation";
import { getSettingsAccessContext } from "@/lib/auth/settings-access-context";

export const metadata = {
    title: "Settings",
    description: "Manage your account, business and team settings.",
};

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
