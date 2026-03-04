import { Plus, UploadCloud, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
    title: "Customers | Zyene Reviews",
    description: "Manage your customers",
};

export default async function CustomersPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get the active business
    // To simplify for this view, we'll try to find any business they own
    const { data: member } = await supabase
        .from("organization_members")
        .select("organizations ( businesses ( id, name ) )")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

    const businesses = (member as any)?.organizations?.businesses || [];
    const activeBusiness = businesses[0];

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

    // Fetch customers
    const { data: customers, error } = await supabase
        .from("customers")
        .select("*")
        .eq("business_id", activeBusiness.id)
        .order("created_at", { ascending: false })
        .limit(50);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                <div className="flex items-center space-x-2">
                    <Button asChild variant="outline">
                        <Link href="/customers/import">
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Import CSV
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="#">
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Link>
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
                    {!customers || customers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold">No customers found</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                                Upload a CSV file or add customers manually to start sending review requests.
                            </p>
                            <Button asChild>
                                <Link href="/customers/import">
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Import from CSV
                                </Link>
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
                                    {customers.map((c: any) => (
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
        </div>
    );
}
