import Image from "next/image";
import {
  BarChart3,
  Globe,
  LayoutDashboard,
  MessageSquare,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { ZYENE_REVIEWS_LOGO_SRC } from "@/lib/brand/logo";

const SIDEBAR = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: MessageSquare, label: "Reviews" },
  { icon: Send, label: "Review Requests" },
  { icon: Users, label: "Customers" },
  { icon: TrendingUp, label: "Competitors" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Globe, label: "Google SEO/AEO" },
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
