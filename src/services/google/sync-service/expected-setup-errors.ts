/**
 * Customer GBP setup gaps that will not succeed on Inngest retry until the
 * account/location is fixed in Google or the user reconnects.
 */
export function isExpectedGoogleSyncSetupError(message: string): boolean {
    return (
        message.includes("No Locations found") ||
        message.includes("No Google Accounts found") ||
        message.includes("No Google Business Profile locations found") ||
        message.includes("No Google Business Profile found")
    );
}
