import fs from "node:fs";
import path from "node:path";

const DIR = path.join(import.meta.dirname, "..", "src/components/settings");
const lines = fs.readFileSync(path.join(DIR, "review-content-form.tsx"), "utf8").split("\n");
const slice = (a, b) => lines.slice(a - 1, b).join("\n");

const shared = `import { TabsContent } from "@/components/ui/tabs";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";`;

function writeTab(file, component, extraImports, bodyStart, bodyEnd, propsType = "ReviewContentTabProps", propsDestructure = "{ form }") {
  const body = slice(bodyStart, bodyEnd);
  fs.writeFileSync(
    path.join(DIR, file),
    `"use client";

${extraImports}
${shared}
import type { ${propsType === "ReviewContentTabProps" ? "ReviewContentTabProps" : propsType} } from "@/components/settings/review-content-tab-props";

export function ${component}(${propsDestructure}: ${propsType}) {
    return (
${body}
    );
}
`,
  );
}

fs.writeFileSync(
  path.join(DIR, "review-content-schema.ts"),
  `import * as z from "zod";

${slice(43, 87)}

export type ContentFormValues = z.infer<typeof contentSchema>;
`,
);

fs.writeFileSync(
  path.join(DIR, "review-content-tab-props.ts"),
  `import type { UseFormReturn } from "react-hook-form";
import type { ContentFormValues } from "@/components/settings/review-content-schema";

export type ReviewContentTabProps = {
    form: UseFormReturn<ContentFormValues>;
};
`,
);

writeTab("review-content-rating-tab.tsx", "ReviewContentRatingTab", "", 455, 554);
writeTab(
  "review-content-tags-tab.tsx",
  "ReviewContentTagsTab",
  `import { Star } from "lucide-react";
import { ReviewTagChipEditor } from "@/components/settings/review-tag-chip-editor";
import type { ReviewTagItem } from "@/lib/review-flow/tag-display";
`,
  557,
  665,
  "ReviewContentTabProps & { tagCategory: string; tagItems: ReviewTagItem[]; tagsReady: boolean; setTagItems: (items: ReviewTagItem[]) => void }",
  "{ form, tagCategory, tagItems, tagsReady, setTagItems }",
);
writeTab("review-content-google-tab.tsx", "ReviewContentGoogleTab", "", 668, 733);
writeTab("review-content-feedback-tab.tsx", "ReviewContentFeedbackTab", `import { Gift } from "lucide-react";`, 736, 911);
writeTab("review-content-success-tab.tsx", "ReviewContentSuccessTab", "", 914, 951);

const brandingBody = slice(954, 1064);
fs.writeFileSync(
  path.join(DIR, "review-content-branding-tab.tsx"),
  `"use client";

import { Loader2, Upload, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
${shared}
import type { ReviewContentTabProps } from "@/components/settings/review-content-tab-props";

export function ReviewContentBrandingTab({
    form,
    uploadingFooterLogo,
    handleFooterLogoUpload,
    removeFooterLogo,
}: ReviewContentTabProps & {
    uploadingFooterLogo: boolean;
    handleFooterLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeFooterLogo: () => void;
}) {
    return (
${brandingBody}
    );
}
`,
);

console.log("Tab files written.");
