"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Send,
    Mail,
    MessageSquare,
    Plus,
    Users,
    Eye,
    MousePointerClick,
    CheckCircle,
    Loader2,
    Pause,
    Play,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Campaign {
    id: string;
    name: string;
    status: string;
    channel: string;
    trigger_type: string;
    sms_template: string;
    email_subject: string;
    email_template: string;
    delay_minutes: number;
    follow_up_enabled: boolean;
    follow_up_delay_hours: number;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    total_completed: number;
    total_reviews_received: number;
    created_at: string;
}

interface ReviewRequest {
    id: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    channel: string;
    status: string;
    sent_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    created_at: string;
}

const statusColors: Record<string, string> = {
    sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    delivered: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    opened: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    clicked: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    review_left: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    sending: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    queued: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [requests, setRequests] = useState<ReviewRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Add contacts form
    const [contactName, setContactName] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [bulkPhones, setBulkPhones] = useState("");
    const [addMode, setAddMode] = useState<"single" | "bulk">("single");

    const fetchCampaign = async () => {
        try {
            const res = await fetch(`/api/campaigns/${resolvedParams.id}`);
            if (!res.ok) {
                router.push("/campaigns");
                return;
            }
            const data = await res.json();
            setCampaign(data.campaign);
            setRequests(data.requests || []);
        } catch {
            router.push("/campaigns");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaign();
    }, [resolvedParams.id]);

    const toggleStatus = async () => {
        if (!campaign) return;
        const newStatus = campaign.status === "active" ? "paused" : "active";
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Campaign ${newStatus === "active" ? "activated" : "paused"}`);
                fetchCampaign();
            }
        } catch {
            toast.error("Failed to update campaign");
        }
    };

    const sendToContacts = async () => {
        if (!campaign) return;

        let contacts: { name?: string; phone?: string; email?: string }[] = [];

        if (addMode === "single") {
            if (!contactPhone && !contactEmail) {
                toast.error("Enter a phone number or email");
                return;
            }
            contacts = [{ name: contactName || undefined, phone: contactPhone || undefined, email: contactEmail || undefined }];
        } else {
            // Bulk: one phone per line
            const lines = bulkPhones.split("\n").filter((l) => l.trim());
            if (lines.length === 0) {
                toast.error("Enter at least one phone number");
                return;
            }
            contacts = lines.map((phone) => ({ phone: phone.trim() }));
        }

        setSending(true);
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contacts }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || "Failed to send");
                return;
            }

            toast.success(`Sent: ${result.sent}, Skipped: ${result.skipped}, Failed: ${result.failed}`);
            setDialogOpen(false);
            setContactName("");
            setContactPhone("");
            setContactEmail("");
            setBulkPhones("");
            fetchCampaign();
        } catch {
            toast.error("Failed to send");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!campaign) return null;

    const totalCompleted = campaign.total_completed || campaign.total_reviews_received || 0;
    const funnelStages = [
        { label: "Sent", value: campaign.total_sent, icon: Send, color: "bg-blue-500" },
        { label: "Opened", value: campaign.total_opened, icon: Eye, color: "bg-yellow-500" },
        { label: "Clicked", value: campaign.total_clicked, icon: MousePointerClick, color: "bg-purple-500" },
        { label: "Completed", value: totalCompleted, icon: CheckCircle, color: "bg-green-500" },
    ];
    const maxFunnel = Math.max(campaign.total_sent, 1);

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
                            <Badge
                                variant={campaign.status === "active" ? "default" : "secondary"}
                                className={
                                    campaign.status === "active"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                        : campaign.status === "paused"
                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                            : ""
                                }
                            >
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {campaign.channel === "both" ? "SMS + Email" : campaign.channel.toUpperCase()} · {campaign.trigger_type.replace("_", " ")} · Created {new Date(campaign.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={toggleStatus}>
                        {campaign.status === "active" ? (
                            <><Pause className="mr-2 h-4 w-4" />Pause</>
                        ) : (
                            <><Play className="mr-2 h-4 w-4" />Activate</>
                        )}
                    </Button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Contacts
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Contacts</DialogTitle>
                            </DialogHeader>

                            {/* Mode Toggle */}
                            <div className="flex gap-2 mb-4">
                                <Button
                                    variant={addMode === "single" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setAddMode("single")}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Single
                                </Button>
                                <Button
                                    variant={addMode === "bulk" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setAddMode("bulk")}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Bulk
                                </Button>
                                <Button variant="outline" size="sm" disabled>
                                    CSV (Coming Soon)
                                </Button>
                            </div>

                            {addMode === "single" ? (
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="contact-name">Name (optional)</Label>
                                        <Input
                                            id="contact-name"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            placeholder="John Smith"
                                        />
                                    </div>
                                    {(campaign.channel === "sms" || campaign.channel === "both") && (
                                        <div>
                                            <Label htmlFor="contact-phone">Phone</Label>
                                            <Input
                                                id="contact-phone"
                                                value={contactPhone}
                                                onChange={(e) => setContactPhone(e.target.value)}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    )}
                                    {(campaign.channel === "email" || campaign.channel === "both") && (
                                        <div>
                                            <Label htmlFor="contact-email">Email</Label>
                                            <Input
                                                id="contact-email"
                                                type="email"
                                                value={contactEmail}
                                                onChange={(e) => setContactEmail(e.target.value)}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="bulk-phones">Phone Numbers (one per line)</Label>
                                        <Textarea
                                            id="bulk-phones"
                                            value={bulkPhones}
                                            onChange={(e) => setBulkPhones(e.target.value)}
                                            rows={8}
                                            placeholder={"+15551234567\n+15559876543\n+15550001111"}
                                            className="font-mono text-sm"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {bulkPhones.split("\n").filter((l) => l.trim()).length} phone numbers
                                        </p>
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={sendToContacts} disabled={sending}>
                                    {sending ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                                    ) : (
                                        <><Send className="mr-2 h-4 w-4" />Send Now</>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {funnelStages.map((stage) => (
                    <Card key={stage.label}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`rounded-lg p-2 ${stage.color} text-white`}>
                                    <stage.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stage.value}</p>
                                    <p className="text-xs text-muted-foreground">{stage.label}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Conversion Funnel */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {funnelStages.map((stage) => {
                            const pct = maxFunnel > 0 ? (stage.value / maxFunnel) * 100 : 0;
                            return (
                                <div key={stage.label} className="flex items-center gap-3">
                                    <span className="text-sm font-medium w-20 text-right">{stage.label}</span>
                                    <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${stage.color} rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                                            style={{ width: `${Math.max(pct, 2)}%` }}
                                        >
                                            {pct >= 10 && (
                                                <span className="text-xs font-semibold text-white">{stage.value}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm text-muted-foreground w-12">{Math.round(pct)}%</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Contact List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Contacts ({requests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No contacts sent yet. Click &ldquo;Add Contacts&rdquo; to get started.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Channel</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">
                                            {req.customer_name || "—"}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {req.customer_phone || req.customer_email || "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {req.channel}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-xs ${statusColors[req.status] || ""}`}>
                                                {req.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {req.sent_at
                                                ? new Date(req.sent_at).toLocaleString()
                                                : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
