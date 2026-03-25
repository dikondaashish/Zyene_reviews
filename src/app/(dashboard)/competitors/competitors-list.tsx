"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ExternalLink, Star, Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AddCompetitorDialog } from "./add-competitor-dialog";
import { deleteCompetitor } from "@/app/actions/competitor";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { Database } from "@/lib/supabase/database.types";

type Competitor = Database["public"]["Tables"]["competitors"]["Row"];

export function CompetitorsList({
    businessId,
    initialCompetitors
}: {
    businessId: string;
    initialCompetitors: Competitor[];
}) {
    const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const isSyncing = (competitor: Competitor): boolean => {
        if (competitor.average_rating !== 0 && competitor.average_rating !== null) return false;
        if (competitor.total_reviews !== 0) return false;
        
        // Consider it syncing if created less than 2 minutes ago
        const createdAt = new Date(competitor.created_at || "");
        const now = new Date();
        const minutesAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        return minutesAgo < 2;
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const result = await deleteCompetitor(id, businessId);
            if (result.success) {
                setCompetitors(competitors.filter(c => c.id !== id));
                toast.success("Competitor removed successfully.");
            } else {
                toast.error(result.error || "Failed to remove competitor.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to remove competitor.");
        } finally {
            setIsDeleting(null);
            setDeleteConfirm(null);
        }
    };

    // Chart Data (exclude syncing competitors)
    const chartData = competitors
        .filter(c => !isSyncing(c))
        .map(c => ({
            name: c.name,
            rating: Number(c.average_rating) || 0,
            reviews: c.total_reviews || 0,
        }));

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <AddCompetitorDialog
                    businessId={businessId}
                    onSuccess={(newCompetitor) => setCompetitors([newCompetitor, ...competitors])}
                />
            </div>

            {competitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-br from-white to-blue-50/20 rounded-3xl border border-blue-100/50 shadow-sm relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-100 rotate-2 transform transition-transform hover:rotate-0 duration-500">
                            <Star className="h-10 w-10 text-white fill-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                            See how you stack up against the competition
                        </h3>
                        
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Monitor your competitors' ratings and review volume in real-time. Gain insights into their performance and stay ahead in your local market.
                        </p>

                        <AddCompetitorDialog
                            businessId={businessId}
                            onSuccess={(newCompetitor) => setCompetitors([newCompetitor, ...competitors])}
                        />

                        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Star className="h-4 w-4" /></div>
                                Rating Tracking
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><BarChart className="h-4 w-4" /></div>
                                Volume Growth
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-500"><CartesianGrid className="h-4 w-4" /></div>
                                Market Share
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-green-50 rounded-lg text-green-500"><ExternalLink className="h-4 w-4" /></div>
                                Direct Links
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Data Table */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Tracked Competitors</CardTitle>
                            <CardDescription>
                                Your competitors' ratings and reviews. Stats are updated periodically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Competitor Name</TableHead>
                                        <TableHead>Avg Rating</TableHead>
                                        <TableHead>Total Reviews</TableHead>
                                        <TableHead>Google Link</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {competitors.map((competitor) => {
                                        const syncing = isSyncing(competitor);
                                        const updatedAt = competitor.updated_at 
                                            ? formatDistanceToNow(new Date(competitor.updated_at), { addSuffix: true })
                                            : "—";
                                        
                                        return (
                                            <TableRow key={competitor.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {competitor.name}
                                                        {syncing && (
                                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                Syncing...
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center text-sm">
                                                        {syncing ? (
                                                            <span className="text-muted-foreground">—</span>
                                                        ) : (
                                                            <>
                                                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                                                {competitor.average_rating || "—"}
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {syncing ? <span className="text-muted-foreground">—</span> : competitor.total_reviews || 0}
                                                </TableCell>
                                                <TableCell>
                                                    {competitor.google_url ? (
                                                        <a
                                                            href={competitor.google_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center text-blue-600 hover:underline"
                                                        >
                                                            View <ExternalLink className="h-3 w-3 ml-1" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {updatedAt}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isDeleting === competitor.id}
                                                        onClick={() => setDeleteConfirm(competitor.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        {isDeleting === competitor.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Chart Component */}
                    {chartData.length > 0 && (
                        <>
                            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Rating Comparison</CardTitle>
                                    <CardDescription>Average rating across tracked competitors</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-75 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} />
                                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                                <Bar dataKey="rating" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Review Volume Comparison Chart */}
                            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Review Volume Comparison</CardTitle>
                                    <CardDescription>Total number of reviews across tracked competitors</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-75 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                                <Bar dataKey="reviews" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Competitor</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove {competitors.find(c => c.id === deleteConfirm)?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting === deleteConfirm}
                            onClick={() => handleDelete(deleteConfirm!)}
                        >
                            {isDeleting === deleteConfirm ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                "Remove"
                            )}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
