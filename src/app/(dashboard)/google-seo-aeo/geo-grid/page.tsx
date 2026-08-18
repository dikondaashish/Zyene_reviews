import { Building2 } from "lucide-react";

import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadGeoGridPageData } from "./load-geo-grid-page-data";
import { GeoGridControls } from "./geo-grid-controls";
import { GeoGridMap } from "./geo-grid-map";
import { GoogleSeoAeoSubnav } from "../google-seo-aeo-subnav";

export default async function GeoGridPage() {
    const data = await loadGeoGridPageData();

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Building2}
                title="Add a business to run a geo-grid"
                description="A geo-grid measures local rank around one location. Create or select a business first."
            />
        );
    }

    const run = data.latestRun;

    return (
        <div className="min-w-0 space-y-6 overflow-x-hidden p-4 md:p-8">
            <GoogleSeoAeoSubnav active="/google-seo-aeo/geo-grid" />
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Local geo-grid</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Where {data.businessName} actually ranks in Google Maps across real coordinates.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Run a grid</CardTitle>
                    <CardDescription>
                        Every cell is a real Google search from a real coordinate. Nothing here is
                        interpolated or estimated.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <GeoGridControls
                        businessId={data.businessId}
                        liveSamplingEnabled={data.liveSamplingEnabled}
                        maxGridSize={data.maxGridSize}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {run ? `“${run.keyword}”` : "Latest grid"}
                        {run ? (
                            <span className="text-muted-foreground ml-2 text-sm font-normal">
                                {run.status === "running"
                                    ? "running…"
                                    : run.averageRank !== null
                                      ? `avg rank ${run.averageRank.toFixed(1)} · found in ${run.foundCells} of ${run.searchedCells} searched cells`
                                      : `not in the local pack in any of ${run.searchedCells} searched cells`}
                            </span>
                        ) : null}
                    </CardTitle>
                    {run?.status === "partial" ? (
                        <CardDescription>
                            Some cells could not be searched. They are shown as no-data and excluded
                            from the average rather than counted as “not found”.
                        </CardDescription>
                    ) : null}
                    {run?.errorMessage ? (
                        <CardDescription>{run.errorMessage}</CardDescription>
                    ) : null}
                    {run ? (
                        <CardDescription>
                            Estimated provider cost ${(run.estimatedCostMicroUsd / 1_000_000).toFixed(3)}
                            {run.actualCostMicroUsd === null
                                ? ""
                                : ` · actual $${(run.actualCostMicroUsd / 1_000_000).toFixed(3)}`}
                        </CardDescription>
                    ) : null}
                </CardHeader>
                <CardContent>
                    {run && run.points.length > 0 ? (
                        <GeoGridMap size={run.gridSize} points={run.points} />
                    ) : (
                        <p className="text-muted-foreground py-6 text-sm">
                            {run
                                ? "Waiting for the current grid to finish."
                                : "No geo-grid has run yet. Enter a keyword above to measure your local rank."}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
