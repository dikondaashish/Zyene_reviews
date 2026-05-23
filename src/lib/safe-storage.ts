/** localStorage access that no-ops when blocked (sandboxed iframe, strict privacy mode). */
export function safeLocalStorageGet(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function safeLocalStorageSet(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore — embed contexts may block storage.
    }
}
