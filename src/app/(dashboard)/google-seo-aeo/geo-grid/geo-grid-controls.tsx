"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { estimateGeoGridCostMicroUsd, type GeoGridSize } from "@/services/aeo/geo-grid/geo-grid-plan";
import { runGeoGridNow } from "./run-geo-grid-action";

const GRID_SIZES: GeoGridSize[] = [5, 7, 9];

export function GeoGridControls({
    businessId,
    liveSamplingEnabled,
    maxGridSize,
}: {
    businessId: string;
    liveSamplingEnabled: boolean;
    maxGridSize: GeoGridSize | 0;
}) {
    const [keyword, setKeyword] = React.useState("");
    const [gridSize, setGridSize] = React.useState<GeoGridSize>(maxGridSize || 5);
    const [spacingMiles, setSpacingMiles] = React.useState<0.5 | 1 | 2>(1);
    const [pending, setPending] = React.useState(false);
    const router = useRouter();
    const enabled = liveSamplingEnabled && maxGridSize > 0;
    const requests = gridSize * gridSize;
    const estimate = estimateGeoGridCostMicroUsd(gridSize) / 1_000_000;

    async function run(event: React.FormEvent) {
        event.preventDefault();
        setPending(true);
        const result = await runGeoGridNow({ businessId, keyword, gridSize, spacingMiles });
        setPending(false);
        if (!result.success) {
            toast.error(result.error, result.upgradeHref ? {
                action: { label: "Upgrade", onClick: () => window.location.assign(result.upgradeHref as string) },
            } : undefined);
            return;
        }
        toast.success("Geo-grid queued. Failed searches will appear as gaps, not rankings.");
        setKeyword("");
        router.refresh();
    }

    return (
        <form onSubmit={run} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_140px_auto] md:items-end">
                <div className="space-y-1.5">
                    <Label htmlFor="geo-keyword">Keyword</Label>
                    <Input id="geo-keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                        placeholder="e.g. barbecue restaurant" maxLength={120} disabled={pending || !enabled} />
                </div>
                <div className="space-y-1.5">
                    <Label>Grid</Label>
                    <Select value={String(gridSize)} onValueChange={(v) => setGridSize(Number(v) as GeoGridSize)}
                        disabled={pending || !enabled}>
                        <SelectTrigger aria-label="Grid size"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {GRID_SIZES.filter((size) => size <= maxGridSize).map((size) => (
                                <SelectItem key={size} value={String(size)}>{size} by {size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Spacing</Label>
                    <Select value={String(spacingMiles)} onValueChange={(v) => setSpacingMiles(Number(v) as 0.5 | 1 | 2)}
                        disabled={pending || !enabled}>
                        <SelectTrigger aria-label="Grid spacing"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0.5">0.5 mile</SelectItem>
                            <SelectItem value="1">1 mile</SelectItem>
                            <SelectItem value="2">2 miles</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" disabled={pending || !enabled || keyword.trim().length < 2}>
                    <MapPin className="mr-2 size-4" />{pending ? "Queueing..." : "Run grid"}
                </Button>
            </div>
            <p className="text-muted-foreground text-xs">
                {enabled
                    ? `${requests} paid searches. Estimated provider cost $${estimate.toFixed(3)}. One run per hour.`
                    : liveSamplingEnabled
                      ? "Your current plan does not include geo-grid runs."
                      : "Live sampling is switched off for this deployment."}
            </p>
        </form>
    );
}
