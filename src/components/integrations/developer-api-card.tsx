"use client";

import { Code2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeveloperApiCardBaseUrlSection } from "./developer-api-card-base-url-section";
import { DeveloperApiCardEndpointsList } from "./developer-api-card-endpoints-list";
import { DeveloperApiCardFooter } from "./developer-api-card-footer";
import { DeveloperApiCardKeySection } from "./developer-api-card-key-section";
import { useDeveloperApiCard } from "./use-developer-api-card";
import type { PublicApiKey } from "@/lib/api-keys/credentials";

interface DeveloperApiCardProps {
    businessId: string;
    apiKey: PublicApiKey | null;
    canManage: boolean;
}

export function DeveloperApiCard({ businessId, apiKey: initialKey, canManage }: DeveloperApiCardProps) {
    const d = useDeveloperApiCard(businessId, initialKey);

    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sync-action to-primary w-full" />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 size-10">
                            <Code2 className="text-sync-action dark:text-sync-action size-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-base">Developer API</p>
                            <p className="text-sm text-muted-foreground">
                                Send review requests programmatically
                            </p>
                        </div>
                    </div>
                    {d.apiKey && !d.apiKey.revokedAt && (
                        <Badge className="bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2 border-0 text-xs">
                            Active
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-3">
                <DeveloperApiCardKeySection
                    apiKey={d.apiKey}
                    newSecret={d.newSecret}
                    copied={d.copied}
                    onCopy={d.handleCopy}
                    pending={d.pending}
                    canManage={canManage}
                    onDismiss={d.dismissSecret}
                    onCreate={d.handleCreate}
                />
                <DeveloperApiCardBaseUrlSection
                    apiBase={d.apiBase}
                    baseCopied={d.baseCopied}
                    onCopyBaseUrl={d.handleCopyBaseUrl}
                />
                <DeveloperApiCardEndpointsList />
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t bg-muted/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <DeveloperApiCardFooter
                    hasApiKey={Boolean(d.apiKey)}
                    canManage={canManage}
                    pending={d.pending}
                    onRotate={d.handleRotate}
                    onRevoke={d.handleRevoke}
                />
            </CardFooter>
        </Card>
    );
}
