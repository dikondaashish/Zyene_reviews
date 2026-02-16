import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        redirect(`http://auth.${rootDomain}`);
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
            {children}
        </div>
    );
}
