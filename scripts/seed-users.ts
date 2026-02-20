import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Seeding 'Novotel' scenario...");

  // 1. Get or Create Organization "Novotel Hotels"
  let orgId: string;
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", "novotel-hotels")
    .single();

  if (org) {
      orgId = org.id;
      console.log(`Using existing 'Novotel Hotels' org: ${orgId}`);
  } else {
      const { data: newOrg, error: createOrgError } = await supabase
          .from("organizations")
          .insert({ 
              name: "Novotel Hotels", 
              slug: "novotel-hotels",
              type: "business" // or agency if applicable, but usually business for a chain
          })
          .select()
          .single();
      
      if (createOrgError) {
          console.error("Error creating org:", createOrgError);
          return;
      }
      orgId = newOrg.id;
      console.log(`Created 'Novotel Hotels' org: ${orgId}`);
  }

  // 2. Create Branches (Novotel New York & Novotel London)
  const branches = [
      { name: "Novotel New York", slug: "novotel-ny", timezone: "America/New_York" },
      { name: "Novotel London", slug: "novotel-london", timezone: "Europe/London" }
  ];

  const branchIds: Record<string, string> = {};

  for (const branch of branches) {
      let bId: string;
      const { data: existingBus } = await supabase
          .from("businesses")
          .select("id")
          .eq("organization_id", orgId)
          .eq("slug", branch.slug)
          .single();
      
      if (existingBus) {
          bId = existingBus.id;
          console.log(`Using existing branch '${branch.name}': ${bId}`);
      } else {
           const { data: newBus, error: createBusError } = await supabase
              .from("businesses")
              .insert({ 
                  organization_id: orgId, 
                  name: branch.name, 
                  slug: branch.slug,
                  timezone: branch.timezone
              })
              .select()
              .single();
            
            if (createBusError) {
                console.error(`Error creating branch ${branch.name}:`, createBusError);
                continue;
            }
            bId = newBus.id;
            console.log(`Created branch '${branch.name}': ${bId}`);
      }
      branchIds[branch.slug] = bId;

      // Bypass Onboarding for this branch
      const { error: platformError } = await supabase
        .from("review_platforms")
        .upsert({
            business_id: bId,
            platform: "google",
            external_id: `dummy_google_${branch.slug}`,
            sync_status: "active",
            total_reviews: Math.floor(Math.random() * 500) + 50,
            average_rating: (4.0 + Math.random()).toFixed(1)
        }, { onConflict: "business_id, platform" });
        
        if (!platformError) console.log(`  - Linked Dummy Google Profile`);
  }


  // 3. Define Users
  const usersToCreate = [
    // Org Level
    { email: "novotel.owner@example.com", password: "password123", role: "ORG_OWNER", name: "Pierre (Global Owner)", scope: "org" },
    { email: "region.manager@example.com", password: "password123", role: "ORG_MANAGER", name: "Sarah (Regional Manager)", scope: "org" },
    
    // NY Branch
    { email: "ny.manager@example.com", password: "password123", role: "STORE_MANAGER", name: "John (NY Manager)", scope: "store", branchSlug: "novotel-ny" },
    { email: "ny.staff@example.com", password: "password123", role: "STORE_EMPLOYEE", name: "Mike (NY Staff)", scope: "store", branchSlug: "novotel-ny" },

    // London Branch
    { email: "london.manager@example.com", password: "password123", role: "STORE_MANAGER", name: "Emma (London Manager)", scope: "store", branchSlug: "novotel-london" },
  ];

  for (const user of usersToCreate) {
    console.log(`Processing ${user.email}...`);

    let userId;

    // Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.name },
    });

    if (authError) {
      // Fetch existing if create fail
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingUser = usersData.users.find(u => u.email === user.email);
      if (existingUser) {
          userId = existingUser.id;
      } else {
          console.error(`  - Failed to find or create user ${user.email}`);
          continue;
      }
    } else {
        userId = authData.user.id;
    }
    
    // Ensure public.users record exists
    await supabase.from("users").upsert({ 
        id: userId, 
        email: user.email,
        full_name: user.name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name.replace(/ /g, '')}`
    });

    // Assign Role
    if (user.scope === "store" && user.branchSlug) {
        const busId = branchIds[user.branchSlug];
        if (!busId) continue;

        const { error: memberError } = await supabase
            .from("business_members")
            .upsert({
                business_id: busId,
                user_id: userId,
                role: user.role,
                status: 'active'
            }, { onConflict: 'business_id, user_id' });
        
        if (memberError) console.error(`  - Error assigning store role:`, memberError);
        else console.log(`  - Assigned ${user.role} @ ${user.branchSlug}`);

    } else {
        // Organization Member
        const { error: memberError } = await supabase
            .from("organization_members")
            .upsert({
                organization_id: orgId,
                user_id: userId,
                role: user.role,
                status: 'active'
            }, { onConflict: 'organization_id, user_id' });

         if (memberError) console.error(`  - Error assigning org role:`, memberError);
         else console.log(`  - Assigned ${user.role} to Org`);
    }
  }

  console.log("\n--- Credentials (Password: password123) ---");
  usersToCreate.forEach(u => {
      console.log(`${u.email}  ->  ${u.role} ${u.branchSlug ? `(${u.branchSlug})` : '(Global)'}`);
  });
}

main().catch(console.error);
