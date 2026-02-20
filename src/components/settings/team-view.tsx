"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamTable } from "./team-table"
import { Building2, Store, Users } from "lucide-react"

interface TeamViewProps {
    orgMembers: any[];
    businessGroups: Record<string, { name: string; members: any[] }>;
    currentUserId: string;
    currentUserRole: string;
    orgName: string;
}

export function TeamView({ 
    orgMembers, 
    businessGroups, 
    currentUserId, 
    currentUserRole,
    orgName
}: TeamViewProps) {
    const businessIds = Object.keys(businessGroups);
    const defaultValue = "all";

    // Combine all members for "All" tab
    const allMembers = [
        ...orgMembers.map(m => ({ ...m, business_name: orgName + " (HQ)" })), 
        ...businessIds.flatMap(bId => businessGroups[bId].members)
    ];

    return (
        <Tabs defaultValue={defaultValue} className="w-full">
            <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0">
                <TabsTrigger 
                    value="all"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border"
                >
                    <Users className="mr-2 h-4 w-4" />
                    All Members
                </TabsTrigger>
                <TabsTrigger 
                    value="organization"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border"
                >
                    <Building2 className="mr-2 h-4 w-4" />
                    {orgName} (HQ)
                </TabsTrigger>
                {businessIds.map(bId => (
                    <TabsTrigger 
                        key={bId} 
                        value={bId}
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border"
                    >
                        <Store className="mr-2 h-4 w-4" />
                        {businessGroups[bId].name}
                    </TabsTrigger>
                ))}
            </TabsList>

            <div className="mt-6">
                <TabsContent value="all" className="mt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Team Members</CardTitle>
                            <CardDescription>
                                Overview of all staff across {orgName} and its locations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeamTable 
                                members={allMembers} 
                                currentUserId={currentUserId} 
                                currentUserRole={currentUserRole} 
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="organization" className="mt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>{orgName} (Headquarters)</CardTitle>
                            <CardDescription>
                                Staff with access to the entire organization and all businesses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeamTable 
                                members={orgMembers} 
                                currentUserId={currentUserId} 
                                currentUserRole={currentUserRole} 
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {businessIds.map(bId => (
                    <TabsContent key={bId} value={bId} className="mt-0">
                         <Card>
                            <CardHeader>
                                <CardTitle>{businessGroups[bId].name} Team</CardTitle>
                                <CardDescription>
                                    Staff with access only to {businessGroups[bId].name}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TeamTable 
                                    members={businessGroups[bId].members} 
                                    currentUserId={currentUserId} 
                                    currentUserRole={currentUserRole} 
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </div>
        </Tabs>
    )
}

