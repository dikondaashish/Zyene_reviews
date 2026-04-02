"use client";

import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Eye, MousePointer2, Phone, MapPin } from "lucide-react";

interface EngagementFunnelCardProps {
    profileViews: number;
    websiteClicks: number;
    callClicks: number;
    directionRequests: number;
}

export function EngagementFunnelCard({
    profileViews,
    websiteClicks,
    callClicks,
    directionRequests
}: EngagementFunnelCardProps) {
    const funnelSteps = [
        { label: "Profile views", value: profileViews, icon: Eye, color: "bg-orange-500" },
        { label: "Website clicks", value: websiteClicks, icon: MousePointer2, color: "bg-orange-500" },
        { label: "Direction requests", value: directionRequests, icon: MapPin, color: "bg-amber-500" },
        { label: "Call clicks", value: callClicks, icon: Phone, color: "bg-emerald-500" },
    ];

    const maxVal = Math.max(...funnelSteps.map(s => s.value), 1);

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {funnelSteps.map((step, idx) => (
                <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                >
                    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-card/50 backdrop-blur-sm transition-all hover:shadow-md hover:bg-card">
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg ${step.color} bg-opacity-10`}>
                                <step.icon className={`h-4 w-4 ${step.color.replace('bg-', 'text-')}`} />
                            </div>
                            <span className="text-xl font-black tracking-tight">{step.value.toLocaleString()}</span>
                        </div>
                        
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                <span>{step.label}</span>
                                <span>{maxVal > 0 ? Math.round((step.value / maxVal) * 100) : 0}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(step.value / maxVal) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                                    className={`h-full ${step.color} rounded-full`}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
