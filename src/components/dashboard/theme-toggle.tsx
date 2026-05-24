"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export function ThemeToggle({ sound = true }: { sound?: boolean }) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="size-9 shrink-0" aria-hidden />;
    }

    const isDark = resolvedTheme === "dark";

    return (
        <AnimatedThemeToggler
            sound={sound}
            isDark={isDark}
            onToggle={() => setTheme(isDark ? "light" : "dark")}
        />
    );
}
