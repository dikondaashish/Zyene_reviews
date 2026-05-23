"use client";

import { CheckCircle2, Loader2, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { YelpBusinessResult } from "./yelp-card-types";
import { YelpCardIcon } from "./yelp-card-icon";

interface YelpIntegrationCardConnectFlowProps {
    showConnect: boolean;
    onShowConnect: (v: boolean) => void;
    searchName: string;
    onSearchNameChange: (v: string) => void;
    searchLocation: string;
    onSearchLocationChange: (v: string) => void;
    isSearching: boolean;
    onSearch: () => void;
    searchResults: YelpBusinessResult[];
    isConfirming: string | null;
    onConfirm: (biz: YelpBusinessResult) => void;
    onCancelConnect: () => void;
}

export function YelpIntegrationCardConnectFlow({
    showConnect,
    onShowConnect,
    searchName,
    onSearchNameChange,
    searchLocation,
    onSearchLocationChange,
    isSearching,
    onSearch,
    searchResults,
    isConfirming,
    onConfirm,
    onCancelConnect,
}: YelpIntegrationCardConnectFlowProps) {
    return (
        <Card className="border">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <YelpCardIcon className="h-6 w-6 text-destructive" />
                        <div>
                            <h3 className="font-semibold text-sm">Yelp</h3>
                            <p className="text-xs text-muted-foreground">Monitor and respond to Yelp reviews</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                {!showConnect ? (
                    <div className="text-center py-2">
                        <p className="text-xs text-muted-foreground mb-3">
                            Connect your Yelp business to sync and monitor reviews.
                        </p>
                        <Button className="h-9 text-sm" variant="destructive" onClick={() => onShowConnect(true)}>
                            <YelpCardIcon className="h-4 w-4 mr-2 text-destructive-foreground" />
                            Connect Yelp
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">Business Name</label>
                            <Input
                                placeholder="e.g. Joe's Coffee Shop"
                                value={searchName}
                                onChange={(e) => onSearchNameChange(e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">City, State</label>
                            <Input
                                placeholder="e.g. San Francisco, CA"
                                value={searchLocation}
                                onChange={(e) => onSearchLocationChange(e.target.value)}
                                className="h-8 text-sm"
                                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                            />
                        </div>
                        <Button className="h-8 text-xs w-full" onClick={onSearch} disabled={isSearching}>
                            {isSearching ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                                <Search className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Search Yelp
                        </Button>

                        {searchResults.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                                    Select your business
                                </p>
                                {searchResults.map((biz) => (
                                    <button
                                        type="button"
                                        key={biz.yelpId}
                                        className="w-full text-left p-2.5 border border-border rounded-md hover:bg-muted hover:border-destructive/30 transition-colors group"
                                        onClick={() => onConfirm(biz)}
                                        disabled={isConfirming !== null}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground group-hover:text-destructive truncate">
                                                    {biz.name}
                                                </p>
                                                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    {biz.address}, {biz.city}, {biz.state}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-medium">{biz.rating}★</span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {biz.reviewCount} reviews
                                                    </span>
                                                    {biz.categories.length > 0 && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            • {biz.categories.slice(0, 2).join(", ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isConfirming === biz.yelpId ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                                            ) : (
                                                <CheckCircle2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            className="text-xs text-muted-foreground hover:text-foreground hover:underline w-full text-center"
                            onClick={onCancelConnect}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
