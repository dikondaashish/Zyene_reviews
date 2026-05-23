# Database migrations

SQL migrations for Zyene Reviews Postgres (Supabase). Applied in **lexicographic filename order**—the timestamp or numeric prefix is the version key recorded in `supabase_migrations.schema_migrations`.

## How migrations run

1. **Local:** `supabase db reset` replays all files from scratch. `supabase migration up` applies only pending versions.
2. **Remote:** `supabase db push` (or CI) applies pending files in sorted order; each filename is applied at most once.
3. **Order matters.** Never change the relative order of existing files. A migration that depends on a table must have a **later** filename than the migration that creates it.

Check what production has already applied:

```bash
supabase migration list
```

## Legacy `001`–`014` block

Early migrations use a numeric prefix (`001_initial_schema.sql`, `004_a_add_api_platform.sql`, …) instead of `YYYYMMDDHHMMSS`. They run **before** any `2026…` file because `0` sorts before `2`.

- **`001_initial_schema.sql`** — Full bootstrap: core tables, RLS, indexes, `get_user_org_ids()`.
- **`002`–`014`** — Incremental product changes (campaigns, public review flow, footer branding, etc.).
- **Suffix letters** (`004_a`, `004_b`, `009_a`, `009_b`) — Paired follow-ups that had to land after their parent number without renumbering the chain.

Do not rename these files on environments where they have already been applied.

## Naming standard for new migrations

Create new files only as:

```text
YYYYMMDDHHMMSS_short_description.sql
```

Rules:

- **Lowercase** with **underscores** (no spaces, no camelCase).
- **14-digit UTC timestamp** so sort order matches intent (use `date +%Y%m%d%H%M%S` or Supabase CLI `supabase migration new <name>`).
- **Description** should state the change: `add_`, `fix_`, `backfill_`, `enable_rls_`, not vague names like `updates.sql`.

Example: `20260523140000_phase7_plg_referrals.sql`

Avoid date-only prefixes (`20260312_…`) without a time component—they sort unpredictably among same-day migrations.

## OAuth encryption cluster (April 2026)

Several migrations around `20260405164000`–`20260405164500` implement OAuth token encryption. They were added iteratively; **do not merge or delete them** if production has run them.

| File | Role |
|------|------|
| `20260405164000_add_encrypted_columns.sql` | Encrypted columns + `encrypt_token` / `decrypt_token` |
| `20260405164000_oauth_encryption_consolidated.sql` | Vault table, alternate column names, inline backfill/rename |
| `20260405164200_backfill_encrypted_tokens.sql` | Batch backfill helper |
| `20260405164400_finalize_token_encryption.sql` | Drop plaintext, rename encrypted → `access_token` |
| `20260405164500_vault_setup.sql` | Harden `internal` schema grants |

**Warning:** Two files in this cluster historically embedded encryption key material in SQL. See repo security notes / `# Security` in the root README. New work must not commit secrets—use Supabase Vault or runtime configuration.

On a **fresh** database, both `20260405164000_*` files share the same timestamp prefix; PostgreSQL runs them in **alphabetical** order (`add_encrypted_columns` before `oauth_encryption_consolidated`).

## Golden rules

1. **Never edit** a migration that has already been applied to production (including comment-only edits on shared branches if your team treats that as immutable—prefer new files for clarity).
2. **Never delete** or **reorder** applied migrations.
3. **Never merge** two applied migrations into one file.
4. **Fix forward:** schema bugs, missing indexes, and policy fixes belong in a **new** migration with a new timestamp.
5. Prefer **idempotent** patterns where safe: `IF NOT EXISTS`, `DROP … IF EXISTS` before `ADD CONSTRAINT`, `CREATE OR REPLACE` for functions.
6. Put a **2–4 line header comment** at the top of each file explaining what it does and any important caveats.

## Related commands

```bash
supabase migration new my_change_name   # creates timestamped stub
supabase db lint                        # optional SQL checks
pnpm typecheck                          # app types (database.types.ts is generated separately)
```
