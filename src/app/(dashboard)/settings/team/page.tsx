
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeamView } from "@/components/settings/team-view";
import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";
import { Separator } from "@/components/ui/separator";

export default async function TeamSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch current user details to check permissions
    const { data: currentUserMember } = await supabase
        .from("organization_members")
        .select(`
            role, 
            organization_id,
            organizations ( name )
        `)
        .eq("user_id", user.id)
        .single();

    if (!currentUserMember) {
        return <div>No organization found.</div>;
    }

    const orgId = currentUserMember.organization_id;

    // Fetch Org Members
    const { data: orgMembers } = await supabase
        .from("organization_members")
        .select(`
            id,
            role,
            status,
            created_at,
            user_id,
            users (
                full_name,
                email,
                avatar_url
            )
        `)
        .eq("organization_id", orgId);

    // Fetch Store Members (business_members)
    // We need to fetch businesses first or join through them?
    // Using simple query: select where business_id in (select id from businesses where org_id = ...)
    // But we want business name too.
    const { data: storeMembers } = await supabase
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

    // Fetch pending invites
    const { data: invites } = await supabase
        .from("invitations")
        .select(`*, businesses(name)`)
        .eq("organization_id", orgId);

    console.log("TeamPage: OrgID", orgId);
    console.log("TeamPage: OrgMembers", orgMembers?.length, orgMembers?.map(m => m.role));
    console.log("TeamPage: StoreMembers", storeMembers?.length, storeMembers?.map(m => m.role));
    console.log("TeamPage: StoreMembers Data", JSON.stringify(storeMembers, null, 2));

    // Group store members by business
    const businessGroups: Record<string, { name: string; members: any[] }> = {};
    
    storeMembers?.forEach((m: any) => {
        const bId = m.business_id;
        const bName = m.businesses?.name || "Unknown Business";
        
        if (!businessGroups[bId]) {
            businessGroups[bId] = { name: bName, members: [] };
        }
        
        businessGroups[bId].members.push({
            id: m.id,
            role: m.role,
            type: "member",
            scope: "store",
            user: m.users,
            status: m.status || "active",
            business_name: bName,
        });
    });

    // Add invites to groups
    invites?.forEach((i: any) => {
        if (i.business_id) {
             const bId = i.business_id;
             const bName = i.businesses?.name || "Unknown Business";
             
             if (!businessGroups[bId]) {
                businessGroups[bId] = { name: bName, members: [] };
            }

            businessGroups[bId].members.push({
                id: i.id,
                role: i.role,
                type: "invite",
                scope: "store",
                email: i.email,
                status: "invited",
                business_name: bName,
            });
        }
    });

    // Prepare Org Members (including invites without business_id)
    const processedOrgMembers = [
        ...(orgMembers || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            type: "member" as const,
            scope: "org" as const,
            user: m.users,
            status: m.status || "active",
        })),
        ...(invites || []).filter((i: any) => !i.business_id).map((i: any) => ({
             id: i.id,
            role: i.role,
            type: "invite" as const,
            scope: "org" as const,
            email: i.email,
            status: "invited" as const,
        }))
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Team Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your team members and their roles across the organization.
                    </p>
                </div>
                {!["ORG_EMPLOYEE", "STORE_EMPLOYEE"].includes(currentUserMember.role) && (
                    <InviteMemberDialog />
                )}
            </div>
            <Separator />

            <TeamView 
                orgMembers={processedOrgMembers}
                businessGroups={businessGroups}
                currentUserId={user.id}
                currentUserRole={currentUserMember.role}
                orgName={(currentUserMember as any).organizations?.name || (Array.isArray((currentUserMember as any).organizations) ? (currentUserMember as any).organizations[0]?.name : "Organization")}
            />
        </div>
    );
}
