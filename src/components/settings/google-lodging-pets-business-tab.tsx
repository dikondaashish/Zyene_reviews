"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LodgingPatches } from "@/services/google/lodging-merge";
import type { GoogleLodgingJson } from "@/components/settings/google-lodging-types";
import { googleLodgingBoolVal } from "@/components/settings/google-lodging-bool";

export function GoogleLodgingPetsBusinessTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: GoogleLodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const pets = (lodging.pets as Record<string, unknown>) || {};
    const b = (lodging.business as Record<string, unknown>) || {};
    const [petsAllowed, setPetsAllowed] = useState(() => googleLodgingBoolVal(pets.petsAllowed));
    const [dogs, setDogs] = useState(() => googleLodgingBoolVal(pets.dogsAllowed));
    const [cats, setCats] = useState(() => googleLodgingBoolVal(pets.catsAllowed));
    const [petsFree, setPetsFree] = useState(() => googleLodgingBoolVal(pets.petsAllowedFree));
    const [bizCenter, setBizCenter] = useState(() => googleLodgingBoolVal(b.businessCenter));
    const [meetRooms, setMeetRooms] = useState(() => googleLodgingBoolVal(b.meetingRooms));
    const [meetCount, setMeetCount] = useState(String(b.meetingRoomsCount ?? ""));

    return (
        <div className="space-y-6 max-w-md">
            <div className="space-y-3">
                <p className="text-sm font-medium">Pets</p>
                {[
                    ["Pets allowed", petsAllowed, setPetsAllowed],
                    ["Dogs allowed", dogs, setDogs],
                    ["Cats allowed", cats, setCats],
                    ["Pets stay free", petsFree, setPetsFree],
                ].map(([label, val, set]) => (
                    <div key={label as string} className="flex items-center justify-between gap-4">
                        <Label htmlFor={`lodging-${String(label).replaceAll(" ", "-")}`}>{label as string}</Label>
                        <Switch id={`lodging-${String(label).replaceAll(" ", "-")}`} checked={val as boolean} onCheckedChange={set as (c: boolean) => void} />
                    </div>
                ))}
            </div>
            <div className="space-y-3">
                <p className="text-sm font-medium">Business traveler</p>
                <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="lodging-business-center">Business center</Label>
                    <Switch id="lodging-business-center" checked={bizCenter} onCheckedChange={setBizCenter} />
                </div>
                <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="lodging-meeting-rooms">Meeting rooms</Label>
                    <Switch id="lodging-meeting-rooms" checked={meetRooms} onCheckedChange={setMeetRooms} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="lodging-meeting-room-count">Meeting room count</Label>
                    <Input id="lodging-meeting-room-count" type="number" min={0} value={meetCount} onChange={(e) => setMeetCount(e.target.value)} />
                </div>
            </div>
            <Button
                disabled={saving}
                onClick={() => {
                    const patches: LodgingPatches = {
                        pets: {
                            petsAllowed,
                            dogsAllowed: dogs,
                            catsAllowed: cats,
                            petsAllowedFree: petsFree,
                        },
                        business: {
                            businessCenter: bizCenter,
                            meetingRooms: meetRooms,
                        },
                    };
                    if (meetCount.trim() !== "") {
                        const n = parseInt(meetCount, 10);
                        if (!Number.isNaN(n)) patches.business!.meetingRoomsCount = n;
                    }
                    onSave(patches);
                }}
            >
                Save pets & business
            </Button>
        </div>
    );
}
