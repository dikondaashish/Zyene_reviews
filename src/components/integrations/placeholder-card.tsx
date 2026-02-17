"use client";

import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock } from "lucide-react";
import { toast } from "sonner";

interface PlaceholderCardProps {
    name: string;
    description: string;
    icon: React.ReactNode;
    accentColor?: string;
}

export function PlaceholderCard({
    name,
    description,
    icon,
    accentColor = "bg-gray-400",
}: PlaceholderCardProps) {
    const handleNotify = () => {
        toast.success(
            `We'll notify you when ${name} integration is available!`,
            {
                icon: <Bell className="h-4 w-4" />,
            }
        );
    };

    return (
        <Card className="relative overflow-hidden border-dashed opacity-75 hover:opacity-100 transition-all duration-300 hover:shadow-sm group">
            {/* Accent bar */}
            <div className={`h-1 ${accentColor} w-full opacity-40 group-hover:opacity-70 transition-opacity`} />

            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80 border shadow-sm">
                            {icon}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{name}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="secondary"
                        className="gap-1 text-[10px] shrink-0 font-medium"
                    >
                        <Clock className="h-3 w-3" />
                        Coming Soon
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8"
                    onClick={handleNotify}
                >
                    <Bell className="mr-1.5 h-3 w-3" />
                    Notify Me When Available
                </Button>
            </CardContent>
        </Card>
    );
}
