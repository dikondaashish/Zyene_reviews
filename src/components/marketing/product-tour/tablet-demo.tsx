import type { ReactNode } from "react";
import { FeatureDemoFrame } from "@/components/marketing/interior/feature-demo-frame";

export function TabletDemo({ children }: { children: ReactNode }) {
  return (
    <FeatureDemoFrame label="Interactive Zyene Reviews workspace" caption="Your workspace. Ready to try.">
      {children}
    </FeatureDemoFrame>
  );
}
