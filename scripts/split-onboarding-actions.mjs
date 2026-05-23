/**
 * One-off: splits src/app/actions/onboarding.ts into domain modules.
 * Run: node scripts/split-onboarding-actions.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const srcPath = path.join(root, "src/app/actions/onboarding.ts");
const outDir = path.join(root, "src/app/actions/onboarding");
const content = fs.readFileSync(srcPath, "utf8");
const lines = content.split("\n");

function slice(start, end) {
  return lines.slice(start - 1, end).join("\n");
}

const header = `"use server";\n`;

const typesBlock = slice(41, 120);

const sections = [
  {
    file: "types.ts",
    body: `/** Onboarding server-action shared types and Google post-connect sync helpers. */\n\n${typesBlock}\n`,
    useServer: false,
    imports: `import { revalidatePath } from "next/cache";
import {
  bootstrapGoogleReviewsForPlatform,
  syncGoogleReviewsForPlatform,
} from "@/services/google/sync-service";
import { isGoogleSyncConflictError } from "@/services/google/sync-lock-utils";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import { syncGooglePhase2ForPlatform } from "@/services/google/phase2-sync";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { syncGoogleLodgingForPlatform } from "@/services/google/phase4-sync";
import { inngest } from "@/services/inngest/client";

export type { GoogleBusinessLocation };
`,
  },
  {
    file: "business-legacy.ts",
    body: `${slice(122, 206)}\n`,
    imports: `import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { step1FormSchema, type Step1FormData } from "@/lib/validations/onboarding";
`,
  },
  {
    file: "google-oauth.ts",
    body: `${slice(214, 615)}\n`,
    imports: `import { headers } from "next/headers";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { registerNotificationsWithRetry } from "@/services/google/notifications";
import { parseGoogleLocationResourceIds } from "@/services/google/business-profile";
import { enqueueGooglePostConnectSync } from "./types";
import type { GoogleBusinessLocation } from "./types";
`,
  },
  {
    file: "flow.ts",
    body: `${slice(617, 923)}\n`,
    imports: `import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import {
  step3FormSchema,
  step4FormSchema,
  type Step3FormData,
  type Step4FormData,
} from "@/lib/validations/onboarding";
`,
  },
  {
    file: "organization.ts",
    body: `${slice(933, 1096)}\n`,
    imports: `import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/db/redis";
import { stepOrganizationSchema, type StepOrganizationFormData } from "@/lib/validations/onboarding";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
`,
  },
  {
    file: "business.ts",
    body: `${slice(1101, 1329)}\n`,
    imports: `import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/db/redis";
import {
  stepBusinessLocationSchema,
  stepCategorySchema,
  type StepBusinessLocationFormData,
  type StepCategoryFormData,
} from "@/lib/validations/onboarding";
`,
  },
  {
    file: "notifications.ts",
    body: `${slice(1335, 1430)}\n`,
    imports: `import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { stepNotificationsSchema, type StepNotificationsFormData } from "@/lib/validations/onboarding";
`,
  },
  {
    file: "google-sync.ts",
    body: `${slice(1437, 1467)}\n`,
    imports: `import { createClient } from "@/lib/db/supabase/server";
import { enqueueGooglePostConnectSync } from "./types";
`,
  },
  {
    file: "billing.ts",
    body: `${slice(1473, 1641)}\n`,
    imports: `import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { stepPlanSchema, type StepPlanFormData } from "@/lib/validations/onboarding";
import { stripe } from "@/services/stripe/client";
import { PLAN_MAP, UNSUBSCRIBED_LIMITS } from "@/services/stripe/plans";
`,
  },
];

fs.mkdirSync(outDir, { recursive: true });

for (const section of sections) {
  const prefix = section.useServer === false ? "" : header;
  const imports = section.imports ?? "";
  const fileContent = section.useServer === false
    ? `${imports}\n${section.body}`
    : `${prefix}${imports}\n${section.body}`;
  fs.writeFileSync(path.join(outDir, section.file), fileContent);
}

const indexExports = [
  "business-legacy",
  "google-oauth",
  "flow",
  "organization",
  "business",
  "notifications",
  "google-sync",
  "billing",
]
  .map((m) => `export * from "./${m}";`)
  .join("\n");

fs.writeFileSync(
  path.join(outDir, "index.ts"),
  `/** Onboarding server actions — barrel re-export. */\n\n${indexExports}\n`
);

const barrel =
  "/** Re-exports split onboarding server actions. */\nexport * from \"./onboarding/index\";\n";
fs.writeFileSync(srcPath, barrel);

console.log("Split onboarding.ts into", outDir);
