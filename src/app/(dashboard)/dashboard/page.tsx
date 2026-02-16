import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, MessageSquare, Star, Users } from "lucide-react"
import { GoogleConnectButton } from "@/components/dashboard/google-connect-button"
import { SyncButton } from "@/components/dashboard/sync-button"
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch user's business and review platforms
    const { data: memberData } = await supabase
        .from("organization_members")
        .select(`
            organizations (
                businesses (
                    *,
                    review_platforms (*)
                )
            )
        `)
        .eq("user_id", user.id)
        .single()

    // @ts-ignore - Supabase types inference 
    const business = memberData?.organizations?.businesses?.[0] || {
        total_reviews: 0,
        average_rating: 0,
        review_request_frequency_cap_days: 0,
        status: 'inactive'
    }

    // @ts-ignore
    const googlePlatform = business?.review_platforms?.find((p: any) => p.platform === 'google')
    const isGoogleConnected = !!googlePlatform
    const lastSynced = googlePlatform?.last_synced_at

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    {lastSynced && (
                        <p className="text-sm text-muted-foreground">
                            Last synced: {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
                        </p>
                    )}
                </div>
                {isGoogleConnected && <SyncButton />}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{business.total_reviews}</div>
                        <p className="text-xs text-muted-foreground">+0% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(business.average_rating).toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">
                            {business.total_reviews > 0 ? "Based on Google Reviews" : "No ratings yet"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0%</div>
                        <p className="text-xs text-muted-foreground">No responses yet</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Needs attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Reviews */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                        {isGoogleConnected ? (
                            <>
                                <p className="text-muted-foreground">
                                    {business.total_reviews > 0
                                        ? "Reviews are synced. (Display functionality coming soon)"
                                        : "Connected to Google Business Profile. Waiting for initial sync..."}
                                </p>
                                <GoogleConnectButton isConnected={true} />
                            </>
                        ) : (
                            <>
                                <p className="text-muted-foreground">No reviews yet. Connect Google to get started.</p>
                                <GoogleConnectButton isConnected={false} />
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Needs Attention</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                        <p className="text-muted-foreground">Great job! You have no pending items.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
