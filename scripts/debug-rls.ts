
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const [key, ...values] = line.split("=");
        if (key && values.length > 0) {
            const value = values.join("=").trim().replace(/^["']|["']$/g, ""); // Remove quotes
            if (!process.env[key.trim()]) {
                process.env[key.trim()] = value;
            }
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
    // 1. Service Role Client (Bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // 2. Simulate User Client (Organization Owner)
    // We'll sign in as novotel.owner@example.com
    const userClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await userClient.auth.signInWithPassword({
        email: "novotel.owner@example.com",
        password: "password123"
    });

    if (authError || !authData.user) {
        console.error("Failed to sign in as owner:", authError);
        return;
    }
    console.log("Signed in as:", authData.user.email);


    // 3. Query Business Members as Admin
    console.log("\n--- Admin View (All Members) ---");
    const { data: allMembers, error: adminError } = await adminClient
        .from("business_members")
        .select("*, businesses(name), users(email)");
    
    if (adminError) console.error("Admin error:", adminError);
    else console.log(`Found ${allMembers.length} business members (Admin)`);
    allMembers?.forEach(m => console.log(` - ${m.business_id} | ${m.role} | ${m.users?.email}`));


    // 4. Query Business Members as Owner (RLS Applied)
    console.log("\n--- Owner View (RLS Applied) ---");
    // This matches the query in the TeamPage
    // We first need the organization_id of the owner
    const { data: orgMember } = await userClient
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", authData.user.id)
        .single();
    
    const orgId = orgMember?.organization_id;
    console.log("Owner Org ID:", orgId);

    const { data: ownerViewMembers, error: ownerError } = await userClient
         .from("business_members")
        .select(`
            id,
            role,
            status,
            user_id,
            business_id,
            businesses!inner (
                id,
                name,
                organization_id
            ),
            users (
                full_name,
                email,
                avatar_url
            )
        `)
        .eq("businesses.organization_id", orgId);

    if (ownerError) console.error("Owner error:", ownerError);
    else console.log(`Found ${ownerViewMembers?.length} business members (Owner)`);
    
    ownerViewMembers?.forEach((m: any) => console.log(` - ${m.business_id} | ${m.role} | ${m.users?.email}`));
}

main().catch(console.error);
