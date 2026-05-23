import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RunAuditControls } from "@/components/google-seo-aeo/run-audit-controls";
import { getAuditFixAction } from "./google-seo-aeo-audit-utils";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";

export function GoogleSeoAeoScoreAuditSection({ content }: { content: GoogleSeoAeoContentProps }) {
    return (
        <>
            <div className="flex min-w-0 flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Google SEO/AEO</h2>
                <p className="text-sm text-muted-foreground">
                    Optimization diagnostics and direct Google-ready fixes for {content.businessName}.
                </p>
            </div>

            <RunAuditControls businessId={content.businessId} />

            <Card>
                <CardHeader>
                    <CardTitle className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span>Optimization Score</span>
                        <span className="text-3xl font-bold">{content.score}%</span>
                    </CardTitle>
                    <CardDescription>
                        {content.businessName} · {content.businessAddress} · {content.googleAvgLive.toFixed(1)}/5 ·{" "}
                        {content.googleCountLive.toLocaleString()} reviews (visible in Zyene)
                        {" · "}
                        Based on {content.measuredCount} measured checks.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Audit Results</CardTitle>
                    <CardDescription>
                        SEO/AEO requirements with pass/fail status and direct fix actions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {content.audits.map((a) => {
                        const fixAction = getAuditFixAction(a.id);
                        return (
                            <div
                                key={a.id}
                                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {a.status === "pass" ? (
                                            <CheckCircle2 className="text-chart-2 size-4" />
                                        ) : a.status === "fail" ? (
                                            <XCircle className="text-sync-action size-4" />
                                        ) : (
                                            <span className="inline-flex rounded-full border border-muted-foreground/40 size-4" />
                                        )}
                                        <p className="font-medium">{a.label}</p>
                                        <Badge
                                            variant={
                                                a.status === "pass"
                                                    ? "secondary"
                                                    : a.status === "fail"
                                                      ? "destructive"
                                                      : "outline"
                                            }
                                        >
                                            {a.status === "pass"
                                                ? "Pass"
                                                : a.status === "fail"
                                                  ? "Fail"
                                                  : "Pending"}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{a.detail}</p>
                                </div>
                                <Button asChild size="sm" variant="outline" className="w-full shrink-0 sm:w-auto">
                                    <Link href={fixAction.href}>{fixAction.label}</Link>
                                </Button>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </>
    );
}
