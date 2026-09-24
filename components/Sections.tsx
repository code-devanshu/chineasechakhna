import { cafe, type Stage } from "@/lib/content";
import ReserveForm from "./ReserveForm";

/** Every section carries data-stop so the 3D scene knows where the dish should rest. */

export function Hero() {
  const { primaryCta, secondaryCta } = cafe.hero;
  return (
    <section className="hero" id="top" data-stop>
      <video
        className="hero-bg"
        src="/video/hero.mp4"
        poster="/video/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="word-wrap">
        <h1 className="word title">
          <span className="sr-only">{cafe.name} </span>
          {cafe.titleLines.map((line) => (
            <span key={line} className="line" aria-hidden="true">
              {line}
            </span>
          ))}
        </h1>
      </div>
      <div className="hero-copy">
        <p className="eyebrow">{cafe.subtitle}</p>
        <p className="tagline">{cafe.tagline}</p>
        <p className="facts">{cafe.hero.facts.join(" · ")}</p>
        <div className="actions">
          <a className="btn primary" href={primaryCta.href}>
            {primaryCta.label}
          </a>
          <a className="btn ghost" href={secondaryCta.href}>
            {secondaryCta.label}
          </a>
        </div>
      </div>
      <p className="hint">{cafe.hint}</p>
    </section>
  );
}

export function StageSection({ stage }: { stage: Stage }) {
  return (
    <section className={`stage ${stage.side}`} id={stage.id} data-stop>
      <div className="word-wrap">
        <h2 className="word">{stage.word}</h2>
      </div>
      <div className="copy">
        <p className="lead">{stage.lead}</p>
        {stage.groups.map((group) => (
          <div className="menu-group" key={group.title ?? "items"}>
            {group.title && <h3 className="menu-title">{group.title}</h3>}
            <ul className="menu">
              {group.items.map((item) => (
                <li key={item.name}>
                  <span className="name">{item.name}</span>
                  {item.price && <span className="price">{item.price}</span>}
                  {item.note && <span className="note">{item.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Highlights() {
  const h = cafe.highlights;
  return (
    <section className={`stage ${h.side}`} id={h.id} data-stop>
      <div className="word-wrap">
        <h2 className="word">{h.word}</h2>
      </div>
      <div className="copy">
        <p className="lead">{h.lead}</p>
        <ul className="features">
          {h.features.map((f) => (
            <li key={f.title}>
              <span className="name">{f.title}</span>
              <span className="note">{f.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Visit() {
  const v = cafe.visit;
  return (
    <section className={`stage ${v.side}`} id={v.id} data-stop>
      <div className="word-wrap">
        <h2 className="word">{v.word}</h2>
      </div>
      <div className="copy">
        <p className="lead">{v.lead}</p>
        <div className="actions cta">
          <a className="btn primary" href="#reserve">
            Reserve a table
          </a>
          <a className="btn ghost" href={cafe.phoneHref}>
            Call {cafe.phone}
          </a>
        </div>
        <ReserveForm />
        <dl className="info">
          <dt>Hours</dt>
          <dd>{v.hours.join(", ")}</dd>
          <dt>Address</dt>
          <dd>{v.address}</dd>
          <dt>Price</dt>
          <dd>{v.cost}</dd>
          <dt>Good to know</dt>
          <dd>{v.amenities.join(" · ")}</dd>
          <dt>Instagram</dt>
          <dd>
            <a href={cafe.instagram.href} target="_blank" rel="noopener noreferrer">
              {cafe.instagram.handle}
            </a>
          </dd>
        </dl>
        <iframe
          className="map"
          title={`Map showing ${cafe.name}`}
          src={v.mapEmbedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="actions" id="order">
          <a className="btn primary" href={v.directionsHref} target="_blank" rel="noopener noreferrer">
            Get directions
          </a>
          {cafe.orderLinks.map((l) => (
            <a key={l.href} className="btn ghost" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
            </a>
          ))}
        </div>
        <p className="fine">{cafe.footnote}</p>
        <p className="fine tight credit">
          Designed and built by{" "}
          <a href="https://www.devanshuverma.in/" target="_blank" rel="noopener noreferrer">
            Devanshu Verma
          </a>
        </p>
      </div>
    </section>
  );
}
