import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface AccessErrorProps {
    type: "subscription" | "platform";
    businessName: string;
}

export function AccessError({ type, businessName }: AccessErrorProps) {
    const isSubscription = type === "subscription";

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md mx-auto shadow-lg border-muted">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        {isSubscription ? (
                            <Lock className="w-6 h-6 text-muted-foreground" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-muted-foreground" />
                        )}
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl">
                            {isSubscription
                                ? "This review page is inactive"
                                : "Google Profile Not Connected"}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {isSubscription
                                ? `${businessName} currently has a limited plan that doesn't support public review collection.`
                                : `${businessName} hasn't connected a Google Business Profile yet.`}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground text-center">
                        <p className="font-medium text-foreground mb-1">Are you the business owner?</p>
                        {isSubscription ? (
                            <p>Upgrade your subscription to activate this page and start collecting reviews.</p>
                        ) : (
                            <p>Connect your Google Business Profile in the dashboard to enable this page.</p>
                        )}
                    </div>

                    <Button asChild className="w-full" size="lg">
                        <Link href={isSubscription ? "https://dashboard.zyene.in/settings/billing" : "https://dashboard.zyene.in/onboarding"}>
                            {isSubscription ? "Upgrade Subscription" : "Connect Google Profile"}
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
