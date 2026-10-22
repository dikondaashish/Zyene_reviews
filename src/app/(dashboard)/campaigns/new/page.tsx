import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import NewCampaignPage from "@/app/(dashboard)/campaigns/new/page-client";
import { replyToAddress } from "@/lib/notifications/review-request";

export default async function Page() {
    const { business } = await getActiveBusinessId();
    if (!business) redirect("/dashboard");
    return <NewCampaignPage context={{
        businessName: business.name || "Your business",
        slug: typeof business.slug === "string" ? business.slug : "",
        timezone: typeof business.timezone === "string" ? business.timezone : "UTC",
        replyEmail: replyToAddress(typeof business.email === "string" ? business.email : null),
    }} />;
}
