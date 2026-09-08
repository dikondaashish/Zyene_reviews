export function HomeSceneAnnotations() {
  return (
    <div className="hero-annotations" aria-hidden="true">
      <div className="hero-annotation-top">
        <p>
          More reviews.
          <br />
          More customers.
          <br />
          Less hassle.
        </p>
        <svg viewBox="0 0 80 60">
          <path pathLength="1" d="M10 3C16 37 29 41 63 42m-12-12 13 12-13 11" />
        </svg>
      </div>
      <div className="hero-annotation-bottom">
        <svg viewBox="0 0 65 65">
          <path pathLength="1" d="M60 54C21 59 24 23 18 7m-8 15L18 7l12 13" />
        </svg>
        <p>
          Turn feedback
          <br />
          into loyal customers.
        </p>
      </div>
    </div>
  );
}
