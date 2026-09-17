export type DemoTone = "friendly" | "professional" | "concise";
export type DemoPlatform = "google" | "facebook" | "yelp";
export type DemoChannel = "sms" | "email";
export type DemoAutoRating = 3 | 4 | 5;
export interface DemoAutoSettings { enabled: boolean; minRating: DemoAutoRating; tone: DemoTone; rating: DemoAutoRating }
export interface DemoAutoResult { status: "typing" | "published" | "skipped"; rating: DemoAutoRating; review: string; reply: string }
export interface DemoReview {
  id: string;
  name: string;
  initials: string;
  platform: DemoPlatform;
  rating: number;
  time: string;
  content: string;
  replies: Record<DemoTone, string>;
}
export interface DemoDraft { tone: DemoTone; text: string; published: string | null }
export interface ReviewDemoState { selectedId: string; drafts: Record<string, DemoDraft> }
export type ReviewDemoAction =
  | { type: "select"; id: string }
  | { type: "edit"; text: string }
  | { type: "tone"; tone: DemoTone }
  | { type: "publish" };

export interface RequestDemoState { customer: string; channel: DemoChannel; message: string; sent: boolean; revision: number }
export type RequestDemoAction =
  | { type: "customer"; customer: string }
  | { type: "channel"; channel: DemoChannel }
  | { type: "edit"; message: string }
  | { type: "send" };
