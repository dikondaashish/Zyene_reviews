import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import { config as loadEnv } from "dotenv";

type CheckResult = {
  name: string;
  passed: boolean;
  detail: string;
};

const REQUIRED_FILES = [
  "src/lib/auth/business-context.ts",
  "src/components/dashboard/business-switcher.tsx",
  "src/app/(dashboard)/settings/integrations/page.tsx",
  "src/app/(dashboard)/settings/team/page.tsx",
  "src/app/api/team/invite/route.ts",
  "src/app/api/team/[id]/route.ts",
  "src/app/api/team/accept-invite/route.ts",
  "src/app/api/auth/callback/route.ts",
  "src/app/actions/onboarding.ts",
];

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_ROOT_DOMAIN",
];

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function checkFiles(): Promise<CheckResult> {
  const missing: string[] = [];
  for (const file of REQUIRED_FILES) {
    if (!(await fileExists(file))) {
      missing.push(file);
    }
  }

  return {
    name: "Critical architecture files",
    passed: missing.length === 0,
    detail: missing.length === 0 ? "All required files exist." : `Missing: ${missing.join(", ")}`,
  };
}

function checkEnv(): CheckResult {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  return {
    name: "Required environment variables",
    passed: missing.length === 0,
    detail: missing.length === 0
      ? "All required environment variables are present."
      : `Missing: ${missing.join(", ")}`,
  };
}

function runCommand(command: string, args: string[]): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";

    child.stdout.on("data", (chunk) => {
      output += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += String(chunk);
    });

    child.on("close", (code) => {
      resolve({ code: code ?? 1, output: output.trim() });
    });
  });
}

async function checkTypeSafety(): Promise<CheckResult> {
  const { code, output } = await runCommand("pnpm", ["exec", "tsc", "--noEmit"]);
  return {
    name: "Type safety (tsc --noEmit)",
    passed: code === 0,
    detail: code === 0 ? "Typecheck passed." : output || "Typecheck failed.",
  };
}

async function checkBuildHealth(): Promise<CheckResult> {
  const { code, output } = await runCommand("pnpm", ["build"]);
  return {
    name: "Build health (next build)",
    passed: code === 0,
    detail: code === 0 ? "Build succeeded." : output || "Build failed.",
  };
}

function printResults(results: CheckResult[]) {
  console.log("\n=== Zyene Critical Flow Verification ===\n");
  for (const result of results) {
    const status = result.passed ? "PASS" : "FAIL";
    console.log(`[${status}] ${result.name}`);
    console.log(`       ${result.detail}`);
  }

  const failed = results.filter((r) => !r.passed);
  console.log("\n=== Manual Flow Checklist (Run in Browser) ===");
  console.log("1. Signup/Login and land on dashboard.");
  console.log("2. Add business from /businesses/add and confirm business appears in header switcher.");
  console.log("3. Switch business in header and verify /integrations updates context.");
  console.log("4. Open /settings/team and verify members/invites are business-scoped.");
  console.log("5. Invite user, accept invite via login/password, confirm business_members row effect in UI.");
  console.log("6. Open /settings/billing and verify plan limits + current usage show correctly.");

  if (failed.length > 0) {
    console.log(`\nVerification finished with ${failed.length} failure(s).`);
    process.exit(1);
  }

  console.log("\nVerification finished successfully.");
}

async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv();

  const results: CheckResult[] = [];
  results.push(checkEnv());
  results.push(await checkFiles());
  results.push(await checkTypeSafety());
  results.push(await checkBuildHealth());
  printResults(results);
}

void main();
