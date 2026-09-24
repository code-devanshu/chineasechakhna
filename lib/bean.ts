import * as THREE from "three";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * SphereGeometry duplicates vertices along its seam and at the poles, which leaves a visible
 * line after we deform it. Average the normals of vertices that share a position.
 */
function smoothNormals(g: THREE.BufferGeometry) {
  g.computeVertexNormals();
  const p = g.attributes.position as THREE.BufferAttribute;
  const n = g.attributes.normal as THREE.BufferAttribute;
  const groups = new Map<string, { x: number; y: number; z: number; ids: number[] }>();

  for (let i = 0; i < p.count; i++) {
    const key = `${Math.round(p.getX(i) * 1e4)},${Math.round(p.getY(i) * 1e4)},${Math.round(p.getZ(i) * 1e4)}`;
    let e = groups.get(key);
    if (!e) {
      e = { x: 0, y: 0, z: 0, ids: [] };
      groups.set(key, e);
    }
    e.x += n.getX(i);
    e.y += n.getY(i);
    e.z += n.getZ(i);
    e.ids.push(i);
  }

  groups.forEach((e) => {
    const l = Math.hypot(e.x, e.y, e.z) || 1;
    for (const id of e.ids) n.setXYZ(id, e.x / l, e.y / l, e.z / l);
  });
  n.needsUpdate = true;
}

/** A coffee bean: flat face with a wandering crease, domed back, slight lumps. Length is 2 units. */
export function makeBeanGeometry(): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, 96, 64);
  const p = g.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);

    const wob = Math.sin(y * 3.1) * 0.08 + Math.sin(y * 8 + 1.3) * 0.012; // crease wanders a little
    const dx = x - wob;
    const taper = Math.pow(Math.max(0, 1 - y * y), 0.6); // crease fades toward the tips
    const face = smoothstep(0, 0.35, z); // only on the flat face
    const groove = Math.exp(-(dx * dx) / (2 * 0.06 * 0.06)) * taper * face;
    const lip = Math.exp(-Math.pow(Math.abs(dx) - 0.13, 2) / (2 * 0.04 * 0.04)) * taper * face;

    let zz = z > 0 ? z * 0.32 : z * 0.62; // flat face, domed back
    zz += -0.09 * groove + 0.02 * lip;

    const lump = 1 + 0.02 * Math.sin(x * 5 + y * 3 + 1) * Math.sin(z * 4 - y * 2);
    p.setXYZ(i, x * 0.72 * lump, y * lump, zz * lump);
  }

  smoothNormals(g);
  return g;
}

/** Soft random blotches used as a bump map so roasted beans look wrinkled. Browser only. */
export function makeWrinkleTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, c.width, c.height);

  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * c.width;
    const y = Math.random() * c.height;
    const r = 2 + Math.random() * 13;
    const col = Math.random() > 0.5 ? "255,255,255" : "0,0,0";
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${col},${0.06 + Math.random() * 0.12})`);
    grad.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
