"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import type { MarketingNavLink } from "@/app/(marketing)/marketing-layout-nav-data";
import type { MarketingNavMenu } from "@/app/(marketing)/marketing-layout-nav-types";
import { NAV_INDUSTRIES } from "@/app/(marketing)/marketing-layout-industry-links";
import { getIndustryImage } from "@/lib/industries/industry-imagery";

import { FEATURE } from "@/app/(marketing)/marketing-layout-nav-feature";
import { AnimatedBackground } from "@/components/marketing/animated-background";

export function MarketingLayoutNavDropdown({
  label,
  motionGroup,
  menu,
  links,
  open,
  onToggle,
  onOpen,
  onClose,
}: {
  label: string;
  motionGroup: string;
  menu: MarketingNavMenu;
  links: MarketingNavLink[];
  open: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onClose: () => void;
}) {
  const feature = FEATURE[menu];
  const visibleLinks =
    menu === "product" ? links.filter((link) => !["/features", "/pricing"].includes(link.href)) : links;
  return (
    <div
      className="mega-nav-item"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
          event.currentTarget.querySelector("button")?.focus();
        }
      }}
    >
      <AnimatedBackground value={open ? menu : null} groupId={motionGroup} className="mega-trigger-highlight">
        {[
          <button
            key={menu}
            data-id={menu}
            type="button"
            aria-expanded={open}
            aria-controls={`marketing-menu-${menu}`}
            onClick={(event) => {
              // A fine pointer opens the menu on hover before its click fires.
              // Keep that click open; keyboard activation still toggles it.
              if (event.detail > 0) onOpen();
              else onToggle();
            }}
            className="mega-trigger"
          >
            {label}
            <ChevronDown size={13} aria-hidden="true" />
          </button>,
        ]}
      </AnimatedBackground>
      {open && (
        <div className="mega-panel" id={`marketing-menu-${menu}`}>
          <div className="mega-panel-main">
            <div className="mega-panel-links">
              <p className="mega-panel-label">
                {menu === "product"
                  ? "ONE PLATFORM. EVERY PART OF YOUR REPUTATION."
                  : menu === "solutions"
                    ? "BUILT AROUND YOUR BUSINESS"
                    : "IDEAS, ANSWERS & A HEAD START"}
              </p>
              <div className="mega-link-grid">
                {menu === "solutions"
                  ? NAV_INDUSTRIES.map((industry) => (
                      <Link
                        key={industry.slug}
                        href={`/industries/${industry.slug}`}
                        className="mega-industry-link"
                        onClick={onClose}
                      >
                        <Image src={getIndustryImage(industry.slug).src} alt="" width={60} height={48} />
                        <span>{industry.name}</span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    ))
                  : visibleLinks.map((item) => (
                      <Link key={item.href} href={item.href} className="mega-product-link" onClick={onClose}>
                        <item.icon size={19} aria-hidden="true" />
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.desc}</small>
                        </span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    ))}
              </div>
            </div>
            <Link href={feature.href} className="mega-feature" onClick={onClose}>
              <div>
                <Image src={feature.image} alt={feature.alt} fill sizes="320px" />
              </div>
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
              <span>
                {feature.link}
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          </div>
          <div className="mega-panel-footer">
            <span>
              {menu === "solutions" ? (
                <>
                  <Link href="/industries" onClick={onClose}>
                    All industries
                  </Link>
                  <Link href="/enterprise" onClick={onClose}>
                    Enterprise
                  </Link>
                  <Link href="/compare" onClick={onClose}>
                    Compare platforms
                  </Link>
                </>
              ) : (
                "A better reputation starts with a conversation."
              )}
            </span>
            <Link href="/demo" onClick={onClose}>
              Let’s show you around <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
