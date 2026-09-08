import { HomeDashboardLaptop } from "@/components/marketing/marketing-home/home-dashboard-laptop";
import { HomeReviewPhone } from "@/components/marketing/marketing-home/home-review-phone";
import { HomeSceneAnnotations } from "@/components/marketing/marketing-home/home-scene-annotations";
import { HomeScenePlant, HomeSceneMug } from "@/components/marketing/marketing-home/home-scene-decor";
import { HomeCustomerReviewCard } from "@/components/marketing/marketing-home/home-customer-review-card";
import { HomeGrowthMetricCard } from "@/components/marketing/marketing-home/home-growth-metric-card";

export function HomeProductScene() {
  return (
    <div
      className="home-product-scene"
      role="group"
      aria-label="Explore an example Zyene Reviews dashboard and mobile review request"
    >
      <div className="hero-scene-glow" aria-hidden="true">
        <div />
      </div>
      <HomeScenePlant position="left" />
      <HomeScenePlant position="right" />
      <HomeSceneMug />
      <HomeDashboardLaptop />
      <HomeCustomerReviewCard placement="top" />
      <HomeCustomerReviewCard placement="bottom" />
      <HomeGrowthMetricCard />
      <HomeReviewPhone />
      <HomeSceneAnnotations />
    </div>
  );
}
