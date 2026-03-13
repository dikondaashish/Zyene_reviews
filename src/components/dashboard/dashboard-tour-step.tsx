"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";

interface DashboardTourStepProps {
    targetRef: React.RefObject<HTMLElement>;
    step: number;
    title: string;
    description: string;
    onNext: () => void;
    onSkip: () => void;
    isLast: boolean;
}

interface Position {
    top: number;
    left: number;
    placement: "top" | "bottom" | "left" | "right";
}

export const DashboardTourStep = (props: DashboardTourStepProps) => {
    const {
        targetRef,
        step,
        title,
        description,
        onNext,
        onSkip,
        isLast,
    } = props;

    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<Position>({
        top: 0,
        left: 0,
        placement: "bottom",
    });

    // Calculate position based on target element
    useEffect(() => {
        if (!targetRef.current || !tooltipRef.current) return;

        const targetRect = targetRef.current.getBoundingClientRect();
        const tooltipHeight = 250; // Approximate height
        const tooltipWidth = 320; // w-80 = 320px
        const offset = 16;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let placement: "top" | "bottom" | "left" | "right" = "bottom";
        let top = 0;
        let left = 0;

        // Determine best placement
        if (targetRect.bottom + tooltipHeight + offset > viewportHeight) {
            // Not enough space below, try above
            if (targetRect.top - tooltipHeight - offset > 0) {
                placement = "top";
                top = targetRect.top - tooltipHeight - offset;
            } else {
                placement = "bottom";
                top = targetRect.bottom + offset;
            }
        } else {
            placement = "bottom";
            top = targetRect.bottom + offset;
        }

        // Center horizontally relative to target
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

        // Keep within viewport horizontally
        if (left < 8) {
            left = 8;
        } else if (left + tooltipWidth + 8 > viewportWidth) {
            left = viewportWidth - tooltipWidth - 8;
        }

        setPosition({ top, left, placement });
    }, [targetRef]);

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onSkip();
            } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onNext, onSkip]);

    // Add highlight overlay to target element
    useEffect(() => {
        if (!targetRef.current) return;

        const target = targetRef.current;
        target.classList.add("tour-target-highlight");
        target.style.position = "relative";
        target.style.zIndex = "40";

        // Create overlay effect
        const overlay = document.createElement("div");
        overlay.className = "fixed inset-0 bg-black/40 pointer-events-none tour-overlay";
        overlay.style.zIndex = "39";
        document.body.appendChild(overlay);

        // Highlight the target element with rounded border
        const rect = target.getBoundingClientRect();
        const highlighter = document.createElement("div");
        highlighter.className = "fixed border-2 border-blue-500 pointer-events-none tour-highlighter";
        highlighter.style.top = `${window.scrollY + rect.top - 8}px`;
        highlighter.style.left = `${window.scrollX + rect.left - 8}px`;
        highlighter.style.width = `${rect.width + 16}px`;
        highlighter.style.height = `${rect.height + 16}px`;
        highlighter.style.zIndex = "38";
        highlighter.style.borderRadius = "8px";
        highlighter.style.boxShadow = "0 0 0 9999px rgba(0, 0, 0, 0.4)";
        document.body.appendChild(highlighter);

        return () => {
            overlay.remove();
            highlighter.remove();
            target.classList.remove("tour-target-highlight");
            target.style.position = "";
            target.style.zIndex = "";
        };
    }, [targetRef]);

    return (
        <motion.div
            ref={tooltipRef}
            style={{
                position: "fixed",
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-80 bg-white rounded-lg shadow-2xl border border-gray-100 p-6 space-y-4 z-50"
        >
            {/* Close button */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={onSkip}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Skip tour"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 pr-6">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
                {description}
            </p>

            {/* Step indicator */}
            <div className="text-xs font-medium text-gray-500">
                Step {step} of 4
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
                {isLast ? (
                    <Button
                        onClick={onNext}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Got it! 🎉
                    </Button>
                ) : (
                    <Button
                        onClick={onNext}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                )}
            </div>

            {/* Skip link */}
            {!isLast && (
                <button
                    onClick={onSkip}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors w-full text-center"
                >
                    Skip tour
                </button>
            )}
        </motion.div>
    );
};
