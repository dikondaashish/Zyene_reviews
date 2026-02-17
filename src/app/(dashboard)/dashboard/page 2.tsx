import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        // Redirect to login subdomain with return URL
        redirect(`http://login.${rootDomain}?redirectTo=http://dashboard.${rootDomain}`);
    }

    // Fetch organization details for the user...
    // For now, just show a welcome message.

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-gray-600">
                    Welcome back, <span className="font-semibold">{user.email}</span>!
                </p>
                <p className="text-sm text-gray-500">
                    You are now logged in to the main application.
                </p>
            </div>
        </div>
    );
}
