
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function InviteMemberDialog() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [scope, setScope] = useState<"org" | "store">("org");
    const [role, setRole] = useState("ORG_EMPLOYEE");
    const [businessId, setBusinessId] = useState("");
    const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Fetch businesses for dropdown
    useEffect(() => {
        if (open && businesses.length === 0) {
            async function fetchBusinesses() {
                const { data } = await supabase.from("businesses").select("id, name");
                if (data) setBusinesses(data);
            }
            fetchBusinesses();
        }
    }, [open, supabase, businesses.length]);

    // Update role options and defaults when scope changes
    useEffect(() => {
        if (scope === "org") {
            setRole("ORG_EMPLOYEE");
        } else {
            setRole("STORE_EMPLOYEE");
            // Auto-select first business if available
            if (businesses.length > 0 && !businessId) {
                setBusinessId(businesses[0].id);
            }
        }
    }, [scope, businesses, businessId]);


    const handleInvite = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/team/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    role,
                    business_id: scope === "store" ? businessId : undefined
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to invite member");
            }

            toast.success("Invitation sent");
            setOpen(false);
            setEmail("");
            // Reset to defaults
            setScope("org");
            setRole("ORG_EMPLOYEE");
            setBusinessId("");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                    <DialogDescription>
                        Invite a new member to your {scope === "org" ? "Organization" : "Store"}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            placeholder="colleague@example.com"
                        />
                    </div>

                    {/* Scope Selector */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="scope" className="text-right">
                            Scope
                        </Label>
                        <Select value={scope} onValueChange={(v: "org" | "store") => setScope(v)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select Scope" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="org">Organization</SelectItem>
                                <SelectItem value="store">Specific Store</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                     {/* Business Selector (only if store scope) */}
                     {scope === "store" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="business" className="text-right">
                                Store
                            </Label>
                            <Select value={businessId} onValueChange={setBusinessId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a Store" />
                                </SelectTrigger>
                                <SelectContent>
                                    {businesses.map((b) => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {scope === "org" ? (
                                    <>
                                        <SelectItem value="ORG_MANAGER">Org Manager</SelectItem>
                                        <SelectItem value="ORG_EMPLOYEE">Org Employee</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value="STORE_OWNER">Store Owner</SelectItem>
                                        <SelectItem value="STORE_MANAGER">Store Manager</SelectItem>
                                        <SelectItem value="STORE_EMPLOYEE">Store Employee</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleInvite} disabled={isLoading || !email || (scope === "store" && !businessId)}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Invite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
