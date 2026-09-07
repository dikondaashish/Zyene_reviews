# Public / Internal Module API

Zyene Reviews is an **application**, not an npm library. There is no published package API for external consumers beyond the HTTP API in [API.md](./API.md).

This document describes **stable internal modules** that feature code and AI agents should prefer reusing instead of reinventing.

---

## 1. External HTTP “public API”

For Zapier and customer integrations:

- Base path: `/api/v1/*`
- Auth: `X-API-Key`
- Scopes: `src/lib/api-keys/scopes.ts`
- Docs UI: `/docs/api`

See [API.md](./API.md) §1.

---

## 2. Configuration

```ts
import { NEXT_PUBLIC_APP_URL, /* … */ } from "@/config/env";
```

Prefer `@/config/env` helpers over scattered `process.env` reads. Details: [CONFIGURATION.md](./CONFIGURATION.md).

---

## 3. Auth & business context

```ts
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
const { businessId, business, organization } = await getActiveBusinessId();
```

| Export area | Path | Use |
|-------------|------|-----|
| `getActiveBusinessId` | `@/lib/auth/business-context` | Resolve active location |
| Settings access helpers | `@/lib/auth/settings-access` | Gate settings UI/actions |
| Rate limit helpers | `@/lib/auth/rate-limit` | Auth-adjacent throttles |
| API key auth | `@/lib/api-keys/authenticate` | `/api/v1` and key management |

**Do not** authorize with `getSession()` alone.

---

## 4. Database clients

| Client | Import | When |
|--------|--------|------|
| User-scoped | `@/lib/db/supabase/server` `createClient` | Default — RLS applies |
| Service role | `@/lib/db/supabase/admin` `createAdminClient` | After explicit authz (webhooks, admin jobs, API key paths) |
| Browser | `@/lib/db/supabase/client` (if present) | Client components only |

---

## 5. Review requests

```ts
import { sendOutboundReviewRequest } from "@/lib/review-requests/send-outbound";

await sendOutboundReviewRequest({
  businessId,
  channel: "sms",
  customerName,
  customerPhone,
  customerEmail,
  triggerSource: "zapier", // or campaign/manual/etc.
});
```

Shared by dashboard, cron, and `/api/v1/requests/send`. Prefer this over calling Twilio/Resend directly from routes.

---

## 6. Logging

```ts
import { logger } from "@/lib/logger"; // Pino — server only
```

Never add `console.log` to client components.

---

## 7. Validations

Shared Zod schemas live under `@/lib/validations` (and feature folders). API routes should validate at the edge; reuse schemas when the same shape appears in Server Actions.

---

## 8. UI primitives

- Import shadcn wrappers from `@/components/ui/*`.
- Do not edit generated primitives by hand — regenerate via shadcn CLI.
- Feature UI: `@/components/<feature>/…`.

---

## 9. SEO helpers

Marketing pages should use helpers under `@/components/seo/` and `@/lib/seo/` for metadata patterns and JSON-LD. Follow `.cursor/rules/seo.mdc`.

---

## 10. Example: thin API route shape

```ts
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";

const bodySchema = z.object({ /* … */ });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { businessId } = await getActiveBusinessId();
  if (!businessId) return NextResponse.json({ success: false, error: "No business" }, { status: 400 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  // call src/lib/* then return { success: true, data }
}
```

---

## Not applicable

- **Semver’d npm exports** — N/A (private app).
- **GraphQL schema** — N/A.
- **gRPC / protobuf public API** — N/A.
