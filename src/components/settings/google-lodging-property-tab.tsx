"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LodgingPatches } from "@/services/google/lodging-merge";
import type { GoogleLodgingJson } from "@/components/settings/google-lodging-types";

export function GoogleLodgingPropertyTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: GoogleLodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const p = (lodging.property as Record<string, unknown>) || {};
    const [rooms, setRooms] = useState(String(p.roomsCount ?? ""));
    const [floors, setFloors] = useState(String(p.floorsCount ?? ""));
    const [built, setBuilt] = useState(String(p.builtYear ?? ""));
    const [reno, setReno] = useState(String(p.lastRenovatedYear ?? ""));

    return (
        <div className="space-y-4 max-w-md">
            <div className="grid gap-2">
                <Label>Rooms (guest bookable)</Label>
                <Input type="number" min={0} value={rooms} onChange={(e) => setRooms(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label>Floors (guest accessible)</Label>
                <Input type="number" min={0} value={floors} onChange={(e) => setFloors(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label>Year built</Label>
                <Input type="number" min={1800} max={2100} value={built} onChange={(e) => setBuilt(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label>Last renovated year</Label>
                <Input type="number" min={1800} max={2100} value={reno} onChange={(e) => setReno(e.target.value)} />
            </div>
            <Button
                disabled={saving}
                onClick={() => {
                    const patches: LodgingPatches = { property: {} };
                    if (rooms.trim() !== "") {
                        const n = parseInt(rooms, 10);
                        if (!Number.isNaN(n)) patches.property!.roomsCount = n;
                    }
                    if (floors.trim() !== "") {
                        const n = parseInt(floors, 10);
                        if (!Number.isNaN(n)) patches.property!.floorsCount = n;
                    }
                    if (built.trim() !== "") {
                        const n = parseInt(built, 10);
                        if (!Number.isNaN(n)) patches.property!.builtYear = n;
                    }
                    if (reno.trim() !== "") {
                        const n = parseInt(reno, 10);
                        if (!Number.isNaN(n)) patches.property!.lastRenovatedYear = n;
                    }
                    if (Object.keys(patches.property!).length === 0) {
                        toast.message("Enter at least one value to update.");
                        return;
                    }
                    onSave(patches);
                }}
            >
                Save property
            </Button>
        </div>
    );
}
