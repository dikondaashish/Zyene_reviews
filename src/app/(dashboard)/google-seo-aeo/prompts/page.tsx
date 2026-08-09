import { Building2 } from "lucide-react";

import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadPromptsPageData } from "./load-prompts-page-data";
import { PromptCreateForm } from "./prompt-create-form";
import { PromptList } from "./prompt-list";
import { PromptsSidebar } from "./prompts-sidebar";

export default async function AeoPromptsPage() {
    const data = await loadPromptsPageData();

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Building2}
                title="Add a business to build a prompt library"
                description="Prompts are scoped to a location. Create or select a business first."
            />
        );
    }

    return (
        <div className="min-w-0 space-y-6 overflow-x-hidden p-4 md:p-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Prompt library</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    The questions we ask answer engines on behalf of {data.businessName}.
                </p>
            </div>

            {data.activeCount > 0 && !data.liveSamplingEnabled ? (
                <Alert>
                    <AlertDescription>
                        <strong>{data.activeCount} active prompt{data.activeCount === 1 ? "" : "s"},
                        but sampling is switched off.</strong>{" "}
                        Nothing will run until <code>AEO_LIVE_SAMPLING</code> is enabled for this
                        deployment, so no data will appear and nothing is being charged.
                    </AlertDescription>
                </Alert>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add a prompt</CardTitle>
                            <CardDescription>
                                New prompts start inactive. Nothing is sampled or charged until you
                                switch one on.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PromptCreateForm businessId={data.businessId} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Prompts
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    {data.activeCount} of {data.prompts.length} active
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PromptList
                                prompts={data.prompts}
                                runnableEngineCount={data.runnableEngineCount}
                            />
                        </CardContent>
                    </Card>
                </div>

                <PromptsSidebar engines={data.engines} quotaMeter={data.quotaMeter} />
            </div>
        </div>
    );
}
