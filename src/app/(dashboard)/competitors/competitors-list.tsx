"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ExternalLink, Star } from "lucide-react";
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
import { AddCompetitorDialog } from "./add-competitor-dialog";
import { deleteCompetitor } from "@/app/actions/competitor";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            await deleteCompetitor(id, businessId);
            setCompetitors(competitors.filter(c => c.id !== id));
            toast.success("Competitor removed successfully.");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove competitor.");
        } finally {
            setIsDeleting(null);
        }
    };

    // Chart Data
    const chartData = competitors.map(c => ({
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
                <Card className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-dashed">
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                        <Plus className="h-8 w-8 text-slate-400" />
                    </div>
                    <CardTitle className="text-xl mb-2">No competitors tracked yet</CardTitle>
                    <CardDescription className="max-w-sm mb-6">
                        Add competitors to monitor their ratings, review counts, and performance compared to your business.
                    </CardDescription>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Data Table */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Tracked Competitors</CardTitle>
                            <CardDescription>
                                Overview of your competitors' performance. (Stats updated periodically).
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
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {competitors.map((competitor) => (
                                        <TableRow key={competitor.id}>
                                            <TableCell className="font-medium">
                                                {competitor.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                                    {competitor.average_rating}
                                                </div>
                                            </TableCell>
                                            <TableCell>{competitor.total_reviews}</TableCell>
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
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isDeleting === competitor.id}
                                                    onClick={() => handleDelete(competitor.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Chart Component */}
                    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Rating Comparison</CardTitle>
                            <CardDescription>Average rating across tracked competitors</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
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
                            <div className="h-[300px] w-full">
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
                </div>
            )}
        </div>
    );
}
