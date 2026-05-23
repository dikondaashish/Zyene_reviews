"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { GoogleLodgingJson } from "@/components/settings/google-lodging-types";
import type { LodgingPatches } from "@/services/google/lodging-merge";
import { GoogleLodgingPropertyTab } from "@/components/settings/google-lodging-property-tab";
import { GoogleLodgingServicesTab } from "@/components/settings/google-lodging-services-tab";
import { GoogleLodgingConnectivityParkingTab } from "@/components/settings/google-lodging-connectivity-parking-tab";
import { GoogleLodgingPetsBusinessTab } from "@/components/settings/google-lodging-pets-business-tab";
import { GoogleLodgingAccessibilityHousekeepingTab } from "@/components/settings/google-lodging-accessibility-housekeeping-tab";
import { GoogleLodgingPoliciesTab } from "@/components/settings/google-lodging-policies-tab";

export function GoogleLodgingPanelLoaded({
    lodging,
    healthScore,
    saving,
    tabsVersion,
    load,
    loadGoogleUpdated,
    patch,
    googleDiff,
    diffOpen,
    setDiffOpen,
}: {
    lodging: GoogleLodgingJson;
    healthScore: number;
    saving: boolean;
    tabsVersion: number;
    load: () => void | Promise<void>;
    loadGoogleUpdated: () => void | Promise<void>;
    patch: (p: LodgingPatches) => void | Promise<void>;
    googleDiff: { lodging: unknown; diffMask: string | null } | null;
    diffOpen: boolean;
    setDiffOpen: (v: boolean) => void;
}) {
    const meta = (lodging.metadata as { updateTime?: string } | undefined)?.updateTime;

    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <p className="text-sm font-medium">Lodging data completeness</p>
                        <p className="text-xs text-muted-foreground">
                            {meta ? `Google last asserted: ${meta}` : "Metadata timestamp from Google"}
                        </p>
                    </div>
                    <span className="text-xl font-bold tabular-nums">{healthScore}</span>
                </div>
                <Progress value={healthScore} className="h-2" />
                <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={saving}>
                        <RefreshCw className="mr-1.5 size-3.5" />
                        Reload
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => void loadGoogleUpdated()}>
                        Google-edited fields
                    </Button>
                    <Dialog open={diffOpen} onOpenChange={setDiffOpen}>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Google-updated lodging fields</DialogTitle>
                            </DialogHeader>
                            {googleDiff?.diffMask && (
                                <p className="text-xs text-muted-foreground break-all">Mask: {googleDiff.diffMask}</p>
                            )}
                            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-96">
                                {JSON.stringify(googleDiff?.lodging ?? {}, null, 2)}
                            </pre>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs key={tabsVersion} defaultValue="property" className="w-full">
                <TabsList
                    variant="line"
                    className="flex h-auto w-full min-w-0 flex-wrap justify-start gap-0 border-b border-border p-0"
                >
                    <TabsTrigger value="property">Property</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="connectivity">Wi‑Fi & parking</TabsTrigger>
                    <TabsTrigger value="pets">Pets & business</TabsTrigger>
                    <TabsTrigger value="accessibility">Access & housekeeping</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="json">All data</TabsTrigger>
                </TabsList>

                <TabsContent value="property" className="mt-4">
                    <GoogleLodgingPropertyTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="services" className="mt-4">
                    <GoogleLodgingServicesTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="connectivity" className="mt-4">
                    <GoogleLodgingConnectivityParkingTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="pets" className="mt-4">
                    <GoogleLodgingPetsBusinessTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="accessibility" className="mt-4">
                    <GoogleLodgingAccessibilityHousekeepingTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="policies" className="mt-4">
                    <GoogleLodgingPoliciesTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="json" className="mt-4">
                    <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-[480px]">
                        {JSON.stringify(lodging, null, 2)}
                    </pre>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export function GoogleLodgingPanelLoading() {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="animate-spin size-4" />
            Checking Google lodging API…
        </div>
    );
}

export function GoogleLodgingPanelUnavailable() {
    return (
        <p className="text-sm text-muted-foreground py-4">
            This location is not a <strong>lodging / hotel</strong> listing on Google, or Google has no lodging record
            yet. The Lodging API applies to hotels, motels, inns, and similar categories. Your reviews and general
            listing tools still work normally.
        </p>
    );
}

export function GoogleLodgingPanelEmpty() {
    return (
        <p className="text-sm text-muted-foreground py-4">
            Could not load lodging data. Try again or run a full Google sync from the dashboard.
        </p>
    );
}
