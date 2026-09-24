# Chinese Chakhna: 3D scroll restaurant site (Next.js)

A Next.js (App Router, TypeScript) restaurant site with a 3D dish that turns, changes with each menu
section and reacts to your mouse as you scroll. Built with three.js, no extra animation libraries.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

Needs Node 18.18 or newer.

## Make it your own

Everything you will normally edit is in **`lib/content.ts`**: name, tagline, menu sections, items, prices,
hours, address, and the colours for every section. Add or remove an entry in `stages` and the dish gets a new
stop automatically — but note the 3D dish itself is one of five fixed photos (`public/dishes/*.webp`), so a
new stage needs to reuse one of the five `shape` values (`momo`, `noodles`, `chaap`, `biryani`, `platter`).

| File | What it does |
| --- | --- |
| `lib/content.ts` | All copy, menu data and per-section colours |
| `lib/roast.ts` | Turns content into keyframes (position, size, colours) |
| `lib/bean.ts` | Builds the floating ember shape in code |
| `lib/scene.ts` | three.js scene, scroll blending, mouse interaction, cleanup |
| `lib/dishes.ts` | Sculpts each dish photo into a 3D relief disc |
| `components/BeanScene.tsx` | The only client component: mounts the canvas |
| `components/Sections.tsx`, `Nav.tsx` | Server-rendered page sections |
| `app/globals.css` | All styling |

## How it works

- Every section has `data-stop`. On each frame the scene finds the two sections around the middle of the
  screen and blends the dish's pose and page colour between them, resting at each section while you read.
- The huge words behind the dish are normal `<h1>`/`<h2>` elements. Their width and weight axes are driven by
  scroll position (Bricolage Grotesque is a variable font).
- The mouse tilts the dish, moves the light, and a fast horizontal swipe adds spin.
- `prefers-reduced-motion` turns off idle motion, mouse spin and drift. If WebGL fails, the colour and
  typography effects still work.

## Notes

- Section text is always light, so keep every `bg` colour dark enough for it (about 4.5:1 contrast).
- If the dish looks too bright or too dark after changing colours, adjust the light intensities in
  `createRig` in `lib/scene.ts`.
- Contact details, address and hours are
  placeholders — replace them with the real ones before going live.
- The five dish photos in `public/dishes/` and the four mood photos in `public/story/` are free-licence stock
  photography from Pexels, chosen to match the menu. Swap in real photos of the actual dishes and restaurant
  whenever you have them — run `node scripts/generate-depth-maps.mjs` again after replacing any file in
  `public/dishes/`.
# chinese-chakhna
