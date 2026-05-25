"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import { marketingImages } from "@/lib/marketing/marketing-images";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

const TESTIMONIALS = [
    {
        quote: "We jumped from 4.1 to 4.8 stars and our incoming calls doubled. The AI replies save me 3 hours a week.",
        name: "Michael T.",
        role: "Owner, Riverfront Dining",
        photo: marketingImages.home.testimonials.one.src,
    },
    {
        quote: "I was paying $300/mo for Birdeye. Zyene does the same thing with a better interface and smarter AI. Easy switch.",
        name: "Sarah Jenkins",
        role: "Director, Apex Dental Care",
        photo: marketingImages.home.testimonials.two.src,
    },
    {
        quote: "A concerned customer left private feedback, we resolved it fast, and they updated their review to 5 stars.",
        name: "David Chen",
        role: "Manager, Chen Auto Repair",
        photo: marketingImages.home.testimonials.three.src,
    },
];

export function MarketingHomeHowAndTestimonials({
    fadeInUp,
    staggerContainer,
    prefersReducedMotion: _prefersReducedMotion,
}: MarketingHomeMotionProps) {
    void _prefersReducedMotion;
    return (
        <section className="w-full py-24 md:py-32 px-4">
            <div className="mx-auto max-w-[1200px]">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                        Loved by local business owners
                    </h2>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {TESTIMONIALS.map(({ quote, name, role, photo }) => (
                        <motion.div
                            key={name}
                            variants={fadeInUp}
                            className="bg-muted/50 rounded-2xl p-6 border border-border"
                        >
                            <span className="text-4xl font-serif text-muted-foreground/30 leading-none block mb-3">
                                &ldquo;
                            </span>
                            <p className="text-base leading-relaxed text-foreground mb-6">
                                {quote}
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="relative rounded-full overflow-hidden size-8 shrink-0">
                                    <Image
                                        src={photo}
                                        alt={`${name} profile photo`}
                                        width={32}
                                        height={32}
                                        className="object-cover size-full"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{name}</p>
                                    <p className="text-xs text-muted-foreground">{role}</p>
                                </div>
                                <div className="ml-auto flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="size-3.5 fill-primary text-primary" />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
