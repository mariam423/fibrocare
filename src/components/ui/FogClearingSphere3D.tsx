"use client";

/**
 * FogClearingSphere3D — the Fog Shield's "cognitive-weather" visual.
 *
 * On screen it reads as the patient's brain fog: a dense, jittery, grey
 * particle cloud swirling inside a wide sphere. A `calm` prop in [0, 1]
 * drives a smooth transition — as the patient works a grounding exercise
 * (breath reset, brain dump, micro-task split, or SOS settle), the cloud
 * condenses, slows, and brightens into a serene teal shell, and a calm
 * gold core breathes into view. Calm = clear; fog = dense chaos.
 *
 * Progressive-enhancement contract (mirrors CalmResonance3D / CycleOrbit3D):
 *  - SSR, reduced motion, or no WebGL → a static inline-SVG rendition of
 *    the current calm level renders instead; the fallback stays mounted
 *    until the WebGL scene is actually live, so there is no blank flash.
 *  - `three` is imported lazily inside an effect — never in the server
 *    bundle — and the effect is a no-op when WebGL is unavailable.
 *  - The wrapper is `pointer-events-none` and decorative (`aria-hidden`):
 *    it cannot steal touches or block scrolling.
 *  - Pixel ratio is capped, the loop pauses offscreen/hidden, `calm` moves
 *    toward its target by a smooth exponential (no teleporting), and the
 *    renderer is fully disposed on unmount.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";

type ThreeModule = typeof import("three");

// Type-only namespace for annotations (erased at compile time, so it never
// pulls the library into the server bundle).
import type * as THREE from "three";

const ICON_HEIGHT = 190;

// Palette: fog grey-sage → serene teal, with the gold "calm" core.
const FOG_COLOR = 0x9db4ac;
const CALM_COLOR = 0x5eead4;
const GOLD = 0xfbbf24;

const PARTICLES = 420;
const FOG_RADIUS = 1.32;
const CLEAR_RADIUS = 0.56;
const RING_A_RADIUS = 0.86;
const RING_B_RADIUS = 1.06;

interface Disposable {
  dispose(): void;
}

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/** Soft radial glow texture shared by the particles and the aura. */
function makeGlowTexture(THREE: ThreeModule) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.32, "rgba(255,255,255,0.6)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

/** Soft radial halo sprite (aura + core glow). */
function makeHalo(
  THREE: ThreeModule,
  color: number,
  opacity: number,
  size: number
) {
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(THREE),
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  sprite.scale.set(size, size, 1);
  return sprite;
}

/**
 * `getCalm` is read every frame (the component keeps a ref of the latest
 * prop, so the scene never restarts on prop change). Returns the cleanup.
 */
function initField(
  canvas: HTMLCanvasElement,
  THREE: ThreeModule,
  getCalm: () => number
): () => void {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
  camera.position.set(0, 0, 3.05);

  const light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(1.5, 2, 2.5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(CALM_COLOR, 0.4));

  const root = new THREE.Group();
  scene.add(root);

  // Soft aura behind the whole cloud.
  root.add(makeHalo(THREE, CALM_COLOR, 0.1, 3.2));

  // ── Particle cloud (Brain Fog). One Points object is far cheaper than
  //    hundreds of sprites; per-frame math moves points radially so the
  //    whole field condenses/settles as `calm` rises.
  const positions = new Float32Array(PARTICLES * 3);
  const seeds: Array<{
    dirX: number;
    dirY: number;
    dirZ: number;
    phase: number;
    speed: number;
  }> = [];

  for (let i = 0; i < PARTICLES; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    seeds.push({
      dirX: Math.sin(phi) * Math.cos(theta),
      dirY: Math.cos(phi),
      dirZ: Math.sin(phi) * Math.sin(theta),
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * 0.8,
    });
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    map: makeGlowTexture(THREE),
    color: FOG_COLOR,
    size: 0.13,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  root.add(points);

  // ── Calm core: asleep under the fog, breathes in as the cloud clears.
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 20, 16),
    new THREE.MeshPhysicalMaterial({
      color: GOLD,
      emissive: GOLD,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.05,
      metalness: 0.3,
      roughness: 0.3,
      clearcoat: 0.6,
      clearcoatRoughness: 0.35,
      toneMapped: false,
    })
  );
  root.add(core);
  const coreHalo = makeHalo(THREE, GOLD, 0.05, 0.9);
  core.add(coreHalo);

  // ── Settling rings: appear and relax as the fog clears.
  const ringAMat = new THREE.MeshBasicMaterial({
    color: CALM_COLOR,
    transparent: true,
    opacity: 0,
    toneMapped: false,
  });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(RING_A_RADIUS, 0.016, 10, 72), ringAMat);
  ringA.rotation.x = 0.5;
  root.add(ringA);

  const ringBMat = new THREE.MeshBasicMaterial({
    color: CALM_COLOR,
    transparent: true,
    opacity: 0,
    toneMapped: false,
  });
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(RING_B_RADIUS, 0.012, 10, 84), ringBMat);
  ringB.rotation.set(-0.28, 0.6, 0.2);
  root.add(ringB);

  const colorA = new THREE.Color(FOG_COLOR);
  const colorB = new THREE.Color(CALM_COLOR);
  const lerped = new THREE.Color();

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth || 1);
    const height = Math.max(1, canvas.clientHeight || 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  ro?.observe(canvas);

  let visible = true;
  let raf = 0;
  let last = 0;
  // Smoothed calm (target from props; eased here so movement never jumps).
  let calmSmoothed = 0;

  const stop = () => {
    visible = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
  const start = () => {
    if (visible) return;
    visible = true;
    last = 0;
    raf = requestAnimationFrame(loop);
  };

  const io =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting ?? true) start();
            else stop();
          },
          { threshold: 0.1 }
        )
      : null;
  io?.observe(canvas);

  const onVisibility = () => {
    if (document.visibilityState === "visible") start();
    else stop();
  };
  document.addEventListener("visibilitychange", onVisibility);

  function loop(time: number) {
    if (!visible) return;
    raf = requestAnimationFrame(loop);
    const dt = last ? Math.min(0.05, (time - last) / 1000) : 0.016;
    last = time;
    const t = time / 1000;

    // Ease toward the target calm — fast enough to feel responsive, slow
    // enough to read as "the fog is lifting" rather than a jump cut.
    const target = Math.min(1, Math.max(0, getCalm()));
    calmSmoothed += (target - calmSmoothed) * (1 - Math.exp(-dt * 2.4));
    const c = calmSmoothed;

    // Swirl slows as calm rises (fog is chaotic, clarity is still).
    root.rotation.y += dt * (0.12 + (1 - c) * 0.55);

    // ── Particle field: condense 1.32 → 0.56 as calm rises, with turbulence
    //    that fades out — the cloud settles into a serene shell.
    const rad = FOG_RADIUS + (CLEAR_RADIUS - FOG_RADIUS) * c;
    const breath = 1 + 0.035 * Math.sin(t * 0.55);
    const attr = geometry.attributes.position as THREE.BufferAttribute;
    const pos = attr.array as Float32Array;
    for (let i = 0; i < PARTICLES; i += 1) {
      const s = seeds[i];
      const turb =
        (1 - c) *
        (0.17 * Math.sin(t * s.speed * 0.9 + s.phase) +
          0.11 * Math.cos(t * s.speed * 0.6 + s.phase * 1.7));
      const r = rad * breath * (1 + turb);
      pos[i * 3] = s.dirX * r;
      pos[i * 3 + 1] = s.dirY * r;
      pos[i * 3 + 2] = s.dirZ * r;
    }
    attr.needsUpdate = true;

    // Fog particles shrink + soften as the cloud clears.
    material.opacity = 0.9 - c * 0.5;
    material.size = 0.13 - c * 0.035;
    lerped.copy(colorA).lerp(colorB, c);
    material.color.copy(lerped);

    // The gold core emerges and breathes once the fog settles.
    core.material.opacity = 0.05 + c * 0.85;
    const coreBreath = 1 + 0.1 * Math.sin(t * 1.6);
    core.scale.setScalar(coreBreath);
    coreHalo.material.opacity = 0.05 + c * 0.9;
    coreHalo.scale.setScalar(0.9 * (1 + 0.12 * Math.sin(t * 1.6 + 0.6)));

    // Settling rings fade in and relax their counter-phase breath.
    const ringOpacity = c * (0.24 + 0.16 * Math.sin(t * 0.5));
    ringAMat.opacity = ringOpacity;
    ringA.scale.setScalar(0.86 + 0.1 * (1 - c) + 0.05 * Math.sin(t * 0.5));
    ringBMat.opacity = c * (0.16 + 0.12 * Math.sin(t * 0.5 + 0.9));
    ringB.scale.setScalar(0.9 + 0.08 * (1 - c) - 0.04 * Math.sin(t * 0.5));

    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(loop);

  return () => {
    stop();
    ro?.disconnect();
    io?.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    scene.traverse((obj) => {
      const instance = obj as unknown as {
        geometry?: Disposable;
        material?: Disposable | Disposable[];
      };
      instance.geometry?.dispose();
      const materials = Array.isArray(instance.material)
        ? instance.material
        : instance.material
          ? [instance.material]
          : [];
      for (const material of materials) {
        // PointsMaterial / SpriteMaterials carry a glow `map` texture that
        // is NOT released by `dispose()` — drop it explicitly so rapid SPA
        // remounts do not accumulate GPU textures.
        const texture = (material as unknown as { map?: Disposable }).map;
        texture?.dispose();
        material.dispose();
      }
    });
    renderer.dispose();
    // Release the raw WebGL context; `dispose()` alone can leave the
    // context resident and leak VRAM across remounts.
    renderer.forceContextLoss?.();
  };
}

export interface FogClearingSphere3DProps {
  className?: string;
  /** 0 = dense fog, 1 = clear and serene. Eased on the GPU/JS thread. */
  calm?: number;
}

export function FogClearingSphere3D({
  className,
  calm = 0,
}: FogClearingSphere3DProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  // Always read the latest prop without restarting the scene.
  const calmRef = React.useRef(calm);
  React.useEffect(() => {
    calmRef.current = calm;
  }, [calm]);

  const motion = useMotionEnabled();
  const [webgl] = React.useState(() => isWebGLAvailable());
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!motion || !webgl || !canvas) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    void import("three")
      .then((THREE) => {
        if (cancelled || !canvas.isConnected) return;
        // Context creation can fail even after the probe succeeds (e.g. a
        // worker-restricted or memory-starved browser) — keep the SVG
        // fallback mounted instead of surfacing a rejected promise.
        dispose = initField(canvas, THREE, () => calmRef.current);
        setLive(true);
      })
      .catch(() => {
        // Fallback stays mounted; failure is invisible to the user.
      });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [motion, webgl]);

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn(
        "pointer-events-none relative mx-auto w-full overflow-hidden select-none",
        className
      )}
      style={{ height: ICON_HEIGHT }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      {!live && <FogClearingFallback calm={calm} />}
    </div>
  );
}

/** Static SVG rendition of the fog→clear transition (no WebGL / motion). */
function FogClearingFallback({ calm }: { calm: number }) {
  const uid = React.useId().replace(/:/g, "");
  const c = Math.min(1, Math.max(0, calm));

  // Dots spread wide + opaque when foggy; condense + dim as calm rises.
  const DOTS = 34;
  const dots = Array.from({ length: DOTS }, (_, i) => {
    const a = (i / DOTS) * Math.PI * 2;
    const cx = 80 + Math.cos(a) * (Math.sin(i) * 30 + 62) * 0.85 * (1 - c * 0.45);
    const cy = 66 + Math.sin(a) * (Math.cos(i * 1.3) * 26 + 52) * (1 - c * 0.45);
    const r = (1.8 - c * 0.8) * Math.max(0.7, 1 - (i % 5) * 0.08);
    return { cx, cy, r, o: Math.min(1, Math.max(0.25, 0.85 - c * 0.45 + (i % 3) * 0.1)) };
  });

  return (
    <svg
      viewBox="0 0 160 190"
      className="absolute inset-0 mx-auto h-full w-auto max-w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`fibro-fog-teal-${uid}`}>
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`fibro-fog-gold-${uid}`}>
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.5 + c * 0.4} />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="95" rx="70" ry="62" fill={`url(#fibro-fog-teal-${uid})`} />

      {/* Fog particles */}
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill={i % 4 === 0 ? "#a8bcb5" : "#5eead4"}
          opacity={d.o}
        />
      ))}

      {/* Settling rings fade in as calm rises */}
      <ellipse
        cx="80"
        cy="95"
        rx={47 + (1 - c) * 8}
        ry={30 + (1 - c) * 6}
        fill="none"
        stroke="#5eead4"
        strokeWidth="1.6"
        opacity={0.15 + c * 0.55}
      />
      <ellipse
        cx="80"
        cy="95"
        rx={61 + (1 - c) * 6}
        ry={40 + (1 - c) * 5}
        fill="none"
        stroke="#5eead4"
        strokeWidth="1.1"
        opacity={c * 0.5}
      />

      {/* Calm core emerges as the fog clears */}
      <circle cx="80" cy="95" r={9 + (1 - c) * 2} fill="#fbbf24" opacity={0.12 + c * 0.85} />
      <circle cx="80" cy="95" r={15 + (1 - c) * 3} fill={`url(#fibro-fog-gold-${uid})`} />
    </svg>
  );
}