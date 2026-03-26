import { getActiveBusinessId } from "@/lib/auth/business-context";
import { createClient } from "@/lib/db/supabase/server";
import { CustomerManagement } from "@/components/customers/customer-management";
import { redirect } from "next/navigation";

export default async function CustomersPage() {
    const { businessId, businesses } = await getActiveBusinessId();

    if (!businessId || businesses.length === 0) {
        redirect("/businesses/add");
    }

    const supabase = await createClient();
    
    // Fetch initial customers for the active business
    const { data: initialCustomers, error } = await supabase
        .from("customers")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching initial customers:", error);
    }

    return (
        <div className="max-w-[1200px] mx-auto py-10 px-6">
            <CustomerManagement 
                businessId={businessId} 
                initialCustomers={initialCustomers || []} 
            />
        </div>
    );
}
