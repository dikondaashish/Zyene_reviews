import { describe, expect, it } from "vitest";

import {
    appleSpring,
    motionSafe,
    projectMomentum,
    relativeVelocity,
    rubberband,
    snapTargetFor,
    spring,
} from "@/lib/motion/springs";

describe("appleSpring", () => {
    it("maps a critically damped ratio to zero bounce", () => {
        expect(appleSpring(1.0, 0.4)).toEqual({ type: "spring", bounce: 0, duration: 0.4 });
    });

    it("maps an under-damped ratio to proportional bounce", () => {
        const transition = appleSpring(0.8, 0.3);
        expect(transition.type).toBe("spring");
        expect(transition.bounce).toBeCloseTo(0.2, 10);
        expect(transition.duration).toBe(0.3);
    });

    it("never produces negative bounce for over-damped input", () => {
        expect(appleSpring(1.4, 0.4).bounce).toBe(0);
    });
});

describe("spring presets", () => {
    it("defaults to no overshoot", () => {
        expect(spring.default.bounce).toBe(0);
        expect(spring.snappy.bounce).toBe(0);
    });

    it("reserves overshoot for momentum-driven surfaces", () => {
        expect(spring.sheet.bounce).toBeGreaterThan(0);
        expect(spring.momentum.bounce).toBeGreaterThan(0);
        expect(spring.rotation.bounce).toBeGreaterThan(0);
    });
});

describe("projectMomentum", () => {
    it("returns no travel when the gesture was released at rest", () => {
        expect(projectMomentum(0)).toBe(0);
    });

    it("projects further for faster flicks", () => {
        expect(projectMomentum(1000)).toBeGreaterThan(projectMomentum(500));
    });

    it("carries the sign of the velocity", () => {
        expect(projectMomentum(-800)).toBeLessThan(0);
    });

    it("uses exponential decay, not the v^2 textbook form", () => {
        // v/1000 * 0.998 / (1 - 0.998) === v * 0.499
        expect(projectMomentum(1000)).toBeCloseTo(499, 6);
    });

    it("projects less distance at a snappier deceleration rate", () => {
        expect(projectMomentum(1000, 0.99)).toBeLessThan(projectMomentum(1000, 0.998));
    });
});

describe("snapTargetFor", () => {
    const points = [0, 100, 200];

    it("returns the current position when there is nothing to snap to", () => {
        expect(snapTargetFor(42, 0, [])).toBe(42);
    });

    it("snaps to the nearest point when released at rest", () => {
        expect(snapTargetFor(90, 0, points)).toBe(100);
    });

    it("throws past the nearest point when the flick carries velocity", () => {
        // At rest this would snap back to 0; a fast flick should carry it onward.
        expect(snapTargetFor(10, 400, points)).toBe(200);
    });

    it("respects a flick in the negative direction", () => {
        expect(snapTargetFor(190, -400, points)).toBe(0);
    });
});

describe("rubberband", () => {
    it("resists progressively rather than moving one-to-one", () => {
        expect(rubberband(100, 400)).toBeLessThan(100);
    });

    it("returns nothing at the boundary itself", () => {
        expect(rubberband(0, 400)).toBe(0);
    });

    it("resists harder the further past the boundary the drag goes", () => {
        const near = rubberband(50, 400) / 50;
        const far = rubberband(300, 400) / 300;
        expect(far).toBeLessThan(near);
    });

    it("is symmetric across the boundary", () => {
        expect(rubberband(-100, 400)).toBeCloseTo(-rubberband(100, 400), 10);
    });

    it("guards against a zero dimension", () => {
        expect(rubberband(100, 0)).toBe(0);
    });
});

describe("relativeVelocity", () => {
    it("normalises velocity by the distance still to travel", () => {
        // 50px/s with 100px to go => 0.5
        expect(relativeVelocity(50, 50, 150)).toBe(0.5);
    });

    it("avoids dividing by zero when already at the target", () => {
        expect(relativeVelocity(50, 100, 100)).toBe(0);
    });
});

describe("motionSafe", () => {
    it("keeps a short cross-fade rather than removing feedback entirely", () => {
        const reduced = motionSafe(spring.sheet, true);
        expect(reduced).toEqual({ duration: 0.12, ease: "linear" });
    });

    it("passes the spring through when motion is not restricted", () => {
        expect(motionSafe(spring.sheet, false)).toBe(spring.sheet);
        expect(motionSafe(spring.sheet, null)).toBe(spring.sheet);
    });
});
