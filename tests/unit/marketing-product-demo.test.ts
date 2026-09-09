import { describe, expect, it } from "vitest";
import { createReviewDemoState, reviewDemoReducer, createRequestDemoState, requestDemoReducer, getDemoReport, getRequestMessage } from "@/lib/marketing/product-demo";
import { DEMO_REVIEWS } from "@/lib/marketing/product-demo-data";

describe("local review demo", () => {
  it("preserves separate drafts when switching reviews", () => {
    let state = createReviewDemoState();
    state = reviewDemoReducer(state, { type: "edit", text: "My own reply" });
    state = reviewDemoReducer(state, { type: "select", id: DEMO_REVIEWS[1].id });
    state = reviewDemoReducer(state, { type: "select", id: DEMO_REVIEWS[0].id });
    expect(state.drafts[state.selectedId].text).toBe("My own reply");
  });
  it("generates a reply matching the selected review and tone", () => {
    let state = reviewDemoReducer(createReviewDemoState(), { type: "select", id: DEMO_REVIEWS[1].id });
    state = reviewDemoReducer(state, { type: "tone", tone: "professional" });
    expect(state.drafts[state.selectedId].text).toBe(DEMO_REVIEWS[1].replies.professional);
  });
  it("publishes only the selected local draft and rejects blank replies", () => {
    let state = reviewDemoReducer(createReviewDemoState(), { type: "edit", text: "  Thanks!  " });
    state = reviewDemoReducer(state, { type: "publish" });
    expect(state.drafts[state.selectedId].published).toBe("Thanks!");
    state = reviewDemoReducer(state, { type: "edit", text: "  " });
    state = reviewDemoReducer(state, { type: "publish" });
    expect(state.drafts[state.selectedId].published).toBe("Thanks!");
    expect(state.drafts[DEMO_REVIEWS[1].id].published).toBeNull();
  });
  it("keeps the published snapshot while editing a new draft", () => {
    const published = reviewDemoReducer(createReviewDemoState(), { type: "publish" });
    const edited = reviewDemoReducer(published, { type: "edit", text: "New draft" });
    expect(edited.drafts[edited.selectedId].published).toBe(published.drafts[published.selectedId].text);
  });
  it("ignores unknown review ids", () => {
    const state = createReviewDemoState();
    expect(reviewDemoReducer(state, { type: "select", id: "missing" })).toEqual(state);
  });
});

describe("sample reporting and requests", () => {
  it("resets the sent preview when its message or customer changes", () => {
    const sent = requestDemoReducer(createRequestDemoState(), { type: "send" });
    expect(sent.sent).toBe(true);
    const edited = requestDemoReducer(sent, { type: "edit", message: "Changed message" });
    expect(edited.sent).toBe(false);
    expect(edited.revision).toBeGreaterThan(sent.revision);
    const switched = requestDemoReducer(sent, { type: "customer", customer: "Casey" });
    expect(switched.message).toContain("Casey");
    expect(switched.sent).toBe(false);
  });
  it("prevents empty messages from being sent even outside the form", () => {
    const empty = requestDemoReducer(createRequestDemoState(), { type: "edit", message: " " });
    expect(requestDemoReducer(empty, { type: "send" }).sent).toBe(false);
  });
  it("keeps platform totals consistent with the combined report", () => {
    const all = getDemoReport(7, "all");
    const parts = ["google", "facebook", "yelp"] as const;
    expect(parts.reduce((sum, platform) => sum + getDemoReport(7, platform).total, 0)).toBe(all.total);
    expect(all.points.reduce((sum, point) => sum + point.count, 0)).toBe(all.total);
  });
  it("changes both the chart and totals for the date range", () => {
    expect(getDemoReport(14, "all").points).toHaveLength(14);
    expect(getDemoReport(7, "all").points).toHaveLength(7);
    expect(getDemoReport(14, "all").total).toBeGreaterThan(getDemoReport(7, "all").total);
  });
  it("keeps derived ratings and response rates within valid bounds", () => {
    const report = getDemoReport(14, "google");
    expect(report.rating).toBeGreaterThanOrEqual(1);
    expect(report.rating).toBeLessThanOrEqual(5);
    expect(report.responseRate).toBeLessThanOrEqual(100);
  });
  it("personalizes both request channels without excluding unhappy customers", () => {
    expect(getRequestMessage("Casey", "sms")).toContain("Casey");
    expect(getRequestMessage("Casey", "email")).not.toBe(getRequestMessage("Casey", "sms"));
    expect(getRequestMessage("Casey", "sms")).toContain("experience");
  });
});
