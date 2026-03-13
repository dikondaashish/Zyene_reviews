"use client";

import { Plus, UploadCloud, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { AddCustomerModal } from "@/components/customers/add-customer-modal";
import { CSVImportModal } from "@/components/customers/csv-import-modal";

interface Customer {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    created_at: string;
}

interface Business {
    id: string;
    name: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [addCustomerOpen, setAddCustomerOpen] = useState(false);
    const [importCSVOpen, setImportCSVOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                redirect("/login");
            }

            // Get the active business
            const { data: member } = await supabase
                .from("organization_members")
                .select("organizations ( businesses ( id, name ) )")
                .eq("user_id", user.id)
                .eq("status", "active")
                .single();

            const businesses = (member as any)?.organizations?.businesses || [];
            const business = businesses[0];

            if (!business) {
                setActiveBusiness(null);
                setLoading(false);
                return;
            }

            setActiveBusiness(business);

            // Fetch customers
            const { data: customerData, error } = await supabase
                .from("customers")
                .select("*")
                .eq("business_id", business.id)
                .order("created_at", { ascending: false })
                .limit(50);

            if (!error && customerData) {
                setCustomers(customerData as Customer[]);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Loading...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!activeBusiness) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>No business found</CardTitle>
                        <CardDescription>
                            Please create a business first to manage customers.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setImportCSVOpen(true)}
                    >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Import CSV
                    </Button>
                    <Button onClick={() => setAddCustomerOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Customer
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer List</CardTitle>
                    <CardDescription>
                        Manage business customers for {activeBusiness.name}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {customers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold">No customers found</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                                Upload a CSV file or add customers manually to start sending review requests.
                            </p>
                            <Button onClick={() => setImportCSVOpen(true)}>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Import from CSV
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="h-12 px-4 text-left font-medium text-muted-foreground">Name</th>
                                        <th className="h-12 px-4 text-left font-medium text-muted-foreground">Email</th>
                                        <th className="h-12 px-4 text-left font-medium text-muted-foreground">Phone</th>
                                        <th className="h-12 px-4 text-left font-medium text-muted-foreground">Added</th>
                                        <th className="h-12 px-4 text-right font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((c) => (
                                        <tr key={c.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                {c.first_name || ""} {c.last_name || ""}
                                                {!c.first_name && !c.last_name && <span className="text-muted-foreground italic">N/A</span>}
                                            </td>
                                            <td className="p-4 align-middle">{c.email || <span className="text-muted-foreground italic">N/A</span>}</td>
                                            <td className="p-4 align-middle">{c.phone || <span className="text-muted-foreground italic">N/A</span>}</td>
                                            <td className="p-4 align-middle">{new Date(c.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/requests?customer=${c.id}`}>Send Request</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Customer Modal */}
            <AddCustomerModal
                open={addCustomerOpen}
                onOpenChange={setAddCustomerOpen}
                businessId={activeBusiness.id}
            />

            {/* Import CSV Modal */}
            <CSVImportModal
                open={importCSVOpen}
                onOpenChange={setImportCSVOpen}
            />
        </div>
    );
}
