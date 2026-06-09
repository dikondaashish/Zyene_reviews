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
export function trackOnboardingStepStarted(step: number) {
  console.log(`[Analytics] Onboarding Step ${step} Started`);
  startStepTimer();
  
  // You can integrate with Segment, PostHog, or other tools here
  // example: window.analytics?.track('Onboarding Step Started', { step });
}

/**
 * Tracks when a specific onboarding step is successfully completed
 * @param step Number of the step (1-4)
 */
export function trackOnboardingStepCompleted(step: number) {
  const duration = stepStartTime ? (Date.now() - stepStartTime) / 1000 : 0;
  console.log(`[Analytics] Onboarding Step ${step} Completed in ${duration}s`);
  
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
export function trackOnboardingCompleted(data?: OnboardingCompletionData, source?: string, id?: string) {
  console.log(`[Analytics] Onboarding Flow Fully Completed`, { data, source, id });
  
  // example: window.analytics?.track('Onboarding Completed', { data, source, id });
}
