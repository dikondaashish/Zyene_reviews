"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardTour } from "@/components/tours/dashboard-tour-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Loader2 } from "lucide-react";

export function RestartTourSection() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { startTour } = useDashboardTour();

    const handleRestart = async () => {
        setIsLoading(true);
        try {
            await startTour();
            router.push("/dashboard?tour=true");
        } catch {
            router.push("/dashboard?tour=true");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <RotateCcw className="size-4" />
                    Product Tour
                </CardTitle>
                <CardDescription>
                    Replay the guided walkthrough to revisit key features of your dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleRestart()}
                    disabled={isLoading}
                    className="gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin size-4" />
                            Starting…
                        </>
                    ) : (
                        <>
                            <RotateCcw className="size-4" />
                            Start Tour Again
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
