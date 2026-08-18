import { afterEach, describe, expect, it, vi } from "vitest";

import { MicrosoftCopilotAdapter } from "../../src/services/aeo/engines/adapters/microsoft-copilot-adapter";
import { buildWebhookDelivery } from "../../src/services/aeo/integrations/outbound-webhook";
import { buildBigQueryRows } from "../../src/services/aeo/integrations/bigquery-export";
import { applyReportBranding } from "../../src/services/aeo/reporting/report-branding";

afterEach(() => vi.unstubAllGlobals());

describe("Phase 3 integrations", () => {
    it("samples the actual Microsoft Copilot API and preserves citation provenance", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(new Response(JSON.stringify({ id: "conversation-1" }), { status: 201 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({ messages: [
                { text: "best bbq kansas city", attributions: [] },
                { text: "Wolfpack is one option.", attributions: [{ attributionType: "citation", providerDisplayName: "Wolfpack", seeMoreWebUrl: "https://wolfpackkc.com/" }] },
            ] }), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
        const adapter = new MicrosoftCopilotAdapter({ accessToken: "delegated-token" });
        const result = await adapter.sample({ prompt: "best bbq kansas city", locale: { country: "US", language: "en", city: "Kansas City" }, attempt: 1 });
        expect(result).toMatchObject({ status: "ok", modelId: "microsoft-365-copilot-chat-beta", answerText: "Wolfpack is one option." });
        expect(result.status === "ok" && result.citations.availability === "present" ? result.citations.items[0]?.url : null).toBe("https://wolfpackkc.com/");
    });

    it("signs stable webhook bytes and carries an idempotency key", () => {
        const first = buildWebhookDelivery("secret", "aeo.run.completed", "run-1", { status: "success" }, "2026-08-18T20:00:00.000Z");
        const second = buildWebhookDelivery("secret", "aeo.run.completed", "run-1", { status: "success" }, "2026-08-18T20:00:00.000Z");
        expect(second).toEqual(first);
        expect(first.headers["X-Zyene-Signature"]).toMatch(/^sha256=/);
        expect(first.headers["Idempotency-Key"]).toBe("aeo.run.completed:run-1");
    });

    it("builds stable BigQuery rows without exporting raw answer text", () => {
        const rows = buildBigQueryRows([{ sampleId: "s1", businessId: "b1", promptId: "p1", engineId: "chatgpt", status: "ok", sampledAt: "2026-08-18T20:00:00Z", costMicroUsd: 25000, brandNamed: true }]);
        expect(rows[0]).toEqual({ insertId: "sample:s1", json: expect.objectContaining({ sample_id: "s1", brand_named: true }) });
        expect(JSON.stringify(rows)).not.toContain("answerText");
    });

    it("applies organization branding and can remove Zyene attribution", () => {
        const branded = applyReportBranding("<header>BRAND</header><footer>POWERED_BY</footer><style>:root{--brand:BRAND_COLOR}</style>", { name: "Agency One", primaryColor: "#123456", logoUrl: "https://agency.test/logo.png", hidePoweredBy: true });
        expect(branded).toContain("Agency One");
        expect(branded).toContain("#123456");
        expect(branded).not.toContain("POWERED_BY");
    });
});
