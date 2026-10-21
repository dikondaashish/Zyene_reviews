import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { canApproveReplies } from "@/services/reviews/reply-approvals-api";
import { loadPendingReplyDrafts } from "@/services/reviews/reply-drafts-load";
import { ReplyApprovalsList } from "@/components/reviews/reply-approvals-list";

export const metadata = { title: "Reply approvals", description: "Approve, edit or reject drafted replies to reviews." };

export default async function ReplyApprovalsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { businessId } = await getActiveBusinessId();
    if (!businessId || !(await userCanAccessBusiness(supabase, user.id, businessId))) redirect("/reviews");

    const admin = createAdminClient();
    const [drafts, canApprove] = await Promise.all([
        loadPendingReplyDrafts(admin, businessId),
        canApproveReplies(supabase, admin, user.id, businessId),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="ui-page-title">Reply approvals</h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    Drafted replies wait here until someone approves them. Edit the text if needed, then post it to Google.
                    Change which ratings need approval in <Link className="underline" href="/settings/reply-rules">Reply rules</Link>.
                </p>
            </div>
            <ReplyApprovalsList drafts={drafts} canApprove={canApprove} />
        </div>
    );
}
