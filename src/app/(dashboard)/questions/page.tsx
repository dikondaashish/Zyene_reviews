import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getActiveBusinessId } from "@/lib/auth/business-context";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { SyncButton } from "@/components/dashboard/sync-button";
import {
    QuestionsPageClient,
    type GbpQuestionRow,
} from "@/components/questions/questions-page-client";
import { Button } from "@/components/ui/button";

export default async function QuestionsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId, business } = await getActiveBusinessId();

    if (!businessId) {
        return (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <h2 className="text-xl font-semibold">No business found</h2>
                <p className="mt-1 text-muted-foreground">Complete onboarding to manage Q&A.</p>
            </div>
        );
    }

    const isGoogleConnected = !!business?.review_platforms?.find(
        (p: { platform?: string }) => p.platform === "google"
    );
    const isDemo = !isGoogleConnected;

    let questions: GbpQuestionRow[] = [];
    if (!isDemo) {
        questions = await fetchQuestions(supabase, businessId);
    }

    return (
        <div className="flex w-full flex-col gap-6">
            {isDemo && <DemoModeBanner className="mb-0" />}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Google Q&A</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Questions from your Google Business Profile. Answers appear publicly on Search and Maps.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {isGoogleConnected && <SyncButton />}
                    {isDemo && (
                        <Button asChild>
                            <Link href="/integrations">Connect Google</Link>
                        </Button>
                    )}
                </div>
            </div>

            <QuestionsPageClient questions={questions} isDemo={isDemo} />
        </div>
    );
}

async function fetchQuestions(
    supabase: Awaited<ReturnType<typeof createClient>>,
    businessId: string
): Promise<GbpQuestionRow[]> {
    const { data, error } = await supabase
        .from("gbp_questions")
        .select(
            "id, question_text, author_display_name, google_update_time, total_answer_count, has_merchant_answer, upvote_count"
        )
        .eq("business_id", businessId)
        .order("google_update_time", { ascending: false, nullsFirst: false });

    if (error) {
        console.error("[questions page]", error);
        return [];
    }
    return data ?? [];
}
