import Image from "next/image";
import {
  BarChart3,
  LayoutDashboard,
  LayoutGrid,
  MessageSquare,
  Send,
  Settings,
  Sparkles,
} from "lucide-react";
import { ZYENE_REVIEWS_LOGO_SRC } from "@/lib/brand/logo";

const SIDEBAR = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: MessageSquare, label: "Reviews" },
  { icon: Send, label: "Get Reviews" },
  { icon: Sparkles, label: "AI Replies" },
  { icon: BarChart3, label: "Analytics" },
  { icon: LayoutGrid, label: "Widgets" },
  { icon: Settings, label: "Settings" },
];
export function HomeDashboardSidebar() {
  return (
    <div className="hero-dashboard-sidebar" aria-hidden="true">
      <div className="hero-dashboard-brand">
        <Image src={ZYENE_REVIEWS_LOGO_SRC} alt="" width={28} height={28} />
        <span>
          <b>Zyene</b> Reviews
        </span>
      </div>
      {SIDEBAR.map(({ icon: Icon, label }, index) => (
        <div key={label} className={index === 0 ? "is-selected" : undefined}>
          <Icon aria-hidden="true" />
          {label}
        </div>
      ))}
    </div>
  );
}
