import {
  LayoutGrid, LayoutTemplate, MessageSquare, Palette, PanelTop, Settings2, Sparkles, Star,
} from "lucide-react";
import { MockCaption, MockPill, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const TABS = [
  { name: "Templates", icon: LayoutTemplate }, { name: "Content", icon: MessageSquare },
  { name: "AI Features", icon: Sparkles }, { name: "Layout", icon: LayoutGrid },
  { name: "Header", icon: PanelTop }, { name: "Review", icon: Star },
  { name: "Theme", icon: Palette }, { name: "Settings", icon: Settings2 },
];

const FIELDS: [string, string][] = [
  ["Review source", "Google"],
  ["Minimum star rating", "4"],
  ["Sort reviews", "Newest"],
  ["Only reviews with text", "On"],
];

const THEMES = ["Light", "Outline", "Soft tint", "Deep tint", "Dark", "Outline dark"];

/** Builder rail, content filters, themes and the install snippet. */
export function ReviewWidgetsBuilderVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Integrations · Website Elements">
        <div className="vz-wg-builder">
          <div className="vz-wg-rail">
            {TABS.map(({ name, icon: Icon }) => (
              <span key={name} className={name === "Content" ? "is-active" : undefined}><Icon size={13} />{name}</span>
            ))}
          </div>
          <div className="mk-stack">
            <span className="mk-label">Content</span>
            {FIELDS.map(([label, value]) => (
              <div key={label} className="vz-wg-field"><span>{label}</span><b>{value}</b></div>
            ))}
            <div className="vz-wg-field"><span>Exclude words or names</span><b>refund</b></div>
            <span className="mk-label">Theme</span>
            <div className="mk-wrap">
              {THEMES.map((t, i) => <MockPill key={t} tone={i === 2 ? "dark" : "neutral"}>{t}</MockPill>)}
            </div>
          </div>
        </div>
        <code className="vz-wg-code">
          {"<script src=\"…/widget-embed.js\" data-widget-url=\"…/w/shine-hair-studio\" async></script>"}
        </code>
      </MockWindow>
      <MockCaption>Paste the code once; new synced reviews show up on their own.</MockCaption>
    </div>
  );
}
