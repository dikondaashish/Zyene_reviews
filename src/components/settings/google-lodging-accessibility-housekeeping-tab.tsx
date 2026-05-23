"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LodgingPatches } from "@/services/google/lodging-merge";
import type { GoogleLodgingJson } from "@/components/settings/google-lodging-types";
import { googleLodgingBoolVal } from "@/components/settings/google-lodging-bool";

export function GoogleLodgingAccessibilityHousekeepingTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: GoogleLodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const a = (lodging.accessibility as Record<string, unknown>) || {};
    const h = (lodging.housekeeping as Record<string, unknown>) || {};
    const [mob, setMob] = useState(googleLodgingBoolVal(a.mobilityAccessible));
    const [mobPark, setMobPark] = useState(googleLodgingBoolVal(a.mobilityAccessibleParking));
    const [mobEl, setMobEl] = useState(googleLodgingBoolVal(a.mobilityAccessibleElevator));
    const [hk, setHk] = useState(googleLodgingBoolVal(h.housekeepingAvailable));
    const [daily, setDaily] = useState(googleLodgingBoolVal(h.dailyHousekeeping));

    return (
        <div className="space-y-4 max-w-md">
            <p className="text-sm font-medium">Accessibility</p>
            {[
                ["Mobility accessible", mob, setMob],
                ["Accessible parking", mobPark, setMobPark],
                ["Accessible elevator", mobEl, setMobEl],
            ].map(([label, val, set]) => (
                <div key={label as string} className="flex items-center justify-between gap-4">
                    <Label>{label as string}</Label>
                    <Switch checked={val as boolean} onCheckedChange={set as (c: boolean) => void} />
                </div>
            ))}
            <p className="text-sm font-medium pt-2">Housekeeping</p>
            {[
                ["Housekeeping available", hk, setHk],
                ["Daily housekeeping", daily, setDaily],
            ].map(([label, val, set]) => (
                <div key={label as string} className="flex items-center justify-between gap-4">
                    <Label>{label as string}</Label>
                    <Switch checked={val as boolean} onCheckedChange={set as (c: boolean) => void} />
                </div>
            ))}
            <Button
                disabled={saving}
                onClick={() =>
                    onSave({
                        accessibility: {
                            mobilityAccessible: mob,
                            mobilityAccessibleParking: mobPark,
                            mobilityAccessibleElevator: mobEl,
                        },
                        housekeeping: {
                            housekeepingAvailable: hk,
                            dailyHousekeeping: daily,
                        },
                    })
                }
            >
                Save accessibility & housekeeping
            </Button>
        </div>
    );
}
