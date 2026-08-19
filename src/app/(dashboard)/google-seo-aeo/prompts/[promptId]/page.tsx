import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadPromptDetail } from "./load-prompt-detail";
import { PromptTrendChart } from "./prompt-trend-chart";
import { PromptHeadToHead } from "./prompt-head-to-head";
import { ContentBriefSection } from "./content-brief-section";
import { promptDetailRedirect } from "@/services/aeo/prompt-detail-navigation";

export default async function PromptDetailPage({ params }: { params: Promise<{ promptId: string }> }) {
    const { promptId } = await params;
    const data = await loadPromptDetail(promptId);

    if (data.kind === "not-found") {
        redirect(promptDetailRedirect(data) ?? "/google-seo-aeo/prompts");
    }

    return (
        <div className="min-w-0 space-y-6 overflow-x-hidden p-4 md:p-8">
            <div>
                <Link
                    href="/google-seo-aeo/prompts"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" /> Prompt library
                </Link>
                <h2 className="mt-1 break-words text-2xl font-bold tracking-tight">{data.promptText}</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Visibility trend</CardTitle>
                    <CardDescription>
                        Weekly share of answered samples naming your brand, per engine. Gaps are weeks
                        with no samples, not measured zeros.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PromptTrendChart trend={data.trend} weeks={data.weeks} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Head-to-head</CardTitle>
                    <CardDescription>Each engine&apos;s most recent answer to this prompt.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PromptHeadToHead rows={data.headToHead} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Content brief</CardTitle>
                    <CardDescription>
                        A concrete edit checklist for this exact prompt — never auto-published, always
                        copy-paste.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ContentBriefSection
                        businessId={data.businessId}
                        promptId={data.promptId}
                        brief={data.latestBrief}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
