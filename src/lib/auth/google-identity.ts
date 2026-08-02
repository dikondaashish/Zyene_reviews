export async function createGoogleIdentityNonce(): Promise<{
    nonce: string;
    hashedNonce: string;
}> {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const nonce = Array.from(randomBytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(nonce)
    );
    const hashedNonce = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

    return { nonce, hashedNonce };
}

export function buildGoogleAuthCompletionPath(inviteToken: string | null, nextPath = "/dashboard"): string {
    const invite = inviteToken?.trim();
    const params = new URLSearchParams({ next: nextPath });
    if (invite) params.set("invite", invite);
    return `/api/auth/google/complete?${params.toString()}`;
}
