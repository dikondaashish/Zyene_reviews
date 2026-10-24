"use client";

/** The picked business's Google photo for the preview; null if Google has none or the call fails. */
export async function loadPlacePhoto(photoName: string): Promise<string | null> {
    try {
        const res = await fetch(`/api/places/photo?name=${encodeURIComponent(photoName)}`);
        if (!res.ok) return null;
        const body = (await res.json()) as { url?: string | null };
        return body.url ?? null;
    } catch {
        return null;
    }
}
