import { cafe, type Look } from "./content";

export type Rgb = [number, number, number];

/** The main objects the scene can show, in a fixed order. */
export const SHAPES = ["momo", "noodles", "chaap", "biryani", "platter"] as const;

/** One pose of the bean. Plain data, so it can cross from a server component to a client one. */
export type Keyframe = {
  /** Horizontal position as a fraction of half the viewport width (-1 left, 1 right). */
  x: number;
  /** Vertical position as a fraction of half the viewport height. */
  y: number;
  /** Size multiplier. */
  s: number;
  bg: Rgb;
  bean: Rgb;
  bump: number;
  rough: number;
  coat: number;
  /** Index into SHAPES: which object is the star of this section. */
  shape: number;
};

const hex = (h: string): Rgb => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** The bean sits on the opposite side from the text. */
const xFor = (copySide: "left" | "right" | "center") =>
  copySide === "right" ? -0.52 : copySide === "left" ? 0.52 : 0;

const toKeyframe = (look: Look, side: "left" | "right" | "center", s: number): Keyframe => ({
  x: xFor(side),
  y: side === "center" ? 0.02 : 0,
  s,
  bg: hex(look.bg),
  bean: hex(look.bean),
  bump: look.bump,
  rough: look.rough,
  coat: look.coat,
  shape: Math.max(0, SHAPES.indexOf(look.shape ?? "momo")),
});

/** One keyframe per section, in page order: hero, stages, highlights, visit. */
export function buildKeyframes(): Keyframe[] {
  return [
    // Parked at the right edge so the giant title stays readable.
    { ...toKeyframe(cafe.hero.look, "center", 0), x: 0.8, y: -0.05 },
    ...cafe.stages.map((stage) => toKeyframe(stage.look, stage.side, 1)),
    toKeyframe(cafe.highlights.look, cafe.highlights.side, 1),
    toKeyframe(cafe.visit.look, cafe.visit.side, 0.9),
  ];
}
