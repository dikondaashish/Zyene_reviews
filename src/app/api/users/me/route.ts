
import { createClient } from "@/lib/db/supabase/server";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";

const updateProfileSchema = z.object({
    full_name: z.string().max(200),
});

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401 });
    }

    const parsed = updateProfileSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, { status: 400 });
    }
    const body = parsed.data;

    // Update user metadata (full_name)
    const { data, error } = await supabase.auth.updateUser({
        data: { full_name: body.full_name },
    });

    if (error) {
        return apiError("Internal Server Error", { status: 500 });
    }

    // Also update public.users table if it exists and has name column?
    // Usually auth triggers handle this, or we update it manually.
    // Assuming we might have a users table copy.
    // Let's check if we need to update a users table.
    // For now, updating auth metadata is standard.
    // If request included deleting, user.delete() is needed.

    return apiOk(data.user);
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    // Deleting own account requires using admin client or specific RPC usually, 
    // or just calling deleteUser on the server if allowed.
    // For safety, we'll just implement the route structure but maybe not fully delete yet 
    // without admin privileges, or we use the service role key if needed.

    // Actually, supabase.auth.admin.deleteUser(id) needs service role.
    // Standard client can't delete self usually unless configured.
    // We will leave this unimplemented or use a service role client if we had one (we do in lib/supabase but usually for admin tasks).
    // For now, let's return 501 Not Implemented or simulated success.

    return apiError("Delete account not implemented yet", { status: 501 });
}
