"use client";

import { BarChart, ExternalLink, PieChart, Star } from "lucide-react";
import { AddCompetitorDialog } from "./add-competitor-dialog";
import type { Competitor } from "./competitors-types";

type CompetitorsListEmptyStateProps = {
    businessId: string;
    onAddCompetitor: (newCompetitor: Competitor) => void;
};

export function CompetitorsListEmptyState({ businessId, onAddCompetitor }: CompetitorsListEmptyStateProps) {
    return (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-br from-background to-primary/10 rounded-3xl border border-primary/20 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-chart-4/18/10 dark:bg-chart-4/15 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                        <div className="w-20 h-20 bg-gradient-to-tr from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-8 rotate-2 transform transition-transform hover:rotate-0 duration-500">
                            <Star className="h-10 w-10 text-primary-foreground fill-primary-foreground" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                            See how you stack up against the competition
                        </h3>
                        
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Monitor your competitors' ratings and review volume in real-time. Gain insights into their performance and stay ahead in your local market.
                        </p>

                        <AddCompetitorDialog
                            businessId={businessId}
                            onSuccess={onAddCompetitor}
                        />

                        <div className="mt-10 grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground min-[400px]:grid-cols-4 min-[400px]:gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Star className="h-4 w-4" /></div>
                                Rating Tracking
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-chart-4/120/10 rounded-lg text-chart-4"><BarChart className="h-4 w-4" /></div>
                                Volume Growth
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><PieChart className="h-4 w-4" /></div>
                                Market Share
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-chart-2/10 rounded-lg text-chart-2"><ExternalLink className="h-4 w-4" /></div>
                                Direct Links
                            </div>
                        </div>
                    </div>
                </div>
    );
}
