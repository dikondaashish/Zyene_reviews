export function unwrapGoogleListingApiData<T>(payload: unknown): T {
    const root = payload as { data?: T } & T;
    return (root?.data ?? root) as T;
}
