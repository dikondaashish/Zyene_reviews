"use client";

import { CampaignTemplate } from "@/lib/campaigns/templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/index";

interface CampaignTemplateCardProps {
    template: CampaignTemplate;
    compact?: boolean;
}

export function CampaignTemplateCard({ template, compact = false }: CampaignTemplateCardProps) {
    const Icon = template.icon;

    return (
        <Card className={cn(
            "group hover:shadow-lg transition-all duration-300 border-dashed border-2 hover:border-solid hover:border-blue-200",
            compact ? "p-0" : "p-2"
        )}>
            <CardContent className={cn("p-4 flex flex-col h-full", compact && "p-3")}>
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300",
                    template.color
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                
                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {template.name}
                </h3>
                
                <p className="text-xs text-slate-500 mb-6 leading-relaxed flex-1">
                    {template.description}
                </p>

                <Button 
                    asChild 
                    variant="outline" 
                    size="sm" 
                    className="w-full rounded-lg border-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all group/btn"
                >
                    <Link href={`/campaigns/new?templateId=${template.id}`}>
                        Use Template
                        <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
