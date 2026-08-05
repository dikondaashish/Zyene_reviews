import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RunAuditControls } from "@/components/google-seo-aeo/run-audit-controls";
import { areEstimatedAeoSurfacesEnabled } from "@/lib/features/aeo-surfaces";
import { getAuditFixAction } from "./google-seo-aeo-audit-utils";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";

export function GoogleSeoAeoScoreAuditSection({ content }: { content: GoogleSeoAeoContentProps }) {
    // Unmeasured checks are listed separately: showing them beside real pass/fail
    // rows with a Fix button implies we audited something we never looked at.
    const measured = content.audits.filter((a) => a.status !== "pending");
    const unmeasured = content.audits.filter((a) => a.status === "pending");

    return (
        <>
            <div className="flex min-w-0 flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Google SEO/AEO</h2>
                <p className="text-sm text-muted-foreground">
                    Optimization diagnostics and direct Google-ready fixes for {content.businessName}.
                </p>
            </div>

            {/* Sync only drives the estimated surfaces; the audit below refreshes on load. */}
            {areEstimatedAeoSurfacesEnabled() ? <RunAuditControls businessId={content.businessId} /> : null}

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
                        Scored on {content.measuredCount} of {content.audits.length} checks
                        {unmeasured.length > 0 ? ` · ${unmeasured.length} not yet measured` : ""}.
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
                    {measured.map((a) => {
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
                                        ) : (
                                            <XCircle className="text-sync-action size-4" />
                                        )}
                                        <p className="font-medium">{a.label}</p>
                                        <Badge variant={a.status === "pass" ? "secondary" : "destructive"}>
                                            {a.status === "pass" ? "Pass" : "Fail"}
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

            {unmeasured.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Not yet measured</CardTitle>
                        <CardDescription>
                            These checks are not implemented yet, so they are excluded from your score. They are
                            listed here so the audit is not mistaken for full coverage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {unmeasured.map((a) => (
                            <div key={a.id} className="flex items-center gap-2 rounded-lg border border-dashed p-3">
                                <span className="border-muted-foreground/40 inline-flex size-4 shrink-0 rounded-full border" />
                                <p className="text-muted-foreground text-sm">{a.label}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : null}
        </>
    );
}
