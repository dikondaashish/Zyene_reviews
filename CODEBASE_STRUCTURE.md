# Codebase Structure

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
- `_archive`: non-runtime artifacts and historical docs

## Placement rules

1. Put framework routes only under `src/app`.
2. Put external API/provider logic under `src/services`.
3. Keep domain business logic and helpers under `src/lib`.
4. Keep primitive design-system components under `src/components/ui`.
5. Keep feature-specific components in their feature folders.
6. Keep global/shared types in `src/types`.
7. Keep static constants in `src/constants`.
8. Keep historical docs out of root in `_archive/docs`.

## Notes

- `src/proxy.ts` is the request interception entrypoint (Next.js proxy convention).
- Root config files remain in repository root by design.
