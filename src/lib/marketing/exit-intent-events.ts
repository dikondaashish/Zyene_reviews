/** Exit-intent popup funnel events and attribution constants. */

export const EXIT_INTENT_SOURCE = "exit_intent_popup";

export const EXIT_INTENT_EVENT_NAMES = [
    "exit_intent_view",
    "exit_intent_dismiss",
    "exit_intent_cta_click",
] as const;

export type ExitIntentEventName = (typeof EXIT_INTENT_EVENT_NAMES)[number];

export function isExitIntentEventName(name: string): name is ExitIntentEventName {
    return (EXIT_INTENT_EVENT_NAMES as readonly string[]).includes(name);
}
