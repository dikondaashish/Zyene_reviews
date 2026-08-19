import { redirect } from "next/navigation";

import { SettingsNavigation } from "@/components/settings/settings-navigation";
import { getSettingsAccessContext } from "@/lib/auth/settings-access-context";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, access } = await getSettingsAccessContext();
  if (!user) redirect("/login");

  return <SettingsNavigation access={access}>{children}</SettingsNavigation>;
}
