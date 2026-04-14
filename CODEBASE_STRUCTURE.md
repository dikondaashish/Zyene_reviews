# Codebase Structure

> Doc classification: contributor architecture guide. See `docs/INDEX.md` for full documentation map.

## Top-level layout

- `src/app`: Next.js App Router pages, layouts, and API routes
- `src/components`: UI + feature components
- `src/services`: External provider and integration clients (Google, Stripe, Twilio, etc.)
- `src/lib`: Internal app logic (db access wrappers, auth helpers, state, validation, utilities)
- `src/hooks`: Reusable React hooks
- `src/types`: Shared TypeScript types
- `src/constants`: App-wide static constants
- `public`: Static assets
- `supabase/migrations`: Database migrations
- `tests/unit`, `tests/integration`: automated tests
- `docs`: verification guides, audits, and generated documentation artifacts
- `.agent/docs`: agent-runtime/internal implementation notes

## Placement rules

1. Put framework routes only under `src/app`.
2. Put external API/provider logic under `src/services`.
3. Keep domain business logic and helpers under `src/lib`.
4. Keep primitive design-system components under `src/components/ui`.
5. Keep feature-specific components in their feature folders.
6. Keep global/shared types in `src/types`.
7. Keep static constants in `src/constants`.
8. Keep generated audits and verification docs under `docs/`.
9. Keep agent-specific/internal notes under `.agent/docs`.

## Notes

- `src/proxy.ts` is the request interception entrypoint (Next.js proxy convention).
- Root config files remain in repository root by design.
