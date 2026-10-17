import type { CSSProperties } from "react";

/* Shared helpers for the homepage's CSS choreography (styles in marketing-home-motion.css). */

/** Sets the animation delay read by the m-* motion classes. */
export const at = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/** Text that writes itself in, word by word. */
export function Words({ text, start, step = 0.04 }: { text: string; start: number; step?: number }) {
  return (
    <>
      {text.split(" ").map((word, index) => (
        <span key={index} className="m-word" style={at(start + index * step)}>{word} </span>
      ))}
    </>
  );
}
