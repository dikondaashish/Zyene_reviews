import { createClient } from "@/lib/db/supabase/server";
import { ApiRouteError } from "./errors";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiRouteError("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  }

  return { supabase, user };
}

