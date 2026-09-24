"use client";

import { useEffect, useRef, useState } from "react";

type Card = { eyebrow: string; title: string; body: string; tagline: string; img: string; tone: string };

const CARDS: Card[] = [
  {
    eyebrow: "01 / The Welcome",
    title: "Walk up and order",
    body: "Chinese Chakhna is a 100% pure vegetarian Indo-Chinese chakhna joint, quick to order, quicker to the table.",
    tagline: "no reservation needed",
    img: "/story/stall.jpg",
    tone: "butter",
  },
  {
    eyebrow: "02 / The Wok",
    title: "Wok-fired, always",
    body: "Noodles, manchurian and fried rice, tossed to order over a roaring wok flame, no shortcuts, no pre-mixing.",
    tagline: "tossed to order",
    img: "/story/wok.jpg",
    tone: "toffee",
  },
  {
    eyebrow: "03 / The Steam",
    title: "Momos, fresh-folded",
    body: "Steamed, fried or off the tandoor, filled with veg, paneer or our loaded CCC mix, and finished with house chilli chutney.",
    tagline: "folded fresh daily",
    img: "/story/momo-basket.jpg",
    tone: "blush",
  },
  {
    eyebrow: "04 / The Mood",
    title: "Good food, good mood",
    body: "Red lanterns, bold spice, zero meat on the menu. 100% pure vegetarian, always.",
    tagline: "100% pure veg",
    img: "/story/lanterns.jpg",
    tone: "accent-soft",
  },
];

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

/**
 * Scroll-pinned horizontal story carousel. The tall outer section provides the scroll distance,
 * the sticky viewport stays put, and vertical progress is mapped onto the track's translateX.
 * With reduced motion it becomes a plain scroll-snap row.
 */
export default function OurStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const range = section.offsetHeight - window.innerHeight;
      const p = range > 0 ? clamp(-section.getBoundingClientRect().top / range) : 0;
      const dist = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = `translate3d(${-p * dist}px,0,0)`;
      setProgress(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const n = CARDS.length;
  const active = Math.min(n - 1, Math.floor(progress * n));

  return (
    <section className="story" ref={sectionRef} aria-label="Our story">
      <div className="story-pin">
        <div className="story-head">
          <div>
            <h2 className="story-title">Our story</h2>
            <div className="story-bar" aria-hidden="true">
              {CARDS.map((c, i) => (
                <span key={c.eyebrow}>
                  <span style={{ width: `${clamp(progress * n - i) * 100}%` }} />
                </span>
              ))}
            </div>
          </div>
          <p className="story-count" aria-hidden="true">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </p>
        </div>

        <div className="story-scroll">
          <div className="story-track" ref={trackRef}>
            {CARDS.map((c) => (
              <article className="story-card" key={c.eyebrow}>
                <div className="story-img">
                  <img src={c.img} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="story-copy" style={{ background: `var(--${c.tone})` }}>
                  <span className="story-eyebrow">{c.eyebrow}</span>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </div>
                  <span className="story-tag">{c.tagline}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
