import * as THREE from "three";
import { makeBeanGeometry, makeWrinkleTexture } from "./bean";
import { makePhotoDish } from "./dishes";
import { SHAPES, type Keyframe, type Rgb } from "./roast";

/* ---------- small helpers ---------- */
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const CAM_Z = 8;
const FOV = 32;

type Pose = {
  x: number;
  y: number;
  s: number;
  lift: number;
  spin: number;
  bump: number;
  rough: number;
  coat: number;
  /** How present each object in SHAPES is, 0 to 1. */
  w: number[];
  bg: Rgb;
  bean: Rgb;
};

type FloatingBean = {
  nx: number;
  ny: number;
  z: number;
  size: number;
  tone: number;
  rs: number;
  r0: number;
};

type Rig = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  group: THREE.Group;
  mesh: THREE.Mesh;
  mat: THREE.MeshPhysicalMaterial;
  /** One entry per SHAPES item: the node to show or hide and scale, and its full-size scale. */
  slots: { node: THREE.Object3D; size: number; spin: "z" | "sway" }[];
  keyLight: THREE.DirectionalLight;
  small: THREE.InstancedMesh;
  floating: FloatingBean[];
  dispose: () => void;
};

/**
 * Builds the WebGL scene. three.js r155+ uses physically based light units, so intensities are
 * multiplied by PI to match the look of the standalone version. Colour management is switched
 * off so the hex colours in content.ts show up exactly as written.
 */
function createRig(canvas: HTMLCanvasElement, vw: number, vh: number): Rig {
  THREE.ColorManagement.enabled = false;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, vw < 760 ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x16382f, 9, 16);

  const camera = new THREE.PerspectiveCamera(FOV, vw / vh, 0.1, 50);
  camera.position.set(0, 0, CAM_Z);

  scene.add(new THREE.HemisphereLight(0xfff0dd, 0x1a1a2a, 0.6 * Math.PI));
  const keyLight = new THREE.DirectionalLight(0xffe0b5, 1.4 * Math.PI);
  keyLight.position.set(3, 4, 6);
  scene.add(keyLight);
  const rim = new THREE.DirectionalLight(0x9ad7ff, 1.0 * Math.PI);
  rim.position.set(-5, 2, -4);
  scene.add(rim);
  const fill = new THREE.PointLight(0xffb27a, 0.6 * Math.PI, 20, 0);
  fill.position.set(0, -3, 4);
  scene.add(fill);

  const geo = makeBeanGeometry();
  const bump = makeWrinkleTexture();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x98582d,
    roughness: 0.45,
    metalness: 0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    bumpMap: bump,
    bumpScale: 0.8,
  });
  const mesh = new THREE.Mesh(geo, mat);
  // The main bean is no longer the star of any section; only the floating ones remain
  const photos = ["momo", "noodles", "chaap", "biryani", "platter"].map((n) => makePhotoDish(`/dishes/${n}.webp`));
  const group = new THREE.Group();
  photos.forEach((p) => group.add(p.object));
  scene.add(group);
  // One slot per SHAPES item. Most discs turn like a turntable; the platter only sways.
  const slots: Rig["slots"] = [
    { node: photos[0].object, size: 1.05, spin: "z" },
    { node: photos[1].object, size: 1.0, spin: "z" },
    { node: photos[2].object, size: 1.0, spin: "z" },
    { node: photos[3].object, size: 0.95, spin: "z" },
    { node: photos[4].object, size: 0.95, spin: "sway" },
  ];

  // Background beans
  const count = vw < 760 ? 6 : 32;
  const smat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
  const small = new THREE.InstancedMesh(geo, smat, count);
  small.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  small.frustumCulled = false;
  scene.add(small);

  const floating: FloatingBean[] = Array.from({ length: count }, () => ({
    nx: rand(-1, 1),
    ny: Math.random(),
    z: vw < 760 ? rand(-5, -1.5) : rand(-5, 1.2),
    size: rand(0.05, 0.13) * (vw < 760 ? 0.55 : 1),
    tone: rand(0.55, 0.9),
    rs: rand(-0.6, 0.6),
    r0: rand(0, 6.28),
  }));

  return {
    renderer,
    scene,
    camera,
    group,
    mesh,
    mat,
    slots,
    keyLight,
    small,
    floating,
    dispose() {
      geo.dispose();
      bump.dispose();
      mat.dispose();
      photos.forEach((p) => p.dispose());
      smat.dispose();
      small.dispose();
      renderer.dispose();
    },
  };
}

/**
 * Starts the whole experience and returns a cleanup function.
 *
 * It looks for `[data-stop]` sections (one per keyframe, in page order) and `.word` headings in
 * the DOM, then on every frame: blends the bean pose and page colour between the two sections
 * around the middle of the viewport, animates the giant words, and applies the mouse.
 * If WebGL is unavailable the colour and typography effects still run.
 */
export function startScene(canvas: HTMLCanvasElement, keyframes: Keyframe[]): () => void {
  if (keyframes.length === 0) return () => {};

  const root = document.documentElement;
  const body = document.body;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stops = Array.from(document.querySelectorAll<HTMLElement>("[data-stop]"));
  const words = Array.from(document.querySelectorAll<HTMLElement>(".word"));

  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let Kn: Keyframe[] = keyframes;
  let anchors: number[] = [];
  let halfH = 1;
  let halfW = 1;
  let alive = true;
  let raf = 0;

  let rig: Rig | null = null;
  try {
    rig = createRig(canvas, vw, vh);
  } catch (err) {
    console.warn("3D layer disabled:", err);
    canvas.style.display = "none";
  }

  /* ---------- layout ---------- */
  function measure() {
    if (!alive) return;
    vw = window.innerWidth;
    vh = window.innerHeight;
    const mobile = vw < 760 || vw / vh < 0.8;

    // On phones the dish sits at the top of each section with the copy underneath. The hero
    // shows no dish at all, and neither does the last section (a long form and map, so a fixed
    // dish would sit behind the copy), leaving the giant title and the copy the screen.
    Kn = keyframes.map((k, i) =>
      mobile ? { ...k, x: 0, y: 0.36, s: i === 0 || i === keyframes.length - 1 ? 0 : 0.56 } : k
    );

    if (rig) {
      rig.renderer.setSize(vw, vh, false);
      rig.camera.aspect = vw / vh;
      rig.camera.updateProjectionMatrix();
      halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
      halfW = halfH * rig.camera.aspect;
    }

    const sy = window.scrollY;
    anchors = stops.map((s) => {
      const top = s.getBoundingClientRect().top + sy;
      return top + Math.min(s.offsetHeight, vh * 1.1) / 2;
    });
  }

  /* ---------- state ---------- */
  const first = keyframes[0];
  const cur: Pose = {
    x: 0,
    y: reduce ? first.y : -0.35,
    s: reduce ? first.s : 0.02,
    lift: 0,
    spin: reduce ? 0 : -1.5, // the bean rolls in on load
    bump: first.bump,
    rough: first.rough,
    coat: first.coat,
    w: SHAPES.map((_, n) => (n === first.shape ? 1 : 0)),
    bg: [...first.bg],
    bean: [...first.bean],
  };
  const tar: Pose = { ...cur, w: [...cur.w], bg: [0, 0, 0], bean: [0, 0, 0] };

  const target = { x: 0, y: 0 };
  const smoothPointer = { x: 0, y: 0 };
  let lastX: number | null = null;
  let spinVel = 0;
  let spinAngle = 0;

  const onPointerMove = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = -((e.clientY / window.innerHeight) * 2 - 1);
    if (!reduce && lastX !== null) {
      spinVel = clamp(spinVel + (e.clientX - lastX) * 0.05, -8, 8);
    }
    lastX = e.clientX;
  };
  const onPointerLeave = () => {
    lastX = null;
  };

  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();
  const numericKeys = ["x", "y", "s", "lift", "spin", "bump", "rough", "coat"] as const;

  /* ---------- frame loop ---------- */
  let last = performance.now();

  function frame(now: number) {
    if (!alive) return;
    raf = requestAnimationFrame(frame);

    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const k = reduce ? 1 : 1 - Math.exp(-dt * 5.5);
    const pk = 1 - Math.exp(-dt * 4);
    smoothPointer.x += (target.x - smoothPointer.x) * pk;
    smoothPointer.y += (target.y - smoothPointer.y) * pk;

    // Which two sections is the middle of the screen between, and how far along?
    const sy = window.scrollY;
    const vc = sy + vh / 2;
    let i = 0;
    for (let n = 0; n < anchors.length - 1; n++) {
      if (vc >= anchors[n + 1]) i = n + 1;
    }
    const ia = Math.min(i, Kn.length - 1);
    const ib = Math.min(i + 1, Kn.length - 1);
    const t = i < anchors.length - 1 ? clamp((vc - anchors[i]) / (anchors[i + 1] - anchors[i]), 0, 1) : 0;
    const te = smoother(clamp((t - 0.22) / 0.56, 0, 1)); // rest at each stop, travel in the middle
    const a = Kn[ia];
    const b = Kn[ib];

    tar.x = lerp(a.x, b.x, te);
    tar.y = lerp(a.y, b.y, te);
    tar.s = lerp(a.s, b.s, te);
    tar.lift = Math.sin(te * Math.PI);
    tar.spin = i + te; // one full turn per section
    tar.bump = lerp(a.bump, b.bump, te);
    tar.rough = lerp(a.rough, b.rough, te);
    tar.coat = lerp(a.coat, b.coat, te);
    for (let n = 0; n < SHAPES.length; n++) {
      tar.w[n] = (n === a.shape ? 1 - te : 0) + (n === b.shape ? te : 0);
      cur.w[n] += (tar.w[n] - cur.w[n]) * k;
    }
    for (let c = 0; c < 3; c++) {
      tar.bg[c] = lerp(a.bg[c], b.bg[c], te);
      tar.bean[c] = lerp(a.bean[c], b.bean[c], te);
    }

    for (const key of numericKeys) cur[key] += (tar[key] - cur[key]) * k;
    for (let c = 0; c < 3; c++) {
      cur.bg[c] += (tar.bg[c] - cur.bg[c]) * k;
      cur.bean[c] += (tar.bean[c] - cur.bean[c]) * k;
    }

    // Page background follows the roast
    const bgCss = `rgb(${Math.round(cur.bg[0])},${Math.round(cur.bg[1])},${Math.round(cur.bg[2])})`;
    body.style.backgroundColor = bgCss;
    root.style.backgroundColor = bgCss;

    // Giant words: thin and narrow at the screen edges, heavy and wide at the centre
    for (const w of words) {
      const sec = w.closest("[data-stop]");
      if (!sec) continue;
      const r = sec.getBoundingClientRect();
      const q = clamp((vh - r.top) / (vh + r.height), 0, 1);
      const e = Math.sin(q * Math.PI);
      w.style.fontVariationSettings = `"wdth" ${(75 + 25 * e).toFixed(1)}, "wght" ${Math.round(300 + 500 * e)}`;
      const shift = reduce ? 0 : (q - 0.5) * -6 + smoothPointer.x * -1.2;
      w.style.transform = `translate3d(${shift.toFixed(2)}vw,0,0)`;
    }

    if (!rig) return;
    const { renderer, scene, camera, group, mat, slots, keyLight, small, floating } = rig;

    const time = reduce ? 0 : now / 1000;
    spinVel *= Math.exp(-dt * 1.8);
    spinAngle += spinVel * dt;

    // Main bean
    const idle = Math.sin(time * 0.9) * 0.03;
    group.position.set(cur.x * halfW, (cur.y + idle) * halfH, cur.lift * 1.4);
    group.scale.setScalar(Math.max(0.001, cur.s * halfH * 0.5 * (1 + cur.lift * 0.08)));
    group.rotation.set(
      -smoothPointer.y * 0.35 + 0.12 + cur.lift * 0.2, // tilt toward the cursor
      smoothPointer.x * 0.5,
      -0.45 + cur.x * 0.35 + Math.sin(time * 0.6) * 0.04
    );
    const turn = cur.spin * Math.PI * 2 + spinAngle * 0.6;

    // The outgoing object shrinks away as the incoming one grows in
    slots.forEach((slot, n) => {
      const w = smoothstep(0.5, 1, cur.w[n]);
      slot.node.visible = w > 0.01;
      slot.node.scale.setScalar(Math.max(0.001, w * slot.size));
      if (slot.spin === "z") slot.node.rotation.z = turn;
      else slot.node.rotation.y = Math.sin(time * 0.8) * 0.25;
    });

    mat.color.setRGB(cur.bean[0] / 255, cur.bean[1] / 255, cur.bean[2] / 255);
    mat.roughness = cur.rough;
    mat.clearcoat = cur.coat;
    mat.bumpScale = cur.bump;

    // The highlight follows the mouse
    keyLight.position.set(3 + smoothPointer.x * 3, 4 + smoothPointer.y * 2, 6);

    (scene.fog as THREE.Fog).color.setRGB(cur.bg[0] / 255, cur.bg[1] / 255, cur.bg[2] / 255);

    // Background beans drift up at different speeds and shift with the mouse by depth
    const yPerPx = (2 * halfH) / vh;
    for (let m = 0; m < floating.length; m++) {
      const d = floating[m];
      const close = (d.z + 5) / 6.2;
      const visW = (halfW * (CAM_Z - d.z)) / CAM_Z;
      const visH = (halfH * (CAM_Z - d.z)) / CAM_Z;
      const range = visH * 2.7;
      const rate = 0.12 + 0.45 * close;
      const base = d.ny * range + sy * yPerPx * rate;
      const py = (((base % range) + range) % range) - range / 2 - smoothPointer.y * 0.2 * close;
      const px = d.nx * visW * 1.05 - smoothPointer.x * 0.35 * close;

      dummy.position.set(px, py, d.z);
      dummy.rotation.set(d.r0 + time * d.rs + sy * 0.0015, d.r0 * 1.7 + time * d.rs * 0.7, d.r0 * 0.6);
      dummy.scale.setScalar(d.size * halfH);
      dummy.updateMatrix();
      small.setMatrixAt(m, dummy.matrix);

      tmpColor.setRGB((cur.bean[0] / 255) * d.tone, (cur.bean[1] / 255) * d.tone, (cur.bean[2] / 255) * d.tone);
      small.setColorAt(m, tmpColor);
    }
    small.instanceMatrix.needsUpdate = true;
    if (small.instanceColor) small.instanceColor.needsUpdate = true;

    renderer.render(scene, camera);
  }

  /* ---------- go ---------- */
  measure();
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  document.fonts?.ready.then(measure);
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
  ro?.observe(body);
  raf = requestAnimationFrame(frame);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("resize", measure);
    window.removeEventListener("load", measure);
    ro?.disconnect();
    rig?.dispose();
  };
}
