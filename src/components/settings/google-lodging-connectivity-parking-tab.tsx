"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LodgingPatches } from "@/services/google/lodging-merge";
import type { GoogleLodgingJson } from "@/components/settings/google-lodging-types";
import { googleLodgingBoolVal } from "@/components/settings/google-lodging-bool";

export function GoogleLodgingConnectivityParkingTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: GoogleLodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const c = (lodging.connectivity as Record<string, unknown>) || {};
    const pk = (lodging.parking as Record<string, unknown>) || {};
    const [wifi, setWifi] = useState(googleLodgingBoolVal(c.wifiAvailable));
    const [freeWifi, setFreeWifi] = useState(googleLodgingBoolVal(c.freeWifi));
    const [publicWifi, setPublicWifi] = useState(googleLodgingBoolVal(c.publicAreaWifiAvailable));
    const [parking, setParking] = useState(googleLodgingBoolVal(pk.parkingAvailable));
    const [freePark, setFreePark] = useState(googleLodgingBoolVal(pk.freeParking));
    const [selfPark, setSelfPark] = useState(googleLodgingBoolVal(pk.selfParkingAvailable));
    const [valet, setValet] = useState(googleLodgingBoolVal(pk.valetParkingAvailable));

    return (
        <div className="space-y-6 max-w-md">
            <div className="space-y-3">
                <p className="text-sm font-medium">Connectivity</p>
                {[
                    ["Wi‑Fi available", wifi, setWifi],
                    ["Free Wi‑Fi", freeWifi, setFreeWifi],
                    ["Public area Wi‑Fi", publicWifi, setPublicWifi],
                ].map(([label, val, set]) => (
                    <div key={label as string} className="flex items-center justify-between gap-4">
                        <Label>{label as string}</Label>
                        <Switch checked={val as boolean} onCheckedChange={set as (c: boolean) => void} />
                    </div>
                ))}
            </div>
            <div className="space-y-3">
                <p className="text-sm font-medium">Parking</p>
                {[
                    ["Parking available", parking, setParking],
                    ["Free parking", freePark, setFreePark],
                    ["Self parking", selfPark, setSelfPark],
                    ["Valet parking", valet, setValet],
                ].map(([label, val, set]) => (
                    <div key={label as string} className="flex items-center justify-between gap-4">
                        <Label>{label as string}</Label>
                        <Switch checked={val as boolean} onCheckedChange={set as (c: boolean) => void} />
                    </div>
                ))}
            </div>
            <Button
                disabled={saving}
                onClick={() =>
                    onSave({
                        connectivity: {
                            wifiAvailable: wifi,
                            freeWifi,
                            publicAreaWifiAvailable: publicWifi,
                        },
                        parking: {
                            parkingAvailable: parking,
                            freeParking: freePark,
                            selfParkingAvailable: selfPark,
                            valetParkingAvailable: valet,
                        },
                    })
                }
            >
                Save connectivity & parking
            </Button>
        </div>
    );
}
