/** Messages from token/sync setup that will not succeed on Inngest retry. */
export function isPermanentGoogleAuthError(message: string): boolean {
    return (
        message.includes("No refresh token available") ||
        message.includes("Google connection expired") ||
        message.includes("Please reconnect") ||
        message.includes("Failed to decrypt refresh token")
    );
}
