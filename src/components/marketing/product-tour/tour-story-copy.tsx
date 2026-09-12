import { ArrowDown, ArrowUpRight, BarChart3, Send, Sparkles } from "lucide-react";
import type { ProductTourTab } from "@/components/marketing/product-tour/product-tour";

const STORIES = {
  reviews: { number: "01", label: "Replies", icon: Sparkles, title: "Your voice. Even when you’re busy.", description: "Automatically publish AI replies to new, unanswered Google reviews. Choose which star ratings to respond to and a tone that fits your business. Turn it off anytime.", hint: "Turn on “Try automatic replies” in the demo", detail: "Or draft, edit, and publish a reply yourself." },
  requests: { number: "02", label: "Requests", icon: Send, title: "A small ask. A lasting impression.", description: "Turn a great visit into your next review. Personalize an invitation, send a sample, and see exactly what your customer receives.", hint: "Send a sample request, then open its link", detail: "From a visit to a conversation." },
  reports: { number: "03", label: "Insights", icon: BarChart3, title: "Less guesswork. More perspective.", description: "See the story behind your stars. Explore review activity, compare platforms, and find the patterns that help you plan your next move.", hint: "Change the date range or explore a chart bar", detail: "A clearer picture of what’s working." },
};

export function TourStoryCopy({ active, onChange }: { active: ProductTourTab; onChange: (tab: ProductTourTab) => void }) {
  const story = STORIES[active];
  const Icon = story.icon;
  return <>
    <div className="tour-story-copy" key={active}>
      <div className="tour-story-chapter"><span>{story.number} / 03</span><Icon size={18} aria-hidden="true" /></div>
      <h3>{story.title}</h3>
      <p>{story.description}</p>
      <span className="tour-story-detail">{story.detail}</span>
      <div className="tour-story-hint"><ArrowUpRight size={16} aria-hidden="true" /><span>{story.hint}</span></div>
    </div>
    <nav className="tour-story-nav" aria-label="Choose a demo feature">
      {(Object.keys(STORIES) as ProductTourTab[]).map(key => <button type="button" key={key} aria-pressed={key === active} onClick={() => onChange(key)}><span>{STORIES[key].number}</span>{STORIES[key].label}</button>)}
    </nav>
    <p className="tour-story-scroll"><ArrowDown size={14} aria-hidden="true" />Scroll to explore. Or make it your own.</p>
  </>;
}
