import BeanScene from "@/components/BeanScene";
import Nav from "@/components/Nav";
import OurStory from "@/components/OurStory";
import Splash from "@/components/Splash";
import { Hero,Highlights, StageSection, Visit } from "@/components/Sections";
import { cafe } from "@/lib/content";
import { buildKeyframes } from "@/lib/roast";

/** Structured data so Google can show the menu and details for the restaurant. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: cafe.name,
  description: cafe.description,
  telephone: cafe.phone,
  servesCuisine: ["Indian", "Chinese"],
  priceRange: "₹",
  sameAs: [cafe.instagram.href, ...cafe.orderLinks.map((l) => l.href)],
  hasMap: cafe.visit.directionsHref,
  address: {
    "@type": "PostalAddress",
    streetAddress: cafe.visit.address,
    addressLocality: "Lucknow",
    addressRegion: "Uttar Pradesh",
    postalCode: "226010",
    addressCountry: "IN",
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Splash />
      <Nav />
      <BeanScene keyframes={buildKeyframes()} />
      <main>
        <Hero />
        {cafe.stages.map((stage) => (
          <StageSection key={stage.id} stage={stage} />
        ))}
        <Highlights />
        <OurStory />
        <Visit />
      </main>
    </>
  );
}
