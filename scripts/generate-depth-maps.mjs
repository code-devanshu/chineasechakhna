// One-off generator: builds an approximate relief/depth map for each dish photo in
// public/dishes, so the 3D scene can bulge the flat photo discs into real geometry.
//
// There's no real depth sensor data for these photos, so we fake it from two cues that
// hold up well for macro food photography shot from above or straight on:
//   - large-scale brightness (blurred luminance): glossy/lit food surfaces (cheese, sauce,
//     foam, whipped cream) read brighter and are usually the parts closest to the camera.
//   - local sharpness (small blur minus large blur): in-focus regions carry more
//     high-frequency detail than out-of-focus background/bokeh, so this doubles as a
//     cheap "focus distance" cue for the shots with shallow depth of field.
// Both are combined, then faded to zero at the outer ~15% of the circle so the relief
// always meets the flat disc rim with no visible seam.
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, "..", "public", "dishes");
const OUT_DIR = path.join(SRC_DIR, "depth");
const SIZE = 256;
const DISHES = ["momo", "noodles", "chaap", "biryani", "platter"];

async function rawGray(input, blurSigma) {
  let img = sharp(input).resize(SIZE, SIZE, { fit: "cover" }).greyscale();
  if (blurSigma) img = img.blur(blurSigma);
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });
  return data; // Uint8Array, length SIZE*SIZE
}

function normalize(arr) {
  let lo = 255, hi = 0;
  for (const v of arr) { if (v < lo) lo = v; if (v > hi) hi = v; }
  const span = Math.max(1, hi - lo);
  const out = new Float32Array(arr.length);
  for (let i = 0; i < arr.length; i++) out[i] = (arr[i] - lo) / span;
  return out;
}

// A resample (blur/resize) chained onto a sharp() pipeline built from a raw single-channel
// buffer comes out corrupted with this sharp/libvips build (confirmed by reproduction: reading
// raw bytes out of a file-sourced pipeline is fine, and writing raw bytes straight to PNG is
// fine, but re-ingesting a raw single-channel buffer as input to a further resize/blur produces
// horizontal banding). So the extra smoothing pass on the detail-energy map is done by hand here
// instead of round-tripping it through sharp again.
function boxBlur(src, w, h, radius) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const win = radius * 2 + 1;
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -radius; x <= radius; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / win;
      const addX = Math.min(w - 1, x + radius + 1);
      const dropX = Math.max(0, x - radius);
      acc += src[y * w + addX] - src[y * w + dropX];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -radius; y <= radius; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / win;
      const addY = Math.min(h - 1, y + radius + 1);
      const dropY = Math.max(0, y - radius);
      acc += tmp[addY * w + x] - tmp[dropY * w + x];
    }
  }
  return out;
}

function edgeFalloff(x, y) {
  const nx = (x / (SIZE - 1)) * 2 - 1;
  const ny = (y / (SIZE - 1)) * 2 - 1;
  const t = Math.sqrt(nx * nx + ny * ny);
  const start = 0.82, end = 1.0;
  if (t <= start) return 1;
  if (t >= end) return 0;
  const f = (t - start) / (end - start);
  return 1 - f * f * (3 - 2 * f); // smoothstep, inverted
}

async function buildOne(name) {
  const src = path.join(SRC_DIR, `${name}.webp`);

  const big = normalize(await rawGray(src, SIZE * 0.05));
  const small = await rawGray(src, 1.1);
  const large = await rawGray(src, SIZE * 0.05);
  // Smooth the raw per-pixel detail energy into soft blobs rather than noisy speckle.
  const detailRaw = new Float32Array(SIZE * SIZE);
  for (let i = 0; i < detailRaw.length; i++) detailRaw[i] = Math.abs(small[i] - large[i]) * 3;
  const detail = normalize(boxBlur(detailRaw, SIZE, SIZE, Math.round(SIZE * 0.02)));

  const out = Buffer.alloc(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = y * SIZE + x;
      const h = 0.6 * big[i] + 0.4 * detail[i];
      const shaped = Math.pow(Math.min(1, Math.max(0, h)), 0.88);
      out[i] = Math.round(shaped * edgeFalloff(x, y) * 255);
    }
  }

  await sharp(out, { raw: { width: SIZE, height: SIZE, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, `${name}.png`));
  console.log(`wrote depth/${name}.png`);
}

await import("node:fs/promises").then((fs) => fs.mkdir(OUT_DIR, { recursive: true }));
for (const name of DISHES) await buildOne(name);
