import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImportCustomersHeader() {
    return (
        <div className="flex items-center space-x-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/customers">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Import Customers</h2>
        </div>
    );
}
