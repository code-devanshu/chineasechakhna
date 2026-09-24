import * as THREE from "three";

/**
 * Round photo discs for the menu (public/dishes), sculpted into real 3D relief from an
 * approximate depth map (public/dishes/depth, built by scripts/generate-depth-maps.mjs) so the
 * food actually bulges toward the camera instead of sitting as a flat sticker. The disc turns
 * like a plate on a table; the relief is what makes that turn read as real depth instead of a
 * flat photo spinning in place.
 */
export type Dish = {
  object: THREE.Group;
  dispose: () => void;
};

const RINGS = 40;
const SEGMENTS = 72;
/** Max height of the relief, as a fraction of the disc's radius. */
const RELIEF = 0.17;

/**
 * A polar grid disc of radius 1: one centre vertex plus concentric rings, all flat (z=0) to
 * start. UV matches THREE.CircleGeometry's own convention ((x/r+1)/2, (y/r+1)/2) so a plain
 * photo texture lines up exactly as it did on the old CircleGeometry-based disc.
 */
function makeDiscGeometry(rings: number, segments: number): THREE.BufferGeometry {
  const positions: number[] = [0, 0, 0];
  const uvs: number[] = [0.5, 0.5];
  const indices: number[] = [];

  for (let r = 1; r <= rings; r++) {
    const t = r / rings;
    for (let s = 0; s < segments; s++) {
      const theta = (s / segments) * Math.PI * 2;
      const x = t * Math.cos(theta);
      const y = t * Math.sin(theta);
      positions.push(x, y, 0);
      uvs.push(0.5 + 0.5 * x, 0.5 + 0.5 * y);
    }
  }

  const ringBase = (r: number) => 1 + (r - 1) * segments;
  for (let s = 0; s < segments; s++) {
    indices.push(0, 1 + s, 1 + ((s + 1) % segments));
  }
  for (let r = 1; r < rings; r++) {
    const inner = ringBase(r);
    const outer = ringBase(r + 1);
    for (let s = 0; s < segments; s++) {
      const a = inner + s;
      const b = inner + ((s + 1) % segments);
      const c = outer + s;
      const d = outer + ((s + 1) % segments);
      indices.push(a, c, d, a, d, b);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Bilinear sample of the red channel of an RGBA buffer, u/v in [0,1], v=1 at the top of the image. */
function sampleDepth(data: Uint8ClampedArray, w: number, h: number, u: number, v: number): number {
  const fx = THREE.MathUtils.clamp(u, 0, 1) * (w - 1);
  const fy = THREE.MathUtils.clamp(1 - v, 0, 1) * (h - 1);
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
  const tx = fx - x0, ty = fy - y0;
  const px = (x: number, y: number) => data[(y * w + x) * 4];
  const top = px(x0, y0) * (1 - tx) + px(x1, y0) * tx;
  const bottom = px(x0, y1) * (1 - tx) + px(x1, y1) * tx;
  return (top * (1 - ty) + bottom * ty) / 255;
}

/** Loads a depth map and displaces the disc's vertices in place once it's ready. */
function applyRelief(geo: THREE.BufferGeometry, depthSrc: string): () => void {
  let cancelled = false;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    if (cancelled) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const d = sampleDepth(data, canvas.width, canvas.height, uv.getX(i), uv.getY(i));
      pos.setZ(i, d * RELIEF);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  };
  img.src = depthSrc;
  return () => {
    cancelled = true;
  };
}

/** A photo sculpted onto a disc of radius 1, lit gently so the relief reads without washing out the shot. */
export function makePhotoDish(src: string): Dish {
  const depthSrc = src.replace(/\/dishes\/([^/]+)\.\w+$/, "/dishes/depth/$1.png");

  const geo = makeDiscGeometry(RINGS, SEGMENTS);
  const cancelRelief = applyRelief(geo, depthSrc);

  const tex = new THREE.TextureLoader().load(src);
  tex.anisotropy = 8;
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    color: 0x808080,
    emissive: 0xffffff,
    emissiveMap: tex,
    emissiveIntensity: 0.62,
    roughness: 0.82,
    metalness: 0,
    transparent: true,
    side: THREE.DoubleSide,
    fog: false,
    toneMapped: false,
  });

  // A flat dark disc behind the relief gives it an edge and stops the back side from showing through.
  const backGeo = new THREE.CircleGeometry(1, 96);
  const backMat = new THREE.MeshBasicMaterial({ color: 0x120a06, fog: false });
  const back = new THREE.Mesh(backGeo, backMat);
  back.scale.setScalar(1.02);
  back.position.z = -0.02;

  const photo = new THREE.Mesh(geo, mat);
  const object = new THREE.Group();
  object.add(back, photo);

  return {
    object,
    dispose() {
      cancelRelief();
      geo.dispose();
      tex.dispose();
      mat.dispose();
      backGeo.dispose();
      backMat.dispose();
    },
  };
}
