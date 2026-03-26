"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { LodgingPatches } from "@/services/google/lodging-merge";

type LodgingJson = Record<string, unknown>;

export function GoogleLodgingPanel({ businessId }: { businessId: string }) {
    const [loading, setLoading] = useState(true);
    const [lodging, setLodging] = useState<LodgingJson | null>(null);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [healthScore, setHealthScore] = useState(0);
    const [saving, setSaving] = useState(false);
    const [googleDiff, setGoogleDiff] = useState<{ lodging: unknown; diffMask: string | null } | null>(null);
    const [diffOpen, setDiffOpen] = useState(false);
    const [tabsVersion, setTabsVersion] = useState(0);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/google/lodging?businessId=${encodeURIComponent(businessId)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load");
            if (!data.available) {
                setAvailable(false);
                setLodging(null);
                setHealthScore(0);
                return;
            }
            setAvailable(true);
            setLodging(data.lodging);
            setHealthScore(data.healthScore ?? 0);
            setTabsVersion((x) => x + 1);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to load lodging");
            setAvailable(null);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        load();
    }, [load]);

    const patch = async (patches: LodgingPatches) => {
        setSaving(true);
        try {
            const res = await fetch("/api/google/lodging", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, patches }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");
            toast.success("Lodging updated on Google");
            setLodging((data.lodging as LodgingJson) || null);
            if (typeof data.healthScore === "number") setHealthScore(data.healthScore);
            setTabsVersion((x) => x + 1);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const loadGoogleUpdated = async () => {
        try {
            const res = await fetch(
                `/api/google/lodging/google-updated?businessId=${encodeURIComponent(businessId)}`
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Request failed");
            setGoogleDiff({ lodging: data.lodging, diffMask: data.diffMask });
            setDiffOpen(true);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Could not load Google updates");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking Google lodging API…
            </div>
        );
    }

    if (available === false) {
        return (
            <p className="text-sm text-muted-foreground py-4">
                This location is not a <strong>lodging / hotel</strong> listing on Google, or Google has no lodging
                record yet. The Lodging API applies to hotels, motels, inns, and similar categories. Your reviews and
                general listing tools still work normally.
            </p>
        );
    }

    if (!lodging) {
        return (
            <p className="text-sm text-muted-foreground py-4">
                Could not load lodging data. Try again or run a full Google sync from the dashboard.
            </p>
        );
    }

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
                    <Button type="button" variant="outline" size="sm" onClick={load} disabled={saving}>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Reload
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={loadGoogleUpdated}>
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
                <TabsList className="flex flex-wrap h-auto gap-1">
                    <TabsTrigger value="property">Property</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="connectivity">Wi‑Fi & parking</TabsTrigger>
                    <TabsTrigger value="pets">Pets & business</TabsTrigger>
                    <TabsTrigger value="accessibility">Access & housekeeping</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="json">All data</TabsTrigger>
                </TabsList>

                <TabsContent value="property" className="mt-4">
                    <PropertyTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="services" className="mt-4">
                    <ServicesTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="connectivity" className="mt-4">
                    <ConnectivityParkingTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="pets" className="mt-4">
                    <PetsBusinessTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="accessibility" className="mt-4">
                    <AccessibilityHousekeepingTab lodging={lodging} onSave={patch} saving={saving} />
                </TabsContent>
                <TabsContent value="policies" className="mt-4">
                    <PoliciesTab lodging={lodging} onSave={patch} saving={saving} />
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

function PropertyTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: LodgingJson;
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

function boolVal(v: unknown): boolean {
    return v === true;
}

function ServicesTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: LodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const s = (lodging.services as Record<string, unknown>) || {};
    const [frontDesk, setFrontDesk] = useState(boolVal(s.frontDesk));
    const [hour24, setHour24] = useState(boolVal(s.twentyFourHourFrontDesk));
    const [concierge, setConcierge] = useState(boolVal(s.concierge));
    const [elevator, setElevator] = useState(boolVal(s.elevator));
    const [baggage, setBaggage] = useState(boolVal(s.baggageStorage));

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

function ConnectivityParkingTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: LodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const c = (lodging.connectivity as Record<string, unknown>) || {};
    const pk = (lodging.parking as Record<string, unknown>) || {};
    const [wifi, setWifi] = useState(boolVal(c.wifiAvailable));
    const [freeWifi, setFreeWifi] = useState(boolVal(c.freeWifi));
    const [publicWifi, setPublicWifi] = useState(boolVal(c.publicAreaWifiAvailable));
    const [parking, setParking] = useState(boolVal(pk.parkingAvailable));
    const [freePark, setFreePark] = useState(boolVal(pk.freeParking));
    const [selfPark, setSelfPark] = useState(boolVal(pk.selfParkingAvailable));
    const [valet, setValet] = useState(boolVal(pk.valetParkingAvailable));

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

function PetsBusinessTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: LodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const pets = (lodging.pets as Record<string, unknown>) || {};
    const b = (lodging.business as Record<string, unknown>) || {};
    const [petsAllowed, setPetsAllowed] = useState(boolVal(pets.petsAllowed));
    const [dogs, setDogs] = useState(boolVal(pets.dogsAllowed));
    const [cats, setCats] = useState(boolVal(pets.catsAllowed));
    const [petsFree, setPetsFree] = useState(boolVal(pets.petsAllowedFree));
    const [bizCenter, setBizCenter] = useState(boolVal(b.businessCenter));
    const [meetRooms, setMeetRooms] = useState(boolVal(b.meetingRooms));
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
                        <Label>{label as string}</Label>
                        <Switch checked={val as boolean} onCheckedChange={set as (c: boolean) => void} />
                    </div>
                ))}
            </div>
            <div className="space-y-3">
                <p className="text-sm font-medium">Business traveler</p>
                <div className="flex items-center justify-between gap-4">
                    <Label>Business center</Label>
                    <Switch checked={bizCenter} onCheckedChange={setBizCenter} />
                </div>
                <div className="flex items-center justify-between gap-4">
                    <Label>Meeting rooms</Label>
                    <Switch checked={meetRooms} onCheckedChange={setMeetRooms} />
                </div>
                <div className="grid gap-2">
                    <Label>Meeting room count</Label>
                    <Input type="number" min={0} value={meetCount} onChange={(e) => setMeetCount(e.target.value)} />
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

function AccessibilityHousekeepingTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: LodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const a = (lodging.accessibility as Record<string, unknown>) || {};
    const h = (lodging.housekeeping as Record<string, unknown>) || {};
    const [mob, setMob] = useState(boolVal(a.mobilityAccessible));
    const [mobPark, setMobPark] = useState(boolVal(a.mobilityAccessibleParking));
    const [mobEl, setMobEl] = useState(boolVal(a.mobilityAccessibleElevator));
    const [hk, setHk] = useState(boolVal(h.housekeepingAvailable));
    const [daily, setDaily] = useState(boolVal(h.dailyHousekeeping));

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

function PoliciesTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: LodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const pol = (lodging.policies as Record<string, unknown>) || {};
    const [smokeFree, setSmokeFree] = useState(boolVal(pol.smokeFreeProperty));
    const [kidsFree, setKidsFree] = useState(boolVal(pol.kidsStayFree));

    return (
        <div className="space-y-4 max-w-md">
            <div className="flex items-center justify-between gap-4">
                <Label>Smoke-free property</Label>
                <Switch checked={smokeFree} onCheckedChange={setSmokeFree} />
            </div>
            <div className="flex items-center justify-between gap-4">
                <Label>Kids stay free</Label>
                <Switch checked={kidsFree} onCheckedChange={setKidsFree} />
            </div>
            <Button
                disabled={saving}
                onClick={() =>
                    onSave({
                        policies: { smokeFreeProperty: smokeFree, kidsStayFree: kidsFree },
                    })
                }
            >
                Save policies
            </Button>
        </div>
    );
}
