/**
 * Motion primitives — Apple's damping/response spring model.
 *
 * Apple replaced the physics triplet (mass/stiffness/damping) with two
 * designer-facing parameters:
 *
 *   - damping ratio — controls overshoot. 1.0 = critically damped (no bounce).
 *                     Below 1.0 overshoots; lower is bouncier.
 *   - response      — how quickly the value reaches its target, in seconds.
 *                     This is NOT a duration; a spring has no fixed duration,
 *                     its settle time emerges from the parameters.
 *
 * Framer Motion's `bounce` + `duration` spring API maps onto this closely:
 *   bounce ≈ 1 − dampingRatio, duration ≈ response.
 *
 * House style: critically damped everywhere by default. Reserve overshoot for
 * motion the user's own gesture put momentum into — a flick, throw or drag
 * release. Bounce on a menu that merely faded in reads as wrong.
 */

import type { Transition } from "framer-motion";

/** Convert Apple's (damping, response) pair into a Framer Motion transition. */
export function appleSpring(dampingRatio: number, response: number): Transition {
    return {
        type: "spring",
        bounce: Math.max(0, 1 - dampingRatio),
        duration: response,
    };
}

/**
 * The spring presets Apple ships, as measured in Designing Fluid Interfaces.
 * Prefer these over hand-tuned values so motion stays consistent app-wide.
 */
export const spring = {
    /** Default for anything that repositions or reveals. No overshoot. */
    default: appleSpring(1.0, 0.4),
    /** Snappier critically damped settle — menus, popovers, small chrome. */
    snappy: appleSpring(1.0, 0.3),
    /** Rotation carries a little overshoot in Apple's own components. */
    rotation: appleSpring(0.8, 0.4),
    /** Drawers and sheets — momentum-driven, so a touch of bounce is right. */
    sheet: appleSpring(0.8, 0.3),
    /** Post-flick / post-throw settle. Only after a gesture with velocity. */
    momentum: appleSpring(0.8, 0.4),
} satisfies Record<string, Transition>;

/**
 * Project where a flick is *going*, so the interface can animate to the
 * gesture's destination rather than snapping back from the release point.
 *
 * This is the exponential-decay form Apple ships — deliberately not the
 * physics-textbook v²/(2·deceleration), which produces a different feel.
 *
 * @param initialVelocity release velocity in px/s
 * @param decelerationRate 0.998 for normal scroll feel, 0.99 for snappier
 * @returns the distance in px the gesture would still travel
 */
export function projectMomentum(initialVelocity: number, decelerationRate = 0.998): number {
    return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Pick the snap target nearest to where the gesture is actually heading.
 * Snapping from the release point instead of the projected point is what makes
 * a flick feel like it was ignored.
 */
export function snapTargetFor(
    currentPosition: number,
    releaseVelocity: number,
    snapPoints: readonly number[],
    decelerationRate = 0.998
): number {
    if (snapPoints.length === 0) return currentPosition;
    const projected = currentPosition + projectMomentum(releaseVelocity, decelerationRate);
    return snapPoints.reduce((nearest, point) =>
        Math.abs(point - projected) < Math.abs(nearest - projected) ? point : nearest
    );
}

/**
 * Progressive resistance past a boundary. A hard stop reads as "frozen";
 * continuous resistance reads as "responsive, but there is nothing more here."
 *
 * @param overshoot how far past the boundary the pointer has travelled
 * @param dimension the size of the dragged surface along that axis
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
    if (dimension <= 0) return 0;
    return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/**
 * Normalised initial velocity, for spring APIs that want velocity expressed
 * relative to the remaining distance rather than in px/s.
 * Framer Motion takes absolute px/s via `velocity`, so this is only needed
 * when handing off to an API that asks for the relative form.
 */
export function relativeVelocity(gestureVelocity: number, current: number, target: number): number {
    const remaining = target - current;
    if (remaining === 0) return 0;
    return gestureVelocity / remaining;
}

/**
 * Reduced motion does not mean no feedback — it means a gentler, non-vestibular
 * equivalent. Travel and overshoot go; a short cross-fade stays.
 */
export const REDUCED_MOTION_TRANSITION: Transition = { duration: 0.12, ease: "linear" };

/** Pick the right transition for the user's motion preference. */
export function motionSafe(transition: Transition, prefersReducedMotion: boolean | null): Transition {
    return prefersReducedMotion ? REDUCED_MOTION_TRANSITION : transition;
}
