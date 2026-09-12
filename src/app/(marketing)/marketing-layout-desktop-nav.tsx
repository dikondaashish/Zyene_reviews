"use client";

import Link from "next/link";
import { forwardRef, useId } from "react";
import { MarketingHeaderAuth } from "@/components/marketing/marketing-header-auth";
import { PRODUCT_LINKS, RESOURCES_LINKS, SOLUTIONS_LINKS } from "@/app/(marketing)/marketing-layout-nav-data";
import type { MarketingNavMenu } from "@/app/(marketing)/marketing-layout-nav-types";
import { MarketingLayoutNavDropdown } from "@/app/(marketing)/marketing-layout-nav-dropdown";

export const MarketingLayoutDesktopNav = forwardRef<
  HTMLDivElement,
  {
    loginUrl: string;
    signupUrl: string;
    openMenu: MarketingNavMenu | null;
    onToggleMenu: (menu: MarketingNavMenu) => void;
    onOpenMenu: (menu: MarketingNavMenu) => void;
    onCloseMenu: () => void;
  }
>(function MarketingLayoutDesktopNav({ loginUrl, signupUrl, openMenu, onToggleMenu, onOpenMenu, onCloseMenu }, ref) {
  const motionGroup = useId();
  return (
    <nav ref={ref} className="premium-desktop-nav" aria-label="Main navigation">
      <div className="premium-nav-links">
        <MarketingLayoutNavDropdown
          motionGroup={motionGroup}
          label="Platform"
          menu="product"
          links={PRODUCT_LINKS}
          open={openMenu === "product"}
          onToggle={() => onToggleMenu("product")}
          onOpen={() => onOpenMenu("product")}
          onClose={onCloseMenu}
        />
        <MarketingLayoutNavDropdown
          motionGroup={motionGroup}
          label="Industries"
          menu="solutions"
          links={SOLUTIONS_LINKS}
          open={openMenu === "solutions"}
          onToggle={() => onToggleMenu("solutions")}
          onOpen={() => onOpenMenu("solutions")}
          onClose={onCloseMenu}
        />
        <MarketingLayoutNavDropdown
          motionGroup={motionGroup}
          label="Resources"
          menu="resources"
          links={RESOURCES_LINKS}
          open={openMenu === "resources"}
          onToggle={() => onToggleMenu("resources")}
          onOpen={() => onOpenMenu("resources")}
          onClose={onCloseMenu}
        />
        <Link href="/pricing" className="mega-trigger" onClick={onCloseMenu}>
          Pricing
        </Link>
      </div>
      <div className="premium-nav-auth">
        <MarketingHeaderAuth loginUrl={loginUrl} signupUrl={signupUrl} />
      </div>
    </nav>
  );
});
