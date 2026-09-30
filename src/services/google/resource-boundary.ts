import { normalizeGoogleLocationId } from "@/services/google/location-id";

export function googleResourceBelongsToLocation(
    resource: unknown, location: string | null, kind: "questions" | "placeActionLinks",
): boolean {
    const id = normalizeGoogleLocationId(location);
    if (!id || !/^[A-Za-z0-9_-]+$/.test(id) || typeof resource !== "string") return false;
    const prefix = `locations/${id}/${kind}/`;
    return resource.startsWith(prefix) && /^[A-Za-z0-9_-]+$/.test(resource.slice(prefix.length));
}
