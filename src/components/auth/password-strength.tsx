"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
    password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const [strength, setStrength] = useState(0);
    const [requirements, setRequirements] = useState([
        { label: "At least 8 characters", met: false, regex: /.{8,}/ },
        { label: "Contains a number or symbol", met: false, regex: /[0-9!@#$%^&*]/ },
        { label: "Contains both lower and uppercase", met: false, regex: /(?=.*[a-z])(?=.*[A-Z])/ },
    ]);

    useEffect(() => {
        const newRequirements = requirements.map((req) => ({
            ...req,
            met: req.regex.test(password),
        }));
        setRequirements(newRequirements);

        const metCount = newRequirements.filter((req) => req.met).length;
        setStrength(metCount);
    }, [password]);

    if (!password) return null;

    const getStrengthColor = () => {
        if (strength === 0) return "bg-muted";
        if (strength === 1) return "bg-destructive/100";
        if (strength === 2) return "bg-chart-4";
        return "bg-chart-2/100";
    };

    const getStrengthLabel = () => {
        if (strength === 0) return "Very Weak";
        if (strength === 1) return "Weak";
        if (strength === 2) return "Good";
        return "Strong";
    };

    return (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Bars */}
            <div className="flex gap-1.5 h-1.5 w-full">
                {[1, 2, 3].map((level) => (
                    <div
                        key={level}
                        className={`h-full flex-1 rounded-full transition-all duration-500 ${
                            level <= strength ? getStrengthColor() : "bg-muted/60"
                        }`}
                    />
                ))}
            </div>

            {/* Label */}
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                <span className="text-muted-foreground">Security Score:</span>
                <span className={strength === 3 ? "text-chart-2" : "text-muted-foreground"}>
                    {getStrengthLabel()}
                </span>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 gap-1.5">
                {requirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2">
                        <div className={`flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${ req.met ? "bg-chart-2/15" : "bg-muted" } size-3.5`}>
                            {req.met ? (
                                <Check className="text-chart-2 size-2" strokeWidth={4} />
                            ) : (
                                <X className="text-muted-foreground size-2" strokeWidth={3} />
                            )}
                        </div>
                        <span className={`text-xs ${req.met ? "text-foreground/80" : "text-muted-foreground"}`}>
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
