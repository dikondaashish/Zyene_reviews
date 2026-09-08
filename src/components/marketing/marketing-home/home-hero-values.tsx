import { Heart, Star, UsersRound, Zap } from "lucide-react";

const VALUES = [
  {
    icon: UsersRound,
    title: (
      <>
        One home for
        <br />
        all your reviews
      </>
    ),
    detail: "From local shops to multi-location brands",
  },
  {
    icon: Star,
    title: (
      <>
        Google, Facebook,
        <br />
        Yelp and more
      </>
    ),
    detail: "Bring your customer feedback together",
  },
  {
    icon: Zap,
    title: (
      <>
        Simple setup.
        <br />A lighter workload.
      </>
    ),
    detail: "More time for the people you serve",
  },
  {
    icon: Heart,
    title: (
      <>
        Built for local
        <br />
        businesses like yours
      </>
    ),
    detail: "Real customers. Real growth.",
  },
];

export function HomeHeroValues() {
  return (
    <ul className="home-hero-values" aria-label="Why local businesses choose Zyene">
      {VALUES.map(({ icon: Icon, title, detail }, index) => (
        <li key={detail} className="hero-enter" style={{ animationDelay: `${1300 + index * 90}ms` }}>
          <span className="home-value-icon">
            <Icon size={33} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <p>{title}</p>
            <span>{detail}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
