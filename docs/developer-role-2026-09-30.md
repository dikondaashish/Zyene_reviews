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

## Default support access — October 1, 2026

Applied forward migration `20261001151611_default_business_developer.sql`:
- Pin the verified `karthik.reddy@zyene.com` auth identity in a private table.
- Add labelled Developer memberships to existing businesses and new businesses.
  An owner-insertion trigger also covers OAuth's business-before-owner order.
- Keep owner-only removal organization-scoped. A private opt-out record prevents
  new businesses or later owner updates from restoring removed developer access.
- Preserve suspended memberships and existing customer ownership. Serialize
  provisioning and the deletion RPC using the organization row.
- Keep support developers visible on the team page while excluding them from
  paid customer seats and invitation limits.

The private tables use RLS with no customer policies or grants. Provisioning
functions have no public, authenticated, anonymous, or service-role EXECUTE
grant. Nested triggers can insert only the configured, labelled support account;
direct authenticated designation and existing role restrictions remain guarded.

Verification: default-access database assertions failed before implementation,
then passed in disposable PostgreSQL with all 20 security migrations. Tests cover
existing/new businesses, both registration orders, protected designations,
owner removal, manager/developer/foreign-owner denial, durable opt-out and
suspended access. All 1,831 Vitest tests, fast checks, and the production build
passed. Live preflight found 19 businesses, two developer organizations,
one verified support identity, and no historical developer removal events.

Production status: after explicit browser-policy confirmation, applied the
tested migration transactionally through the authenticated Supabase dashboard
and recorded version `20261001151611` in its migration ledger. The staged body
matched the tested local SQL (13,394 characters, FNV-1a `73b4ba65`). Live results
confirmed 19 businesses and 19 active Developer business memberships. Customer
owner memberships were preserved. The connected MCP account lacks project access.
The accompanying customer-seat counting changes are ready for GitHub deployment.

Recovery: disable the two provisioning triggers to stop future default grants.
Existing grants can be revoked by customer owners through Delete Developer;
preserve opt-out records when disabling or changing the default account.
