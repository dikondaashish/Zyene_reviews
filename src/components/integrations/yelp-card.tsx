"use client";

import { useState } from "react";
import { Star, CheckCircle2, RefreshCw, Clock, ExternalLink, AlertTriangle, Loader2, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Yelp Icon
function YelpIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className || "h-6 w-6 text-red-600"}>
            <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.874-4.304c.564-.846 1.94-.546 2.128.46l.6 3.022c.094.503-.096 1.012-.432 1.02zm-7.127 5.246l.696 4.072c.126.744-.606 1.37-1.33 1.136l-3.61-1.17c-.846-.273-1.07-1.346-.384-1.872l3.61-2.79c.654-.497 1.576.035 1.018.624zm-3.76-3.136l-4.05 2.48c-.82.503-1.88-.22-1.62-1.106l.696-2.39c.178-.61.76-.96 1.37-.83l3.616.782c.96.208.97 1.4-.013 1.064zm.84-5.688L7.8 4.488c-.41-.604-.086-1.436.63-1.61l2.95-.72c.814-.198 1.5.544 1.24 1.336l-1.15 3.484c-.298.898-1.546.898-1.358.04zM12 10.96c-1.656 0-3-1.344-3-3s1.344-3 3-3 3 1.344 3 3-1.344 3-3 3z" />
        </svg>
    );
}

interface YelpBusinessResult {
    yelpId: string;
    name: string;
    imageUrl: string;
    yelpUrl: string;
    reviewCount: number;
    rating: number;
    address: string;
    city: string;
    state: string;
    phone: string;
    categories: string[];
}

interface YelpCardProps {
    platform: any | null; // review_platform record
    businessId: string;
    businessName: string;
}

export function YelpIntegrationCard({ platform, businessId, businessName }: YelpCardProps) {
    const router = useRouter();
    const [isConnecting, setIsConnecting] = useState(false);
    const [showConnect, setShowConnect] = useState(false);
    const [searchName, setSearchName] = useState(businessName || "");
    const [searchLocation, setSearchLocation] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<YelpBusinessResult[]>([]);
    const [isConfirming, setIsConfirming] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const isConnected = platform && platform.sync_status === "active";
    const hasError = platform && platform.sync_status?.startsWith("error");

    const handleSearch = async () => {
        if (!searchName.trim() || !searchLocation.trim()) {
            toast.error("Please enter both business name and location");
            return;
        }

        setIsSearching(true);
        setSearchResults([]);

        try {
            const res = await fetch("/api/integrations/yelp/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessName: searchName,
                    location: searchLocation,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Search failed");

            setSearchResults(data.businesses || []);
            if (data.businesses?.length === 0) {
                toast.info("No businesses found. Try different search terms.");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleConfirm = async (yelpBiz: YelpBusinessResult) => {
        setIsConfirming(yelpBiz.yelpId);

        try {
            const res = await fetch("/api/integrations/yelp/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    yelpBusinessId: yelpBiz.yelpId,
                    businessId: businessId,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Connection failed");

            toast.success(`Connected to ${yelpBiz.name} on Yelp!`);
            setShowConnect(false);
            setSearchResults([]);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsConfirming(null);
        }
    };

    const handleDisconnect = async () => {
        try {
            // Delete the review_platform record
            const res = await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    disconnect_platform: "yelp",
                }),
            });

            toast.success("Yelp disconnected");
            router.refresh();
        } catch (error: any) {
            toast.error("Failed to disconnect");
        }
    };

    // ── Connected State ──
    if (isConnected) {
        return (
            <Card className="border bg-white">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <YelpIcon className="h-6 w-6 text-red-600" />
                            <div>
                                <h3 className="font-semibold text-sm">Yelp</h3>
                                <p className="text-xs text-muted-foreground">Business reviews</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-md p-2.5">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                                <Star className="w-3 h-3" /> Reviews synced
                            </div>
                            <p className="text-lg font-bold text-slate-900">
                                {platform.total_reviews || 0}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-md p-2.5">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                                <Clock className="w-3 h-3" /> Last synced
                            </div>
                            <p className="text-xs font-medium text-slate-900 mt-1">
                                {platform.last_synced_at
                                    ? new Date(platform.last_synced_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                                    : "Never"}
                            </p>
                        </div>
                    </div>
                    <p className="text-[10px] text-amber-600 mt-3 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Yelp API returns 3 most recent reviews per sync
                    </p>
                </CardContent>
                <CardFooter className="pt-0 flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                            setIsSyncing(true);
                            fetch("/api/cron/sync-reviews")
                                .then(() => {
                                    toast.success("Sync triggered");
                                    router.refresh();
                                })
                                .catch(() => toast.error("Sync failed"))
                                .finally(() => setIsSyncing(false));
                        }}
                        disabled={isSyncing}
                    >
                        <RefreshCw className={`w-3 h-3 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                        Sync Now
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="text-xs text-red-500 hover:text-red-700 hover:underline">
                                Disconnect
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Disconnect Yelp?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will stop syncing reviews from Yelp. Your existing reviews will be kept.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDisconnect} className="bg-red-600 hover:bg-red-700">
                                    Disconnect
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        );
    }

    // ── Error State ──
    if (hasError) {
        return (
            <Card className="border border-red-200 bg-red-50/30">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <YelpIcon className="h-6 w-6 text-red-600" />
                            <div>
                                <h3 className="font-semibold text-sm">Yelp</h3>
                                <p className="text-xs text-muted-foreground">Business reviews</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Error
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-3">
                    <p className="text-xs text-red-700">
                        There was an error syncing your Yelp reviews. This may be due to API rate limits or an invalid Yelp API key.
                    </p>
                </CardContent>
                <CardFooter className="pt-0">
                    <Button size="sm" className="h-8 text-xs w-full bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => setShowConnect(true)}>
                        Reconnect
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // ── Not Connected / Connect Flow ──
    return (
        <Card className="border">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <YelpIcon className="h-6 w-6 text-red-600" />
                        <div>
                            <h3 className="font-semibold text-sm">Yelp</h3>
                            <p className="text-xs text-muted-foreground">
                                Monitor and respond to Yelp reviews
                            </p>
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
                        <Button
                            className="h-9 text-sm bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => setShowConnect(true)}
                        >
                            <YelpIcon className="h-4 w-4 mr-2 text-white" />
                            Connect Yelp
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Search form */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">Business Name</label>
                            <Input
                                placeholder="e.g. Joe's Coffee Shop"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">City, State</label>
                            <Input
                                placeholder="e.g. San Francisco, CA"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                className="h-8 text-sm"
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                        <Button
                            className="h-8 text-xs w-full"
                            onClick={handleSearch}
                            disabled={isSearching}
                        >
                            {isSearching ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                                <Search className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Search Yelp
                        </Button>

                        {/* Search results */}
                        {searchResults.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                                    Select your business
                                </p>
                                {searchResults.map((biz) => (
                                    <button
                                        key={biz.yelpId}
                                        className="w-full text-left p-2.5 border rounded-md hover:bg-slate-50 hover:border-red-200 transition-colors group"
                                        onClick={() => handleConfirm(biz)}
                                        disabled={isConfirming !== null}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 group-hover:text-red-700 truncate">
                                                    {biz.name}
                                                </p>
                                                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    {biz.address}, {biz.city}, {biz.state}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-medium">
                                                        {biz.rating}★
                                                    </span>
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
                                                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                            ) : (
                                                <CheckCircle2 className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            className="text-xs text-muted-foreground hover:text-slate-700 hover:underline w-full text-center"
                            onClick={() => {
                                setShowConnect(false);
                                setSearchResults([]);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
