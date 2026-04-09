"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetTour } from "@/app/actions/tour";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Loader2 } from "lucide-react";

/**
 * Settings section to restart the product tour
 */
export function RestartTourSection() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRestart = async () => {
        setIsLoading(true);
        try {
            await resetTour();
            router.push("/dashboard?tour=true");
        } catch (error) {
            console.error("Failed to reset tour:", error);
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <RotateCcw className="h-4 w-4" />
                    Product Tour
                </CardTitle>
                <CardDescription>
                    Replay the guided walkthrough to revisit key features of your dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    variant="outline"
                    onClick={handleRestart}
                    disabled={isLoading}
                    className="gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Starting…
                        </>
                    ) : (
                        <>
                            <RotateCcw className="h-4 w-4" />
                            Start Tour Again
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
