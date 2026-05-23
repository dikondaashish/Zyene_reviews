"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LodgingPatches } from "@/services/google/lodging-merge";
import type { GoogleLodgingJson } from "@/components/settings/google-lodging-types";
import { googleLodgingBoolVal } from "@/components/settings/google-lodging-bool";

export function GoogleLodgingPoliciesTab({
    lodging,
    onSave,
    saving,
}: {
    lodging: GoogleLodgingJson;
    onSave: (p: LodgingPatches) => void;
    saving: boolean;
}) {
    const pol = (lodging.policies as Record<string, unknown>) || {};
    const [smokeFree, setSmokeFree] = useState(googleLodgingBoolVal(pol.smokeFreeProperty));
    const [kidsFree, setKidsFree] = useState(googleLodgingBoolVal(pol.kidsStayFree));

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
