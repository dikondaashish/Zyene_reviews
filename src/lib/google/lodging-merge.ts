import type { LodgingRecord } from "./lodging";
import { stripLodgingOutputOnly } from "./lodging";

function ensureObj(root: LodgingRecord, key: string): Record<string, unknown> {
    const cur = root[key];
    if (cur && typeof cur === "object" && !Array.isArray(cur)) {
        return cur as Record<string, unknown>;
    }
    const next: Record<string, unknown> = {};
    root[key] = next;
    return next;
}

function setBoolUnion(
    obj: Record<string, unknown>,
    field: string,
    value: boolean,
    paths: string[],
    pathPrefix: string
): void {
    obj[field] = value;
    delete obj[`${field}Exception`];
    paths.push(`${pathPrefix}.${field}`);
}

export interface LodgingPatches {
    property?: Partial<{
        roomsCount: number;
        floorsCount: number;
        builtYear: number;
        lastRenovatedYear: number;
    }>;
    pets?: Partial<{
        petsAllowed: boolean;
        dogsAllowed: boolean;
        catsAllowed: boolean;
        petsAllowedFree: boolean;
    }>;
    connectivity?: Partial<{
        wifiAvailable: boolean;
        freeWifi: boolean;
        publicAreaWifiAvailable: boolean;
    }>;
    parking?: Partial<{
        parkingAvailable: boolean;
        freeParking: boolean;
        selfParkingAvailable: boolean;
        valetParkingAvailable: boolean;
    }>;
    services?: Partial<{
        frontDesk: boolean;
        twentyFourHourFrontDesk: boolean;
        concierge: boolean;
        elevator: boolean;
        baggageStorage: boolean;
    }>;
    business?: Partial<{
        businessCenter: boolean;
        meetingRooms: boolean;
        meetingRoomsCount: number;
    }>;
    accessibility?: Partial<{
        mobilityAccessible: boolean;
        mobilityAccessibleParking: boolean;
        mobilityAccessibleElevator: boolean;
    }>;
    housekeeping?: Partial<{
        housekeepingAvailable: boolean;
        dailyHousekeeping: boolean;
    }>;
    policies?: Partial<{
        smokeFreeProperty: boolean;
        kidsStayFree: boolean;
    }>;
}

/**
 * Deep-clone base lodging, apply whitelisted patches, return body + FieldMask paths for PATCH.
 */
export function mergeLodgingPatches(base: LodgingRecord, patches: LodgingPatches): {
    body: LodgingRecord;
    updateMask: string;
} {
    const body = structuredClone(base) as LodgingRecord;
    const paths: string[] = [];

    if (patches.property) {
        const p = ensureObj(body, "property");
        const pr = patches.property;
        if (pr.roomsCount !== undefined) {
            p.roomsCount = pr.roomsCount;
            delete p.roomsCountException;
            paths.push("property.roomsCount");
        }
        if (pr.floorsCount !== undefined) {
            p.floorsCount = pr.floorsCount;
            delete p.floorsCountException;
            paths.push("property.floorsCount");
        }
        if (pr.builtYear !== undefined) {
            p.builtYear = pr.builtYear;
            delete p.builtYearException;
            paths.push("property.builtYear");
        }
        if (pr.lastRenovatedYear !== undefined) {
            p.lastRenovatedYear = pr.lastRenovatedYear;
            delete p.lastRenovatedYearException;
            paths.push("property.lastRenovatedYear");
        }
    }

    if (patches.pets) {
        const o = ensureObj(body, "pets");
        for (const k of ["petsAllowed", "dogsAllowed", "catsAllowed", "petsAllowedFree"] as const) {
            if (patches.pets[k] !== undefined) {
                setBoolUnion(o, k, patches.pets[k] as boolean, paths, "pets");
            }
        }
    }

    if (patches.connectivity) {
        const o = ensureObj(body, "connectivity");
        for (const k of ["wifiAvailable", "freeWifi", "publicAreaWifiAvailable"] as const) {
            if (patches.connectivity[k] !== undefined) {
                setBoolUnion(o, k, patches.connectivity[k] as boolean, paths, "connectivity");
            }
        }
    }

    if (patches.parking) {
        const o = ensureObj(body, "parking");
        for (const k of ["parkingAvailable", "freeParking", "selfParkingAvailable", "valetParkingAvailable"] as const) {
            if (patches.parking[k] !== undefined) {
                setBoolUnion(o, k, patches.parking[k] as boolean, paths, "parking");
            }
        }
    }

    if (patches.services) {
        const o = ensureObj(body, "services");
        for (const k of [
            "frontDesk",
            "twentyFourHourFrontDesk",
            "concierge",
            "elevator",
            "baggageStorage",
        ] as const) {
            if (patches.services[k] !== undefined) {
                setBoolUnion(o, k, patches.services[k] as boolean, paths, "services");
            }
        }
    }

    if (patches.business) {
        const o = ensureObj(body, "business");
        const b = patches.business;
        if (b.businessCenter !== undefined) {
            setBoolUnion(o, "businessCenter", b.businessCenter, paths, "business");
        }
        if (b.meetingRooms !== undefined) {
            setBoolUnion(o, "meetingRooms", b.meetingRooms, paths, "business");
        }
        if (b.meetingRoomsCount !== undefined) {
            o.meetingRoomsCount = b.meetingRoomsCount;
            delete o.meetingRoomsCountException;
            paths.push("business.meetingRoomsCount");
        }
    }

    if (patches.accessibility) {
        const o = ensureObj(body, "accessibility");
        for (const k of ["mobilityAccessible", "mobilityAccessibleParking", "mobilityAccessibleElevator"] as const) {
            if (patches.accessibility[k] !== undefined) {
                setBoolUnion(o, k, patches.accessibility[k] as boolean, paths, "accessibility");
            }
        }
    }

    if (patches.housekeeping) {
        const o = ensureObj(body, "housekeeping");
        for (const k of ["housekeepingAvailable", "dailyHousekeeping"] as const) {
            if (patches.housekeeping[k] !== undefined) {
                setBoolUnion(o, k, patches.housekeeping[k] as boolean, paths, "housekeeping");
            }
        }
    }

    if (patches.policies) {
        const o = ensureObj(body, "policies");
        if (patches.policies.smokeFreeProperty !== undefined) {
            setBoolUnion(o, "smokeFreeProperty", patches.policies.smokeFreeProperty, paths, "policies");
        }
        if (patches.policies.kidsStayFree !== undefined) {
            setBoolUnion(o, "kidsStayFree", patches.policies.kidsStayFree, paths, "policies");
        }
    }

    if (paths.length === 0) {
        throw new Error("No lodging fields to update");
    }

    const cleaned = stripLodgingOutputOnly(body);
    return { body: cleaned, updateMask: paths.join(",") };
}
