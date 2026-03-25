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
        if (strength === 0) return "bg-gray-200";
        if (strength === 1) return "bg-red-500";
        if (strength === 2) return "bg-yellow-500";
        return "bg-green-500";
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
                            level <= strength ? getStrengthColor() : "bg-gray-100"
                        }`}
                    />
                ))}
            </div>

            {/* Label */}
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                <span className="text-gray-400">Security Score:</span>
                <span className={strength === 3 ? "text-green-600" : "text-gray-600"}>
                    {getStrengthLabel()}
                </span>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 gap-1.5">
                {requirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2">
                        <div className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                            req.met ? "bg-green-100" : "bg-gray-100"
                        }`}>
                            {req.met ? (
                                <Check className="h-2 w-2 text-green-600" strokeWidth={4} />
                            ) : (
                                <X className="h-2 w-2 text-gray-400" strokeWidth={3} />
                            )}
                        </div>
                        <span className={`text-xs ${req.met ? "text-gray-600" : "text-gray-400"}`}>
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
