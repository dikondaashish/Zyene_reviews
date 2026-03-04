"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay slightly so it doesn't block the initial render immediately
        const timer = setTimeout(() => {
            const consent = localStorage.getItem("cookie-consent");
            if (!consent) {
                setIsVisible(true);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setIsVisible(false);
    };

    const declineCookies = () => {
        localStorage.setItem("cookie-consent", "declined");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-xl bg-background shadow-lg shadow-black/5">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="hidden sm:flex p-2 bg-primary/10 rounded-full">
                        <Cookie className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">We value your privacy</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[500px]">
                            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 shrink-0 self-end sm:self-center">
                    <Button variant="ghost" size="sm" onClick={declineCookies}>
                        Decline
                    </Button>
                    <Button size="sm" onClick={acceptCookies}>
                        Accept All
                    </Button>
                </div>
            </div>
        </div>
    );
}
