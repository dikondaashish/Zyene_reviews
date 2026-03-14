import { track } from "@vercel/analytics";

/**
 * Track onboarding events for analytics
 * Used to monitor progression and drop-off rates
 */

export function trackOnboardingStepStarted(step: number) {
  track(`onboarding_step_${step}_started`, {
    step,
    timestamp: new Date().toISOString(),
  });
}

export function trackOnboardingStepCompleted(
  step: number,
  duration?: number
) {
  track(`onboarding_step_${step}_completed`, {
    step,
    duration, // milliseconds spent on this step
    timestamp: new Date().toISOString(),
  });
}

export function trackOnboardingStepError(
  step: number,
  error: string,
  fieldName?: string
) {
  track(`onboarding_step_${step}_error`, {
    step,
    error,
    fieldName, // which field caused the error
    timestamp: new Date().toISOString(),
  });
}

export function trackOnboardingAbandoned(
  step: number,
  reason?: string
) {
  track("onboarding_abandoned", {
    step,
    reason, // e.g., "user_closed_tab", "validation_error", "timeout"
    timestamp: new Date().toISOString(),
  });
}

export function trackOnboardingCompleted(
  totalDuration?: number,
  organizationName?: string,
  businessName?: string
) {
  track("onboarding_completed", {
    totalDuration, // milliseconds for entire flow
    organizationName,
    businessName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Helper to track step timing
 * Usage:
 *   const timer = startStepTimer();
 *   // ... user completes step
 *   trackOnboardingStepCompleted(1, timer());
 */
export function startStepTimer() {
  const startTime = Date.now();
  return () => Date.now() - startTime;
}
