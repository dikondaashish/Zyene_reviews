"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LodgingPatches } from "@/services/google/lodging-merge";
import type { GoogleLodgingJson } from "@/components/settings/google-lodging-types";
import { googleLodgingBoolVal } from "@/components/settings/google-lodging-bool";

export function GoogleLodgingServicesTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: GoogleLodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const s = (lodging.services as Record<string, unknown>) || {};
    const [frontDesk, setFrontDesk] = useState(() => googleLodgingBoolVal(s.frontDesk));
    const [hour24, setHour24] = useState(() => googleLodgingBoolVal(s.twentyFourHourFrontDesk));
    const [concierge, setConcierge] = useState(() => googleLodgingBoolVal(s.concierge));
    const [elevator, setElevator] = useState(() => googleLodgingBoolVal(s.elevator));
    const [baggage, setBaggage] = useState(() => googleLodgingBoolVal(s.baggageStorage));

    return (
        <div className="space-y-4 max-w-md">
            {[
                ["Front desk", frontDesk, setFrontDesk],
                ["24-hour front desk", hour24, setHour24],
                ["Concierge", concierge, setConcierge],
                ["Elevator", elevator, setElevator],
                ["Baggage storage", baggage, setBaggage],
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
                        services: {
                            frontDesk,
                            twentyFourHourFrontDesk: hour24,
                            concierge,
                            elevator,
                            baggageStorage: baggage,
                        },
                    })
                }
            >
                Save services
            </Button>
        </div>
    );
}
