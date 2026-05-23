/**
 * Splits src/services/google/sync-service.ts into focused modules.
 * Run once: node scripts/split-google-sync-service.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const srcPath = path.join(root, "src/services/google/sync-service.ts");
const outDir = path.join(root, "src/services/google/sync-service");

if (!fs.existsSync(srcPath)) {
  console.error("Missing", srcPath);
  process.exit(1);
}

const content = fs.readFileSync(srcPath, "utf8");
if (content.includes('export * from "./sync-service/index"')) {
  console.log("Already split — skipping");
  process.exit(0);
}

const lines = content.split("\n");
const slice = (start, end) => lines.slice(start - 1, end).join("\n");

fs.mkdirSync(outDir, { recursive: true });

const modules = [
  {
    file: "helpers.ts",
    body: `${slice(43, 63)}\n\n${slice(65, 117)}\n\n${slice(1234, 1236)}\n`,
    imports: `import { createAdminClient } from "@/lib/db/supabase/admin";
import type { Json } from "@/lib/db/supabase/database.types";
import type { GoogleReview } from "../business-profile";

export type SyncError = Error & { code?: "RATE_LIMIT" | "CONFLICT" };
export type AdminClient = ReturnType<typeof createAdminClient>;
export type ReviewPlatformRef = { id: string; business_id: string };
`,
  },
  {
    file: "review-lifecycle.ts",
    body: `${slice(119, 260)}\n`,
    imports: `import { createAdminClient } from "@/lib/db/supabase/admin";
import type { AdminClient } from "./helpers";
`,
  },
  {
    file: "locks.ts",
    body: `${slice(316, 367)}\n`,
    imports: `import { createAdminClient } from "@/lib/db/supabase/admin";
import {
  STALE_LOCK_TIMEOUT_MINUTES,
  SYNC_COOLDOWN_MS,
} from "../constants";
import { createSyncError, syncStateObject, type AdminClient } from "./helpers";
`,
  },
  {
    file: "pagination.ts",
    body: `${slice(369, 431)}\n`,
    imports: `import {
  listReviews,
  type GoogleReview,
} from "../business-profile";
import {
  MAX_REVIEW_PAGES,
  PAGINATION_DELAY_MS,
  REQUEST_SMOOTHING_DELAY_MS,
} from "../constants";
`,
  },
  {
    file: "tokens.ts",
    body: `${slice(433, 589)}\n`,
    imports: `import { createAdminClient } from "@/lib/db/supabase/admin";
import { refreshGoogleToken } from "../business-profile";
import { TOKEN_EXPIRY_BUFFER_MS } from "../constants";
import type { GooglePlatformWithTokens } from "@/types/google-sync";
import type { AdminClient } from "./helpers";
`,
  },
  {
    file: "types.ts",
    body: `${slice(597, 623)}\n`,
    imports: `import { SyncStateManager } from "@/services/google/sync-state-manager";
import type { GooglePlatformWithTokens } from "@/types/google-sync";
`,
  },
  {
    file: "list-reviews.ts",
    body: `${slice(625, 717)}\n`,
    imports: `import { listReviews } from "../business-profile";
import { SyncStateManager } from "@/services/google/sync-state-manager";
import type { GoogleSyncContext } from "./types";
`,
  },
  {
    file: "process-review.ts",
    body: `${slice(1238, 1336)}\n`,
    imports: `import type { GoogleReview } from "../business-profile";
import { computeReviewHash } from "@/utils/review-hash";
import {
  enqueueAutoReplyJob,
  reviewQualifiesForAutoReplyEnqueue,
  type AutoReplyBusinessSettings,
} from "@/services/reviews/auto-reply-eligibility";
import {
  isZyeneOriginatedReplySource,
  REVIEW_RESPONSE_SOURCE_GOOGLE,
} from "@/lib/reviews/response-source";
import {
  googleAttributeChips,
  googlePlaceContext,
  googleReviewPhotoUrls,
  reviewerAvatarFromGoogle,
  sameReviewReplyText,
  type AdminClient,
  type ReviewPlatformRef,
} from "./helpers";
`,
  },
  {
    file: "prepare-sync.ts",
    body: `${slice(719, 843)}\n`,
    imports: `import { createAdminClient } from "@/lib/db/supabase/admin";
import {
  listAccounts,
  listLocations,
  isGoogleUnauthorizedError,
} from "../business-profile";
import { registerNotificationsWithRetry } from "../notifications";
import { SyncStateManager } from "@/services/google/sync-state-manager";
import type { GooglePlatformWithTokens } from "@/types/google-sync";
import {
  clearGoogleSyncBootstrapHandoff,
  reconcileStaleGoogleSyncRun,
} from "@/services/google/sync-run-state";
import { acquireSyncLockOrThrow, enforceSyncCooldown } from "./locks";
import { forceRefreshGoogleAccessToken, getValidGoogleToken } from "./tokens";
import type { GoogleSyncContext } from "./types";
`,
  },
  {
    file: "sync-page.ts",
    body: `${slice(845, 1000)}\n`,
    imports: `import { createAdminClient } from "@/lib/db/supabase/admin";
import { computeReviewHash } from "@/utils/review-hash";
import { inngest } from "@/services/inngest/client";
import { AI_ANALYSIS_BATCH_SIZE } from "../constants";
import type { AutoReplyBusinessSettings } from "@/services/reviews/auto-reply-eligibility";
import { publishGoogleReviewSyncProgress } from "./review-lifecycle";
import { listReviewsWithOrderByFallback, syncStateManagerFromContext } from "./list-reviews";
import { processGoogleReview } from "./process-review";
import type { GoogleSyncContext } from "./types";
`,
  },
  {
    file: "finalize.ts",
    body: `${slice(1002, 1091)}\n`,
    imports: `import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { AI_ANALYSIS_BATCH_SIZE } from "../constants";
`,
  },
  {
    file: "bootstrap.ts",
    body: `${slice(262, 314)}\n`,
    imports: `import { createAdminClient } from "@/lib/db/supabase/admin";
import {
  clearGoogleSyncBootstrapHandoff,
  markGoogleSyncBootstrapHandoff,
  reconcileStaleGoogleSyncRun,
} from "@/services/google/sync-run-state";
import { publishGoogleReviewSyncProgress } from "./review-lifecycle";
import { finalizeGoogleSync, enqueueMissingGoogleReviewAnalysis } from "./finalize";
import { prepareGoogleSync } from "./prepare-sync";
import { syncGoogleReviewsPage } from "./sync-page";
import type { GoogleSyncContext } from "./types";
`,
  },
  {
    file: "sync-platform.ts",
    body: `${slice(1093, 1232)}\n`,
    imports: `import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import type { GooglePlatformWithTokens } from "@/types/google-sync";
import {
  clearGoogleSyncBootstrapHandoff,
  markGoogleSyncBootstrapHandoff,
} from "@/services/google/sync-run-state";
import { clearForceFullSyncFlag, syncStateObject, type AdminClient } from "./helpers";
import { hideGoogleReviewsRemovedFromSource } from "./review-lifecycle";
import { extendSyncLockTtl } from "./locks";
import { fetchGoogleReviewsPaginated } from "./pagination";
import { finalizeGoogleSync, enqueueMissingGoogleReviewAnalysis } from "./finalize";
import { prepareGoogleSync } from "./prepare-sync";
import { syncGoogleReviewsPage } from "./sync-page";
import { processGoogleReview } from "./process-review";
import type { SyncResult } from "./types";
`,
  },
];

for (const mod of modules) {
  const fileContent = `/** Google review sync — ${mod.file.replace(".ts", "")} */\n\n${mod.imports}\n${mod.body}\n`;
  fs.writeFileSync(path.join(outDir, mod.file), fileContent);
}

// Export extendSyncLockTtl from locks (used by sync-platform) — add to locks body already includes it

const index = `/** Google review sync — public API barrel. */

export { isGoogleSyncConflictError } from "../sync-lock-utils";

export type { SyncResult, GoogleSyncContext } from "./types";

export {
  hideGoogleReviewsRemovedFromSource,
  reattachOrphanedGoogleReviews,
  refreshGoogleReviewRollupsFromDb,
  publishGoogleReviewSyncProgress,
} from "./review-lifecycle";

export {
  readGoogleReviewSyncResumeCursor,
  acquireSyncLockOrThrow,
  enforceSyncCooldown,
} from "./locks";

export {
  getValidGoogleToken,
  forceRefreshGoogleAccessToken,
} from "./tokens";

export { bootstrapGoogleReviewsForPlatform } from "./bootstrap";

export { prepareGoogleSync } from "./prepare-sync";
export { syncGoogleReviewsPage } from "./sync-page";
export { finalizeGoogleSync, enqueueMissingGoogleReviewAnalysis } from "./finalize";
export { syncGoogleReviewsForPlatform } from "./sync-platform";
export { processGoogleReview } from "./process-review";
`;

fs.writeFileSync(path.join(outDir, "index.ts"), index);

const barrel = `/** Re-exports split Google sync service. */\nexport * from "./sync-service/index";\n`;
fs.writeFileSync(srcPath, barrel);

console.log("Split sync-service.ts into", outDir);
