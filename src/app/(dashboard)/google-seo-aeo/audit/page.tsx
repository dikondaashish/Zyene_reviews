import Link from "next/link";
import { Building2, Globe2 } from "lucide-react";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadAuditPageData } from "./load-audit-page-data";
import { AuditRunControls } from "./audit-run-controls";
import { AuditFindingsList } from "./audit-findings-list";
import { GoogleSeoAeoSubnav } from "../google-seo-aeo-subnav";

export default async function TechnicalAuditPage() {
    const data = await loadAuditPageData();

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Building2}
                title="Add a business to run a technical audit"
                description="Technical audits are scoped to your active location. Create or select a business first."
            />
        );
    }

    if (data.kind === "no-website") {
        return (
            <div className="space-y-6 p-4 md:p-8">
                <h2 className="text-3xl font-bold tracking-tight">Technical audit</h2>
                <Card>
                    <CardContent className="flex flex-col items-start gap-3 py-8">
                        <Globe2 className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            {data.businessName} has no website on file. Add one before we can crawl and audit it.
                        </p>
                        <Button asChild>
                            <Link href="/settings/business-information">Add website</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-w-0 space-y-6 overflow-x-hidden p-4 md:p-8">
            <GoogleSeoAeoSubnav active="/google-seo-aeo/audit" />
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Technical audit</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    What&apos;s stopping AI engines and search from reading and citing {data.businessName}&apos;s site.
                </p>
            </div>

            <AuditRunControls
                businessId={data.businessId}
                latestRun={data.latestRun}
                liveCrawlingEnabled={data.liveCrawlingEnabled}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Findings</CardTitle>
                    <CardDescription>
                        {data.latestRun && (data.latestRun.status === "success" || data.latestRun.status === "partial")
                            ? "Ranked by severity. \"Impact\" shows whether we have direct evidence this affects a specific prompt, or it's plausible but unconfirmed."
                            : "Findings appear here once a crawl completes."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data.latestRun && (data.latestRun.status === "success" || data.latestRun.status === "partial") ? (
                        <AuditFindingsList findings={data.findings} />
                    ) : (
                        <p className="py-6 text-sm text-muted-foreground">
                            {data.latestRun
                                ? "Waiting for the current crawl to finish."
                                : "No audit has run yet — click \"Run technical audit\" above to start one."}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
