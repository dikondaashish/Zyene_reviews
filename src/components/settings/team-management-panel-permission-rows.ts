export const TEAM_PERMISSION_ROWS = [
    { action: "Invite members", owner: true, admin: true, manager: true, member: false, viewer: false },
    { action: "Remove members", owner: true, admin: true, manager: false, member: false, viewer: false },
    { action: "Change roles", owner: true, admin: true, manager: false, member: false, viewer: false },
    { action: "Edit business settings", owner: true, admin: true, manager: false, member: false, viewer: false },
    { action: "Manage menus & orders", owner: true, admin: true, manager: true, member: true, viewer: false },
    { action: "View reports", owner: true, admin: true, manager: true, member: true, viewer: true },
    { action: "Export data", owner: true, admin: true, manager: true, member: false, viewer: false },
    { action: "Billing & plan", owner: true, admin: false, manager: false, member: false, viewer: false },
    { action: "Delete business", owner: true, admin: false, manager: false, member: false, viewer: false },
] as const;
