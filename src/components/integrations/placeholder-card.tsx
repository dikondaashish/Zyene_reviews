
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceholderCardProps {
    name: string;
    description: string;
    icon: React.ReactNode;
}

export function PlaceholderCard({ name, description, icon }: PlaceholderCardProps) {
    return (
        <Card className="bg-muted/40 border-dashed">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 opacity-70">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border shadow-sm">
                            {icon}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{name}</CardTitle>
                        </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" /> Coming Soon
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <Button variant="ghost" size="sm" className="w-full" disabled>
                    Get notified when available
                </Button>
            </CardContent>
        </Card>
    );
}
