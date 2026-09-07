
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ENTERPRISE_SALES_EMAIL } from "@/lib/enterprise/enterprise-data";

export function EnterpriseSection6Section() {
    return (
        <section className="py-16 px-4 bg-primary/5 border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to talk?</h2>
                    <p className="text-muted-foreground mb-6">
                        Our sales team handles inbound from this page, <Link href="/demo" className="text-primary underline">/demo</Link>, and{" "}
                        {ENTERPRISE_SALES_EMAIL}.
                    </p>
                    <Button size="lg" asChild>
                        <Link href="/demo">Schedule a demo</Link>
                    </Button>
                </div>
            </section>
    );
}
