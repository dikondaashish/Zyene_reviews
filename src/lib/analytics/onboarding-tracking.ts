/**
 * Onboarding Analytics Tracking
 * 
 * This module handles tracking of onboarding steps and user progress.
 */

import type { OnboardingCompletionData } from "@/types/analytics";

// Timer to track how long each step takes
let stepStartTime: number | null = null;

/**
 * Starts a timer for the current onboarding step
 */
export function startStepTimer() {
  stepStartTime = Date.now();
}

/**
 * Tracks when a specific onboarding step is started
 * @param step Number of the step (1-4)
 */
export function trackOnboardingStepStarted(_step: number) {
  startStepTimer();
  
  // You can integrate with Segment, PostHog, or other tools here
  // example: window.analytics?.track('Onboarding Step Started', { step });
}

/**
 * Tracks when a specific onboarding step is successfully completed
 * @param step Number of the step (1-4)
 */
export function trackOnboardingStepCompleted(_step: number) {
  // example: window.analytics?.track('Onboarding Step Completed', { step, duration });
  stepStartTime = null;
}

/**
 * Tracks errors that occur during an onboarding step
 * @param step Number of the step (1-4)
 * @param error Error message or object
 * @param field Optional field name where error occurred
 */
export function trackOnboardingStepError(step: number, error: string, field?: string) {
  console.error(`[Analytics] Onboarding Step ${step} Error:`, { error, field });
}

/**
 * Tracks when the entire onboarding flow is completed
 */
export function trackOnboardingCompleted(_data?: OnboardingCompletionData, _source?: string, _id?: string) {
  // example: window.analytics?.track('Onboarding Completed', { data, source, id });
}
