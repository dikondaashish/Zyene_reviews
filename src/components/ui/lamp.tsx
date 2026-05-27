"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const prefersReducedMotion = useReducedMotion();

    const transition = prefersReducedMotion
        ? { duration: 0 }
        : { delay: 0.3, duration: 0.8, ease: "easeInOut" as const };

    const initialWide = prefersReducedMotion
        ? { opacity: 1, width: "30rem" }
        : { opacity: 0.5, width: "15rem" };

    const animateWide = { opacity: 1, width: "30rem" };

    return (
        <div
            className={cn(
                "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-950",
                className
            )}
        >
            {/* Lamp light cone layer */}
            <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate">
                {/* Left cone */}
                <motion.div
                    initial={initialWide}
                    whileInView={animateWide}
                    viewport={{ once: true }}
                    transition={transition}
                    style={{
                        backgroundImage:
                            "conic-gradient(from 70deg at center top, #06b6d4, transparent 50%)",
                    }}
                    className="absolute inset-auto right-1/2 h-56 w-[30rem] overflow-visible"
                >
                    <div className="absolute bottom-0 left-0 z-20 h-40 w-full [mask-image:linear-gradient(to_top,white,transparent)] bg-slate-950" />
                    <div className="absolute bottom-0 left-0 z-20 h-full w-40 [mask-image:linear-gradient(to_right,white,transparent)] bg-slate-950" />
                </motion.div>

                {/* Right cone */}
                <motion.div
                    initial={initialWide}
                    whileInView={animateWide}
                    viewport={{ once: true }}
                    transition={transition}
                    style={{
                        backgroundImage:
                            "conic-gradient(from 290deg at center top, transparent 50%, #06b6d4)",
                    }}
                    className="absolute inset-auto left-1/2 h-56 w-[30rem]"
                >
                    <div className="absolute bottom-0 right-0 z-20 h-full w-40 [mask-image:linear-gradient(to_left,white,transparent)] bg-slate-950" />
                    <div className="absolute bottom-0 right-0 z-20 h-40 w-full [mask-image:linear-gradient(to_top,white,transparent)] bg-slate-950" />
                </motion.div>

                {/* Background blur fills */}
                <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 blur-2xl bg-slate-950" />
                <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />

                {/* Central glow */}
                <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500 opacity-50 blur-3xl" />

                {/* Narrow inner glow */}
                <motion.div
                    initial={prefersReducedMotion ? { width: "16rem" } : { width: "8rem" }}
                    whileInView={{ width: "16rem" }}
                    viewport={{ once: true }}
                    transition={transition}
                    className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-cyan-400 blur-2xl"
                />

                {/* Horizontal beam line */}
                <motion.div
                    initial={prefersReducedMotion ? { width: "30rem" } : { width: "15rem" }}
                    whileInView={{ width: "30rem" }}
                    viewport={{ once: true }}
                    transition={transition}
                    className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-cyan-400"
                />

                {/* Bottom mask */}
                <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-slate-950" />
            </div>

            {/* Content slot */}
            <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5 text-center">
                {children}
            </div>
        </div>
    );
};
