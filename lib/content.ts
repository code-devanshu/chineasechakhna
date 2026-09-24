/**
 * Everything you need to edit to make this site your own lives in this file:
 * name, copy, menu items, prices, hours, address, and the colours of each section.
 *
 * Sections appear in this order: hero, then every entry in `stages`, then highlights, then visit.
 * The 3D dish gets one "look" per section, so adding or removing a stage
 * automatically adds or removes a stop on the dish's journey.
 *
 * Contact details and address come from the restaurant's public listings (Google, Zomato,
 * Swiggy, Instagram). Confirm the shop number and opening hours with the owner. Menu items
 * and prices are taken from the restaurant's own printed menu, not the delivery apps, which
 * add a markup.
 */

export type Look = {
  /** Page background while this section is centred. Keep it dark enough for the light text. */
  bg: string;
  /** Colour of the floating embers in this section. */
  bean: string;
  /** Wrinkle depth, 0 to about 1.2. */
  bump: number;
  /** Surface roughness, 0 (glossy) to 1 (matte). */
  rough: number;
  /** Glossy oil layer, 0 to 1. */
  coat: number;
  /** What the big 3D dish is in this section. Defaults to momo. */
  shape?: "momo" | "noodles" | "chaap" | "biryani" | "platter";
};


export type MenuItem = { name: string; price?: string; note?: string };
/** A block of items under an optional heading, mirroring a section of the printed menu. */
export type MenuGroup = { title?: string; items: MenuItem[] };

export type Stage = {
  /** Used for the anchor link, e.g. "#momo". */
  id: string;
  /** Short label shown in the top navigation. */
  nav: string;
  /** The huge word behind the dish. Keep it short: 4 to 7 letters fits best. */
  word: string;
  /** Which side the text sits on. The dish takes the opposite side. */
  side: "left" | "right";
  lead: string;
  groups: MenuGroup[];
  look: Look;
};

export type Feature = { title: string; detail: string };

export const cafe = {
  name: "Chinese Chakhna",
  /** The hero title is stacked on two lines because the full name is too wide for one giant word. */
  titleLines: ["Chinese", "Chakhna"],
  fullName: "Chinese Chakhna | Pure Veg Indo-Chinese Kitchen",
  description:
    "Chinese Chakhna is a 100% pure vegetarian Indo-Chinese kitchen: momos, wok-tossed noodles and manchurian, tandoori chaap, biryani and thali. Good food, good mood.",
  subtitle: "Pure Veg Indo-Chinese Kitchen",
  tagline: "Good food, good mood, piping hot momos, wok-tossed noodles and tandoori chaap, 100% pure vegetarian.",
  hint: "Move your mouse to spin the plate.",
  phone: "+91 95807 30373",
  phoneHref: "tel:+919580730373",
  /** Digits only, with country code. Reservation requests are sent to this WhatsApp number. */
  whatsapp: "919580730373",
  instagram: { handle: "@chinese_chakhna", href: "https://www.instagram.com/chinese_chakhna/", followers: "75" },
  fssai: "22724743000190",
  orderLinks: [
    { label: "Order on Zomato", href: "https://www.zomato.com/lucknow/chinese-chakhna-gomti-nagar" },
    { label: "Order on Swiggy", href: "https://www.swiggy.com/city/lucknow/chinese-chakhna-gomti-nagar-rest1319974" },
  ],

  hero: {
    look: { bg: "#3a0a0c", bean: "#e8b23d", bump: 0.5, rough: 0.5, coat: 0.3, shape: "momo" } satisfies Look,
    primaryCta: { label: "Order now", href: "#order" },
    secondaryCta: { label: "See the menu", href: "#momo" },
    facts: ["100% Pure Vegetarian", "Thali at ₹100", "Free delivery within 2 km"],
  },

  stages: [
    {
      id: "momo",
      nav: "Momo",
      word: "Momo",
      side: "right",
      lead: "Steamed, fried or off the tandoor, veg, paneer or our loaded CCC style, finished with house chilli chutney.",
      groups: [
        {
          items: [
            { name: "Steam Momo", note: "Veg / Paneer / CCC" },
            { name: "Fried Momo", note: "Veg / Paneer / CCC" },
            { name: "Tandoori Momo", note: "Veg / Paneer / CCC" },
            { name: "Afgani Momo", note: "Veg / Paneer / CCC" },
            { name: "Malai Momo", note: "Veg / Paneer / CCC" },
            { name: "Dragon Momo", note: "Veg / Paneer / CCC" },
            { name: "Chilli Momo", note: "Veg / Paneer / CCC" },
            { name: "Kurkare Momo", note: "Veg / Paneer / CCC" },
            { name: "Cheese Lapeta Momo", note: "6 pc" },
          ],
        },
      ],
      look: { bg: "#7a1315", bean: "#e8b23d", bump: 0.5, rough: 0.5, coat: 0.3, shape: "momo" },
    },
    {
      id: "chinese",
      nav: "Chinese",
      word: "Wok",
      side: "left",
      lead: "Hakka noodles, manchurian and fried rice, wok-tossed to order, gravy or dry, your call.",
      groups: [
        {
          items: [
            { name: "Veg Noodles" },
            { name: "Paneer Noodles" },
            { name: "Veg Fried Rice" },
            { name: "Paneer Fried Rice" },
            { name: "Chilli Paneer Gravy" },
            { name: "Chilli Paneer Dry" },
            { name: "Veg Manchurian Dry" },
            { name: "Gravy Manchurian" },
            { name: "Chilli Potato" },
            { name: "Honey Chilli Potato" },
          ],
        },
      ],
      look: { bg: "#123a24", bean: "#e07b39", bump: 0.3, rough: 0.55, coat: 0.15, shape: "noodles" },
    },
    {
      id: "chaap",
      nav: "Chaap",
      word: "Chaap",
      side: "right",
      lead: "Soya chaap off the tandoor (malai, afgani, aachari), plus paneer and mushroom tikka, smoked the traditional way.",
      groups: [
        {
          title: "Chaap",
          items: [
            { name: "Tandoori Chaap" },
            { name: "Malai Chaap" },
            { name: "Afgani Chaap" },
            { name: "Aachari Chaap" },
            { name: "Rumali" },
          ],
        },
        {
          title: "Tandoori Paneer / Mushroom",
          items: [
            { name: "Tandoori", note: "Paneer / Mushroom" },
            { name: "Malai", note: "Paneer / Mushroom" },
            { name: "Afgani", note: "Paneer / Mushroom" },
            { name: "Aachari", note: "Paneer / Mushroom" },
          ],
        },
        {
          title: "Tawa Gravy",
          items: [
            { name: "Tawa Chaap" },
            { name: "Paneer Tawa" },
            { name: "Mushroom Tawa" },
          ],
        },
      ],
      look: { bg: "#2a0f0f", bean: "#d94f30", bump: 0.6, rough: 0.4, coat: 0.4, shape: "chaap" },
    },
    {
      id: "biryani",
      nav: "Biryani",
      word: "Biryani",
      side: "left",
      lead: "Slow-cooked veg biryanis, and a full thali if you want it all on one plate.",
      groups: [
        {
          title: "Thali",
          items: [
            { name: "Thali", note: "Daal, rice, seasonal sabji, 4 roti, aachar, raita" },
          ],
        },
        {
          title: "Biryani",
          items: [
            { name: "Soya Chaap Biryani" },
            { name: "Paneer Tikka Biryani" },
            { name: "Mushroom Biryani" },
          ],
        },
      ],
      look: { bg: "#4a2b0e", bean: "#c98a2b", bump: 0.4, rough: 0.5, coat: 0.2, shape: "biryani" },
    },
    {
      id: "snacks",
      nav: "Snacks",
      word: "Snacks",
      side: "right",
      lead: "Crispy starters and combo platters, built for the table to share.",
      groups: [
        {
          title: "Snacks",
          items: [
            { name: "Paneer Popcorn" },
            { name: "Crispy Corn" },
            { name: "Kurkare Chaap" },
          ],
        },
        {
          title: "Pasta",
          items: [
            { name: "White Sauce Pasta" },
            { name: "Red Sauce Pasta" },
            { name: "Pink Sauce Pasta" },
          ],
        },
        {
          title: "Combo & Platter",
          items: [
            { name: "Chaap Platter" },
            { name: "Momo Platter" },
            { name: "Chinese Platter" },
            { name: "Chilli Paneer with Rice / Noodles" },
            { name: "Manchurian with Rice / Noodles" },
          ],
        },
      ],
      look: { bg: "#5a1010", bean: "#e8b23d", bump: 0.5, rough: 0.5, coat: 0.3, shape: "platter" },
    },
  ] satisfies Stage[],

  highlights: {
    id: "highlights",
    nav: "Why Us",
    word: "Fresh",
    side: "left" as const,
    lead: "Everything on the menu is 100% pure vegetarian, made fresh to order, from the tandoor and the wok.",
    features: [
      { title: "100% Pure Vegetarian", detail: "No egg, no meat, anywhere on the menu, ever." },
      { title: "Fresh, Made to Order", detail: "Momos steamed and noodles wok-tossed only after you order." },
      { title: "Tandoor & Charcoal Wok", detail: "Chaap, paneer and mushroom, smoked the traditional way." },
      { title: "Tiffin & Party Orders", detail: "Ghar jaisa swad, daily, weekly and monthly tiffin packs, plus platters for your get-together. Call or WhatsApp to book." },
      { title: "Loved in Gomti Nagar", detail: "5.0 ★ on Google. \"Best pasta in town.\"" },
      { title: "Good Food, Good Mood", detail: "Our whole menu, in one line." },
    ] satisfies Feature[],
    look: { bg: "#123a24", bean: "#d94f30", bump: 0.4, rough: 0.5, coat: 0.2, shape: "momo" } satisfies Look,
  },

  visit: {
    id: "visit",
    nav: "Visit",
    word: "Visit",
    side: "right" as const,
    lead: "Takeaway and delivery. Walk up, call ahead, or send a WhatsApp request.",
    /** From the Swiggy listing. Opening time not published, confirm with the owner. */
    hours: ["Open till 12:00 AM (midnight)", "Tiffin service on request"],
    /** Swiggy lists S-80; Google, Zomato and Instagram say 35. Confirm with the owner. */
    address: "Shop S-35, Kisan Bazaar (Backside Gate), Irani Chai Row, Vibhuti Khand, Gomti Nagar, Lucknow, UP 226010",
    cost: "Thali at ₹100 · most mains under ₹200",
    amenities: ["Takeaway", "Fast delivery", "Free delivery within 2 km", "100% Pure Vegetarian"],
    directionsHref: "https://maps.google.com/?cid=0x399be3005b551469:0x48b85293297db6d1",
    mapEmbedSrc: "https://maps.google.com/maps?q=Chinese+Chakhna+Vibhuti+Khand+Gomti+Nagar+Lucknow&output=embed",
    look: { bg: "#3a0a0c", bean: "#e8b23d", bump: 0.5, rough: 0.5, coat: 0.3, shape: "noodles" } satisfies Look,
  },

  footnote:
    "Chinese Chakhna: 100% Pure Vegetarian. Menu items and prices are from the restaurant's printed menu and may change; ask the staff to confirm. FSSAI Lic. No. 22724743000190. Photography and hero video from Pexels, used under its free licence.",
};
