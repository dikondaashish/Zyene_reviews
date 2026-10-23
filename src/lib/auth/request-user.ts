import { cache } from "react";
import { createClient } from "@/lib/db/supabase/server";

/**
 * The signed-in user, verified with Supabase Auth once per server request. The layout,
 * settings access and page loaders all need it, and each `auth.getUser()` is a network call.
 */
export const getRequestUser = cache(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
});
