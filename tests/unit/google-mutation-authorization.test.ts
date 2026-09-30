import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ user: vi.fn(), client: vi.fn(), manage: vi.fn(), token: vi.fn(), mutate: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/app/api/_shared/auth", () => ({ requireUser: m.user }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: m.manage }));
vi.mock("@/services/google/sync-service", () => ({ getValidGoogleToken: m.token }));
vi.mock("@/services/google/phase2-sync", () => ({ syncGbpPlaceActionsForPlatform: vi.fn(), syncGbpQuestionsForPlatform: vi.fn() }));
vi.mock("@/services/google/phase3-sync", () => ({ syncGoogleListingProfileForPlatform: vi.fn() }));
vi.mock("@/services/google/phase4-sync", () => ({ syncGoogleLodgingForPlatform: vi.fn() }));
vi.mock("@/services/google/local-posts", () => ({ createLocalPost: m.mutate }));
vi.mock("@/services/google/qanda", () => ({ upsertQuestionAnswer: m.mutate }));
vi.mock("@/services/google/listing-information", () => ({ getGoogleLocation: vi.fn(), patchGoogleLocation: m.mutate }));
vi.mock("@/services/google/place-actions", () => ({ createPlaceActionLink: m.mutate, deletePlaceActionLink: m.mutate, listAllPlaceActionTypeMetadata: vi.fn() }));
vi.mock("@/services/google/lodging", () => ({ getLodging: vi.fn(), patchLodging: m.mutate, stripLodgingOutputOnly: vi.fn() }));

import { POST as post } from "@/app/api/google/local-posts/route";
import { POST as answer } from "@/app/api/google/qa/answer/route";
import { handleGoogleListingPatch } from "@/services/google/listing-patch-api";
import { handleGoogleLodgingPatch } from "@/services/google/lodging-api";
import { handlePlaceActionsPost, handlePlaceActionsDelete } from "@/services/google/place-actions-api";

const B = "11111111-1111-4111-8111-111111111111";
const request = (data: unknown) => new Request("http://localhost", { method: "POST", body: JSON.stringify(data) });
beforeEach(() => {
    vi.resetAllMocks(); m.manage.mockResolvedValue(false);
    const query = { select: () => query, eq: () => query, single: async () => ({ data: {
        business_id: B, review_platform_id: "platform", google_question_name: "locations/foreign/questions/q", platform: "google", google_location_id: "123",
    }, error: null }) };
    const supabase = { from: () => query, auth: { getUser: async () => ({ data: { user: { id: "u" } } }) } };
    m.client.mockResolvedValue(supabase); m.user.mockResolvedValue({ user: { id: "u" }, supabase });
});
describe("Google mutation authorization", () => {
    it.each([
        ["post", post, { businessId: B, summary: "Hello" }],
        ["listing", handleGoogleListingPatch, { businessId: B, title: "Hello" }],
        ["lodging", handleGoogleLodgingPatch, { businessId: B, patches: {} }],
        ["place-create", handlePlaceActionsPost, { businessId: B, placeActionType: "APPOINTMENT", uri: "https://example.test" }],
        ["place-delete", handlePlaceActionsDelete, { linkId: B }],
        ["answer", answer, { questionId: B, text: "Hello" }],
    ] as const)("%s denies a viewer or foreign tenant before credential access", async (_name, handler, payload) => {
        const result = await handler(request(payload)); expect(result.status).toBe(403);
        expect(m.token).not.toHaveBeenCalled(); expect(m.mutate).not.toHaveBeenCalled();
    });
    it("denies a foreign Google resource even for a business manager", async () => {
        m.manage.mockResolvedValue(true);
        const result = await answer(request({ questionId: B, text: "Hello" }));
        expect(result.status).toBe(400); expect(m.token).not.toHaveBeenCalled();
    });
});
