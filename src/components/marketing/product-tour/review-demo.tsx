"use client";

import { useReducer, useState } from "react";
import { Search, Star, CheckCheck } from "lucide-react";
import { DEMO_REVIEWS } from "@/lib/marketing/product-demo-data";
import { DemoReplyComposer } from "@/components/marketing/product-tour/reply-composer";
import { createReviewDemoState, reviewDemoReducer } from "@/lib/marketing/product-demo";

export function ReviewDemo() {
  const [state, dispatch] = useReducer(reviewDemoReducer, undefined, createReviewDemoState);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const selected = DEMO_REVIEWS.find(review => review.id === state.selectedId)!;
  const pending = DEMO_REVIEWS.filter(review => !state.drafts[review.id].published).length;
  const reviews = DEMO_REVIEWS.filter(review => (filter === "all" || !state.drafts[review.id].published)
    && `${review.name} ${review.content}`.toLowerCase().includes(query.toLowerCase()));
  const draft = state.drafts[selected.id];
  return (
    <div className="review-demo">
      <div className="tour-page-heading">
        <div><span className="tour-overline">YOUR REPUTATION, IN ONE PLACE</span><h3>Review inbox</h3></div>
        <span className="tour-status"><span />{pending} awaiting a reply</span>
      </div>
      <div className="tour-inbox">
        <aside className="tour-review-list" aria-label="Sample review inbox">
          <label className="tour-search"><Search size={16} aria-hidden="true" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search reviews" aria-label="Search sample reviews" /></label>
          <div className="tour-segment" aria-label="Filter sample reviews">
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All reviews <span>3</span></button>
            <button type="button" aria-pressed={filter === "pending"} onClick={() => setFilter("pending")}>Needs reply <span>{pending}</span></button>
          </div>
          <div className="tour-review-options">
            {reviews.map(review => (
              <button type="button" key={review.id} className="tour-review-option" aria-pressed={state.selectedId === review.id} onClick={() => dispatch({ type: "select", id: review.id })}>
                <span className="tour-review-option-top"><strong>{review.name}</strong><span>{review.time}</span></span>
                <span className="tour-review-option-rating"><span aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span><span className="tour-platform-name">{review.platform}</span></span>
                <span className="tour-review-excerpt">{review.content}</span>
                <span className={state.drafts[review.id].published ? "tour-replied" : "tour-pending"}>{state.drafts[review.id].published ? "Replied in demo" : "Needs reply"}</span>
              </button>
            ))}
          </div>
          {!reviews.length && <p className="tour-empty">{query ? "No matching reviews. Try another search." : "You’re all caught up in this demo."}<button type="button" className="tour-text-button" onClick={() => { setQuery(""); setFilter("all"); }}>Show all reviews</button></p>}
        </aside>
        <div className="tour-review-detail" key={selected.id}>
          <div className="tour-review-detail-heading">
            <span className="tour-avatar">{selected.initials}</span>
            <div><strong>{selected.name}</strong><p className="tour-detail-meta"><span className="tour-platform-name">{selected.platform}</span> · {selected.time}</p></div>
            <span className="tour-sample-badge">Sample review</span>
          </div>
          <div className="tour-stars" aria-label={`${selected.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} fill={star <= selected.rating ? "currentColor" : "none"} aria-hidden="true" />)}</div>
          <p className="tour-review-content">{selected.content}</p>
          {draft.published && <div className="tour-published-reply"><strong><CheckCheck size={16} aria-hidden="true" />Your reply · demo only</strong><p>{draft.published}</p></div>}
          <DemoReplyComposer key={selected.id} draft={draft} replies={selected.replies} dispatch={dispatch} />
        </div>
      </div>
    </div>
  );
}
