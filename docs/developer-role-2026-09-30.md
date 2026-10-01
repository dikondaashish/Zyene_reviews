# Developer designation and owner-only removal

Developer uses the existing `owner` / `ORG_OWNER` authorization tier, with
`role_label = 'developer'` on organization and business memberships. This keeps
existing owner capabilities. It is not a separate permission enum.

Karthik's existing active memberships were updated in Supabase project
`snielpllhrppdqzkzjwf`: two organizations and two businesses. No new organization
membership was created. No membership was removed during implementation.

The team screen displays Developer and shows Delete Developer only when the
actor is an active organization owner without the developer designation.
Removal requires confirmation and removes the target's organization membership
and all business memberships in that organization. Other organizations remain.

The authenticated `delete_organization_developer` RPC locks organization
memberships, checks the live actor and target, scopes the business/member pair,
and performs deletion and audit insertion atomically. Direct database writes
cannot clear or downgrade the developer designation to bypass the restriction.
Privileged backend management retains the ability to maintain designations.

Applied migrations:
- `20261001020939_developer_owner_role_label.sql`
- `20261001022325_owner_delete_developer.sql`

Verification: 13 focused Vitest tests passed; the disposable PostgreSQL harness
passed all 19 migrations and its authorization assertions, including developer
removal, foreign-tenant preservation, self-removal denial, and label protection.
Fast checks and the production build passed. React Doctor reported no issues.
Tests were added after the initial implementation; no red-before-green claim.

Database changes are live. Application changes remain local and require a
GitHub push / Vercel deployment before the new badge and action appear publicly.
