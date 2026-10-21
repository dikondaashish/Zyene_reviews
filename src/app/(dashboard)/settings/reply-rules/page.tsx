import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { createClient } from "@/lib/db/supabase/server";
import { getSettingsAccessContext } from "@/lib/auth/settings-access-context";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { loadReplyRuleSettings } from "@/services/reviews/reply-rules-settings-api";
import { listApproverCandidates } from "@/services/reviews/reply-approver-candidates";
import { ReplyRulesForm } from "@/components/settings/reply-rules-form";
import { ReplyTemplatesManager } from "@/components/settings/reply-templates-manager";

export const metadata = {
    title: "Reply rules",
    description: "Choose how replies to Google reviews are handled for each star rating.",
};

export default async function ReplyRulesSettingsPage() {
    const { user, activeContext } = await getSettingsAccessContext();
    if (!user) redirect("/login");
    const businessId = activeContext.businessId;
    const supabase = await createClient();
    if (!businessId || !(await userCanAccessBusiness(supabase, user.id, businessId))) redirect("/settings/general");

    const admin = createAdminClient();
    const [settings, candidates, canManage] = await Promise.all([
        loadReplyRuleSettings(admin, businessId),
        listApproverCandidates(admin, businessId),
        canManageBusinessIntegration(supabase, user.id, businessId),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="ui-page-title">Reply rules</h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    Decide what happens when a new Google review arrives, by star rating. By default every reply waits for
                    approval. We never ask Google to remove reviews; low ratings get a reply like any other.
                </p>
            </div>
            <ReplyRulesForm businessId={businessId} initial={settings} candidates={candidates} canManage={canManage} />
            <ReplyTemplatesManager businessId={businessId} templates={settings.templates} canManage={canManage} />
        </div>
    );
}
