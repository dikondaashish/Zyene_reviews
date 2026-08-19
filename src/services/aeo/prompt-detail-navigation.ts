type PromptDetailAvailability = { kind: "ok" | "not-found" };

/**
 * A saved prompt URL can become stale after the active business changes.
 * Redirect without revealing whether the prompt exists in another tenant.
 */
export function promptDetailRedirect(data: PromptDetailAvailability): string | null {
    return data.kind === "not-found" ? "/google-seo-aeo/prompts" : null;
}
