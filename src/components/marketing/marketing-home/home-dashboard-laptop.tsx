import { CalendarDays, ChevronDown } from "lucide-react";
import { HomeDashboardSidebar } from "@/components/marketing/marketing-home/home-dashboard-sidebar";
import { HomeDashboardMetrics } from "@/components/marketing/marketing-home/home-dashboard-metrics";
import { HomeDashboardRecentReviews } from "@/components/marketing/marketing-home/home-dashboard-recent-reviews";

export function HomeDashboardLaptop() {
  return (
    <div className="hero-laptop-enter">
      <div className="hero-laptop">
        <div className="hero-laptop-lid">
          <span className="hero-laptop-camera" aria-hidden="true" />
          <div className="hero-laptop-screen">
            <div className="hero-browser-bar" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="hero-dashboard">
              <HomeDashboardSidebar />
              <div className="hero-dashboard-main">
                <div className="hero-dashboard-heading">
                  <div>
                    <h2>Your Reviews</h2>
                    <p>See what your customers are saying</p>
                  </div>
                  <span className="hero-dashboard-date">
                    <CalendarDays />
                    <span>Last 30 days</span>
                    <ChevronDown />
                  </span>
                </div>
                <p className="hero-dashboard-example">Example workspace · Sample data</p>
                <HomeDashboardMetrics />
                <HomeDashboardRecentReviews />
              </div>
            </div>
          </div>
        </div>
        <div className="hero-laptop-base" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
