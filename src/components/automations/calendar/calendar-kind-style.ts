import type { CalendarEventKind } from "@/lib/automations/activity-calendar";

/** One colour per kind, shared by the legend dots, day chips and the day list. */
export const KIND_DOT: Record<CalendarEventKind, string> = {
    request: "bg-primary",
    reminder: "bg-chart-4",
    scheduled: "bg-muted-foreground",
    "auto-reply": "bg-success",
    reply: "bg-chart-2",
    review: "bg-chart-3",
};

export const KIND_PLURAL: Record<CalendarEventKind, [string, string]> = {
    request: ["request", "requests"],
    reminder: ["reminder", "reminders"],
    scheduled: ["scheduled", "scheduled"],
    "auto-reply": ["auto reply", "auto replies"],
    reply: ["reply", "replies"],
    review: ["new review", "new reviews"],
};
