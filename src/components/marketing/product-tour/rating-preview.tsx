"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCheck, Star } from "lucide-react";

export function DemoRatingPreview() {
  const [rating, setRating] = useState(0);
  const [finished, setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  if (finished) return <div className="tour-rating-confirmation" role="status">
    <CheckCheck size={30} aria-hidden="true" /><h4>Thanks for trying it!</h4>
    <p>Your {rating}-star sample feedback was saved in this demo only.</p>
    <button type="button" className="tour-text-button" onClick={() => { setFinished(false); setRating(0); }}>Try another rating</button>
  </div>;
  return <>
    <h4 ref={heading} tabIndex={-1} className="tour-rating-heading">How was your experience?</h4>
    <p className="tour-rating-description">Every experience matters. Try any rating.</p>
    <fieldset className="tour-rating-picker">
      <legend className="sr-only">Choose a sample rating</legend>
      {[1, 2, 3, 4, 5].map(value => <button type="button" key={value} aria-label={`${value} ${value === 1 ? "star" : "stars"}`} aria-pressed={rating === value} onClick={() => setRating(value)}>
        <Star size={26} fill={value <= rating ? "currentColor" : "none"} aria-hidden="true" />
      </button>)}
    </fieldset>
    <p className="tour-rating-description" role="status">{rating ? `${rating} of 5 stars selected` : "Choose a star to continue"}</p>
    <button type="button" className="tour-action" disabled={!rating} onClick={() => setFinished(true)}>Save demo feedback</button>
  </>;
}
