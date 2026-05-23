import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getActiveBusinessId, getGoogleQaUnavailableForActiveBusiness } from "@/lib/auth/business-context";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { QuestionsPageClient } from "@/components/questions/questions-page-client";
import { Button } from "@/components/ui/button";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { MessagesSquare } from "lucide-react";
import { fetchQuestionsPageData } from "./questions-page-fetch";
import { QuestionsPageHeader } from "./questions-page-header";

export default async function QuestionsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId, business } = await getActiveBusinessId();

    if (!businessId) {
        return (
            <BusinessContextEmptyState
                icon={MessagesSquare}
                title="Add a business to manage Q&A"
                description="Google Business Profile questions are synced per location. Add or select a business in the header to continue."
            />
        );
    }

    const qaUnavailable = await getGoogleQaUnavailableForActiveBusiness(businessId);
    if (qaUnavailable) {
        return (
            <div className="flex w-full max-w-lg flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Google Q&A</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Google Q&A isn&apos;t available for this business listing. We didn&apos;t receive any Q&amp;A data
                    from Google for this location, so this feature stays hidden.
                </p>
                <Button asChild variant="outline" className="w-fit">
                    <Link href="/dashboard">Back to dashboard</Link>
                </Button>
            </div>
        );
    }

    const isGoogleConnected = !!business?.review_platforms?.find(
        (p: { platform?: string }) => p.platform === "google"
    );
    const isDemo = !isGoogleConnected;

    let questions: Awaited<ReturnType<typeof fetchQuestionsPageData>>["questions"] = [];
    let questionsFetchFailed = false;
    if (!isDemo) {
        const result = await fetchQuestionsPageData(supabase, businessId);
        questions = result.questions;
        questionsFetchFailed = result.failed;
    }

    if (questionsFetchFailed) {
        return (
            <div className="flex w-full flex-col gap-6 p-4 lg:p-6">
                <DashboardFetchError
                    message="We could not load Google Q&A. Check your connection and try again."
                    retryHref="/questions"
                />
            </div>
        );
    }

    return (
        <div className="flex min-w-0 w-full flex-col gap-6 overflow-x-hidden p-4 lg:p-6">
            {isDemo && <DemoModeBanner className="mb-0" />}
            <QuestionsPageHeader isGoogleConnected={isGoogleConnected} isDemo={isDemo} />
            <QuestionsPageClient questions={questions} isDemo={isDemo} />
        </div>
    );
}
