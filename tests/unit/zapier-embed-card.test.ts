import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light" }) }));

const signUp = { email: "sam@example.com", firstName: "Sam", lastName: "Patel" };

async function renderCard(clientId: string, prefill = signUp) {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_ZAPIER_CLIENT_ID", clientId);
    const { ZapierEmbedCard } = await import("@/components/integrations/zapier-embed-card");
    return renderToStaticMarkup(createElement(ZapierEmbedCard, { signUp: prefill }));
}

afterEach(() => vi.unstubAllEnvs());

describe("ZapierEmbedCard", () => {
    it("points to the webhook guide while no Zapier client ID is set", async () => {
        const html = await renderCard("");
        expect(html).not.toContain("<zapier-workflow");
        expect(html).toContain('href="/settings/integrations/zapier"');
    });

    it("embeds the Zapier Workflow Element with our client ID and sign-up prefill", async () => {
        const html = await renderCard("abc123");
        expect(html).toContain('<zapier-workflow client-id="abc123"');
        expect(html).toContain('sign-up-email="sam@example.com"');
        expect(html).toContain('template-limit="5"');
    });

    it("skips Quick Account Creation when the name is incomplete", async () => {
        const html = await renderCard("abc123", { ...signUp, lastName: null } as never);
        expect(html).not.toContain("sign-up-email");
    });
});
