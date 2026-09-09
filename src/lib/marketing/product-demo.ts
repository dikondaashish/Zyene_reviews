import { DEMO_REPORT_DAYS, DEMO_REVIEWS } from "@/lib/marketing/product-demo-data";
import type { DemoChannel, DemoPlatform, RequestDemoAction, RequestDemoState, ReviewDemoAction, ReviewDemoState } from "@/types/marketing-product-demo";

export function createReviewDemoState(): ReviewDemoState {
  return {
    selectedId: DEMO_REVIEWS[0].id,
    drafts: Object.fromEntries(DEMO_REVIEWS.map(review => [review.id, { tone: "friendly", text: review.replies.friendly, published: null }])),
  };
}

export function reviewDemoReducer(state: ReviewDemoState, action: ReviewDemoAction): ReviewDemoState {
  if (action.type === "select") return state.drafts[action.id] ? { ...state, selectedId: action.id } : state;
  const draft = state.drafts[state.selectedId];
  const review = DEMO_REVIEWS.find(item => item.id === state.selectedId)!;
  if (action.type === "publish" && !draft.text.trim()) return state;
  const updated = action.type === "tone" ? { ...draft, tone: action.tone, text: review.replies[action.tone] }
    : action.type === "edit" ? { ...draft, text: action.text }
    : { ...draft, published: draft.text.trim() };
  return { ...state, drafts: { ...state.drafts, [state.selectedId]: updated } };
}

export function getRequestMessage(name: string, channel: DemoChannel) {
  return channel === "sms"
    ? `Hi ${name}! Thanks for stopping by Juniper Coffee. How was your experience? We’d love your honest feedback.`
    : `Hi ${name},\n\nThank you for visiting Juniper Coffee. We’d love to hear about your experience. Your honest feedback helps our team keep improving.\n\nThanks,\nThe Juniper Coffee team`;
}

export function createRequestDemoState(): RequestDemoState {
  return { customer: "Jordan", channel: "sms", message: getRequestMessage("Jordan", "sms"), sent: false, revision: 0 };
}

export function requestDemoReducer(state: RequestDemoState, action: RequestDemoAction): RequestDemoState {
  if (action.type === "send") return state.message.trim() ? { ...state, sent: true } : state;
  const customer = action.type === "customer" ? action.customer : state.customer;
  const channel = action.type === "channel" ? action.channel : state.channel;
  return { customer, channel, message: action.type === "edit" ? action.message : getRequestMessage(customer, channel), sent: false, revision: state.revision + 1 };
}

export function getDemoReport(days: 7 | 14, platform: DemoPlatform | "all") {
  const points = DEMO_REPORT_DAYS.slice(-days).map(day => {
    const values = platform === "all" ? Object.values(day.platforms) : [day.platforms[platform]];
    return { label: day.label, ...values.reduce((sum, value) => ({
      count: sum.count + value.count, ratingTotal: sum.ratingTotal + value.ratingTotal, responded: sum.responded + value.responded,
    }), { count: 0, ratingTotal: 0, responded: 0 }) };
  });
  const total = points.reduce((sum, point) => sum + point.count, 0);
  return {
    points, total,
    rating: total ? points.reduce((sum, point) => sum + point.ratingTotal, 0) / total : 0,
    responseRate: total ? Math.round(points.reduce((sum, point) => sum + point.responded, 0) / total * 100) : 0,
  };
}
