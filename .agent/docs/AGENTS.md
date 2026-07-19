# Next.js docs index (optional)

Project agent standards live in the root [`AGENTS.md`](../../AGENTS.md).

This file previously indexed a local Next.js docs mirror under `.next-docs/` (from `npx @next/codemod agents-md`). That mirror was removed as regenerable local cache (~3MB+).

## If you want the local mirror again

```bash
npx @next/codemod agents-md --output .agent/docs/AGENTS.md
```

That regenerates `.next-docs/` and rewrites this file’s index block. Prefer https://nextjs.org/docs for day-to-day work unless you need offline, version-pinned App Router pages.
