
import { redirect } from "next/navigation";

export default async function SettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const { tab } = await searchParams;

    if (tab === "notifications") {
        redirect("/settings/notifications");
    }

    redirect("/settings/general");
}
