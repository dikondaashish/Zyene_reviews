import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");

const DYNAMIC_IMPORTS = {
  "src/app/(marketing)/blog/[slug]/page.tsx": `import type { Metadata } from "next";
import { BLOG_POST_MAP, BLOG_SLUGS } from "@/lib/phase4/blog-data";`,
  "src/app/(marketing)/case-studies/[slug]/page.tsx": `import type { Metadata } from "next";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";`,
  "src/app/(marketing)/compare/[competitor]/page.tsx": `import type { Metadata } from "next";
import { COMPETITOR_MAP, COMPETITOR_SLUGS } from "@/lib/phase3/competitor-data";`,
  "src/app/(marketing)/industries/[industry]/page.tsx": `import type { Metadata } from "next";
import { INDUSTRY_MAP, INDUSTRY_SLUGS } from "@/lib/phase3/industry-data";`,
  "src/app/(marketing)/es/industries/[industry]/page.tsx": `import type { Metadata } from "next";
import {
    ES_INDUSTRY_LOCALIZED_SLUGS,
    getLocalizedIndustry,
} from "@/lib/phase8/localized-industries";`,
  "src/app/(marketing)/resources/[guide]/page.tsx": `import type { Metadata } from "next";
import { RESOURCE_MAP, RESOURCE_SLUGS } from "@/lib/phase4/resource-data";`,
};

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name === "page.tsx") out.push(p);
  }
  return out;
}

for (const [rel, header] of Object.entries(DYNAMIC_IMPORTS)) {
  const file = path.join(ROOT, rel);
  const body = fs.readFileSync(file, "utf8");
  if (!body.startsWith("import ")) {
    fs.writeFileSync(file, `${header}\n\n${body}`);
    console.log("fixed dynamic", rel);
  }
}

const metadataImport = `import type { Metadata } from "next";\n\n`;

for (const file of walk(path.join(ROOT, "src/app"))) {
  const rel = path.relative(ROOT, file);
  if (DYNAMIC_IMPORTS[rel]) continue;
  let content = fs.readFileSync(file, "utf8");
  const needsMetadata =
    /:\s*Metadata\b/.test(content) || /Promise<Metadata>/.test(content);
  const hasMetadataImport = /import\s+type\s+\{\s*Metadata\s*\}\s+from\s+["']next["']/.test(
    content,
  );
  if (needsMetadata && !hasMetadataImport) {
    content = metadataImport + content;
    fs.writeFileSync(file, content);
    console.log("fixed metadata", rel);
  }
}

const reviewView = path.join(ROOT, "src/app/r/[slug]/page-view.tsx");
let rv = fs.readFileSync(reviewView, "utf8");
if (!rv.includes("access-error")) {
  rv = rv.replace(
    'import { notFound } from "next/navigation";',
    'import { notFound } from "next/navigation";\nimport { AccessError } from "@/components/public/access-error";',
  );
  fs.writeFileSync(reviewView, rv);
  console.log("fixed AccessError in r/[slug]/page-view.tsx");
}
