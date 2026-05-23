/**
 * Query builder for tables not yet in generated Database types.
 * Prefer adding tables to database.types.ts; use this only as a bridge.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function fromUntypedTable(client: SupabaseClient<Database>, table: string) {
  return client.from(table as never);
}
