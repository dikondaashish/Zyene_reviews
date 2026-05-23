"use client";

import { Code2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeveloperApiCardBaseUrlSection } from "./developer-api-card-base-url-section";
import { DeveloperApiCardEndpointsList } from "./developer-api-card-endpoints-list";
import { DeveloperApiCardFooter } from "./developer-api-card-footer";
import { DeveloperApiCardKeySection } from "./developer-api-card-key-section";
import { useDeveloperApiCard } from "./use-developer-api-card";

interface DeveloperApiCardProps {
    businessId: string;
    apiKey?: string | null;
}

export function DeveloperApiCard({ businessId, apiKey: initialKey }: DeveloperApiCardProps) {
    const d = useDeveloperApiCard(businessId, initialKey);

    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sync-action to-primary w-full" />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                            <Code2 className="h-5 w-5 text-sync-action dark:text-sync-action" />
                        </div>
                        <div>
                            <p className="font-semibold text-base">Developer API</p>
                            <p className="text-sm text-muted-foreground">
                                Send review requests programmatically
                            </p>
                        </div>
                    </div>
                    {d.apiKey && (
                        <Badge className="bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2 border-0 text-xs">
                            Active
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-3">
                <DeveloperApiCardKeySection
                    apiKey={d.apiKey}
                    maskedKey={d.maskedKey}
                    showKey={d.showKey}
                    onToggleShowKey={() => d.setShowKey(!d.showKey)}
                    copied={d.copied}
                    onCopy={d.handleCopy}
                    isGenerating={d.isGenerating}
                    onGenerate={d.handleGenerate}
                />
                <DeveloperApiCardBaseUrlSection
                    apiBase={d.apiBase}
                    baseCopied={d.baseCopied}
                    onCopyBaseUrl={d.handleCopyBaseUrl}
                />
                <DeveloperApiCardEndpointsList />
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t bg-muted/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <DeveloperApiCardFooter hasApiKey={!!d.apiKey} onRegenerate={d.handleGenerate} />
            </CardFooter>
        </Card>
    );
}
