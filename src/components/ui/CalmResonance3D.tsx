"use client";

/**
 * CalmResonance3D — a small decorative 3D "nervous-system resonance" field for
 * the flare-forecast card's calm state. Where CycleOrbit3D reads the monthly
 * cycle through orbiting rings, this reads restful balance: a translucent teal
 * sphere whose surface ripples with slow layered sine waves (cellular
 * harmonization), a single gold resonant core at its center, two concentric
 * "relaxation wave" rings breathing in counter-phase (the exhale-inhale of the
 * parasympathetic system), and a sparse drift of bio-luminescent motes around
 * the shell.
 *
 * It deliberately shares the CycleOrbit3D visual family — Midnight Emerald
 * palette, additive glow sprites, ACES tone-mapped, gentle breathing — without
 * duplicating its composition (no tilted orbit rings, no nodes riding a ring,
 * no ovum).
 *
 * Progressive-enhancement contract (mirrors CycleOrbit3D / AnatomicalBody3D):
 *  - SSR, reduced motion, or no WebGL → a static inline-SVG resonance graphic
 *    renders instead; the fallback stays mounted until the WebGL scene is
 *    actually live, so there is no blank flash while `three` loads.
 *  - `three` is imported lazily inside an effect — never in the server
 *    bundle — and the effect is a no-op when WebGL is unavailable.
 *  - The wrapper is `pointer-events-none` and decorative (`aria-hidden`):
 *    it cannot steal touches, block scrolling, or sit on top of the fixed
 *    PWA install prompt.
 *  - Pixel ratio is capped, the render loop pauses offscreen/hidden, and
 *    the renderer is fully disposed on unmount.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";

type ThreeModule = typeof import("three");

// Type-only namespace for annotations (erased at compile time, so it never
// pulls the library into the server bundle).
import type * as THREE from "three";

const ICON_HEIGHT = 132;

const TEAL = 0x2dd4bf;
const GOLD = 0xfbbf24;

const SHELL_RADIUS = 0.52;
const WAVE_RING_A = 0.82;
const WAVE_RING_B = 1.12;
const MOTES = 12;

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

/** Soft radial glow texture shared by the halos and the motes. */
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
    gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

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

function initField(canvas: HTMLCanvasElement, THREE: ThreeModule): () => void {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
  camera.position.set(0, 0, 3.1);

  const light = new THREE.DirectionalLight(0xffffff, 1.1);
  light.position.set(1.5, 2, 2.5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(TEAL, 0.45));

  const root = new THREE.Group();
  scene.add(root);

  // Soft teal aura behind the whole composition.
  root.add(makeHalo(THREE, TEAL, 0.14, 3.4));

  // ── Living shell: a translucent sphere whose vertices ripple with layered
  //    sine waves, so the surface reads as cellular harmonization rather than
  //    a static orb.
  const shellGeo = new THREE.SphereGeometry(SHELL_RADIUS, 48, 32);
  const basePos = new Float32Array(shellGeo.attributes.position.array);
  const baseRad = SHELL_RADIUS;
  const shellPlanes: Array<{ theta: number; phi: number; noise: number }> = [];
  for (let i = 0; i < basePos.length; i += 3) {
    const x = basePos[i];
    const y = basePos[i + 1];
    const z = basePos[i + 2];
    shellPlanes.push({
      theta: Math.atan2(x, z),
      phi: Math.acos(y / baseRad),
      noise: (i * 13.7) % (Math.PI * 2),
    });
  }
  const shell = new THREE.Mesh(
    shellGeo,
    new THREE.MeshPhysicalMaterial({
      color: TEAL,
      transparent: true,
      opacity: 0.18,
      emissive: TEAL,
      emissiveIntensity: 0.35,
      metalness: 0.1,
      roughness: 0.35,
      clearcoat: 0.8,
      clearcoatRoughness: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    })
  );
  root.add(shell);

  // ── Resonant core: the gold "heart of calm" the waves breathe around.
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 20, 16),
    new THREE.MeshPhysicalMaterial({
      color: GOLD,
      emissive: GOLD,
      emissiveIntensity: 0.55,
      metalness: 0.3,
      roughness: 0.3,
      clearcoat: 0.6,
      clearcoatRoughness: 0.35,
      toneMapped: false,
    })
  );
  root.add(core);
  const coreHalo = makeHalo(THREE, GOLD, 0.45, 0.85);
  core.add(coreHalo);

  // ── Relaxation wave rings: two concentric bands breathing in counter-phase,
  //    the slow exhale → inhale of the resting nervous system.
  const ringAMat = new THREE.MeshBasicMaterial({
    color: TEAL,
    transparent: true,
    opacity: 0.55,
    toneMapped: false,
  });
  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(WAVE_RING_A, 0.018, 10, 64),
    ringAMat
  );
  ringA.rotation.x = 0.5;
  root.add(ringA);

  const ringBMat = new THREE.MeshBasicMaterial({
    color: TEAL,
    transparent: true,
    opacity: 0.35,
    toneMapped: false,
  });
  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(WAVE_RING_B, 0.014, 10, 72),
    ringBMat
  );
  ringB.rotation.set(-0.28, 0.6, 0.2);
  root.add(ringB);

  // ── Cellular motes: a sparse drift of glow points around the shell. They
  //    breathe radially along their own axis (never orbiting), so it reads as
  //    ambient cellular activity rather than a cycle.
  const moteShell: Array<{
    sprite: THREE.Sprite;
    ax: number;
    ay: number;
    az: number;
    phase: number;
  }> = [];
  for (let i = 0; i < MOTES; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    const r = 1.28;
    const ax = r * Math.sin(p) * Math.cos(a);
    const ay = r * Math.cos(p);
    const az = r * Math.sin(p) * Math.sin(a);
    const sprite = makeHalo(THREE, i % 3 === 0 ? GOLD : TEAL, 0.32, 0.2);
    sprite.position.set(ax, ay, az);
    root.add(sprite);
    moteShell.push({
      sprite,
      ax,
      ay,
      az,
      phase: (i / MOTES) * Math.PI * 2,
    });
  }

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

    // Slow contemplative rotation — much calmer than an orbit spin.
    root.rotation.y += dt * 0.12;

    // Layered sine ripples across the shell surface (cellular harmonization).
    const posAttr = shellGeo.attributes.position;
    const pos = posAttr.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const plane = shellPlanes[i / 3];
      const wave =
        0.028 * Math.sin(t * 1.05 + plane.phi * 3.0 + plane.theta * 2.0) +
        0.014 * Math.sin(t * 0.72 - plane.phi * 2.0 + plane.theta * 3.5) +
        0.012 * Math.sin(t * 1.6 + plane.noise);
      const baseR = baseRad;
      const nx = basePos[i] / baseR;
      const ny = basePos[i + 1] / baseR;
      const nz = basePos[i + 2] / baseR;
      pos[i] = basePos[i] + nx * wave;
      pos[i + 1] = basePos[i + 1] + ny * wave;
      pos[i + 2] = basePos[i + 2] + nz * wave;
    }
    posAttr.needsUpdate = true;
    shellGeo.computeVertexNormals();

    // Counter-phase wave rings: one inhales while the other exhales.
    ringA.scale.setScalar(0.94 + 0.12 * Math.sin(t * 0.5));
    ringAMat.opacity = 0.35 + 0.3 * Math.sin(t * 0.5 + 0.5);
    ringB.scale.setScalar(0.94 - 0.1 * Math.sin(t * 0.5 + 0.9));
    ringBMat.opacity = 0.22 + 0.26 * Math.sin(t * 0.5 + 1.3);

    // Resonant core breathing.
    const breath = 1 + 0.08 * Math.sin(t * 1.7);
    core.scale.setScalar(breath);
    coreHalo.scale.setScalar(0.85 * (1 + 0.12 * Math.sin(t * 1.7 + 0.6)));

    // Motes drift gently along their own radial axis.
    for (const mote of moteShell) {
      const swell = 1 + 0.06 * Math.sin(t * 0.3 + mote.phase);
      mote.sprite.position.set(
        mote.ax * swell,
        mote.ay * swell,
        mote.az * swell
      );
      mote.sprite.scale.setScalar(0.2 * (1 + 0.25 * Math.sin(t * 0.9 + mote.phase)));
    }

    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(loop);

  return () => {
    stop();
    ro?.disconnect();
    io?.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    scene.traverse((obj) => {
      const mesh = obj as unknown as {
        geometry?: Disposable;
        material?: Disposable | Disposable[];
      };
      if (mesh.geometry) mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
      else mesh.material?.dispose();
    });
    renderer.dispose();
  };
}

export function CalmResonance3D({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const motion = useMotionEnabled();
  // WebGL support is a stable environment fact; probe it lazily (never in an
  // effect) so no cascading re-render is triggered.
  const [webgl] = React.useState(() => isWebGLAvailable());
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!motion || !webgl || !canvas) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    void import("three").then((THREE) => {
      if (cancelled || !canvas.isConnected) return;
      dispose = initField(canvas, THREE);
      setLive(true);
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
      {!live && <CalmResonanceFallback />}
    </div>
  );
}

/** Static SVG resonance graphic so the field reads even without WebGL / motion. */
function CalmResonanceFallback() {
  const uid = React.useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 160 132"
      className="absolute inset-0 mx-auto h-full w-auto max-w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`fibro-calm-glow-${uid}`}>
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#2dd4bf" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="66" r="58" fill={`url(#fibro-calm-glow-${uid})`} />
      {/* Breathing wave rings */}
      <ellipse
        cx="80"
        cy="66"
        rx="48"
        ry="30"
        fill="none"
        stroke="#2dd4bf"
        strokeWidth="1.8"
        opacity="0.7"
      />
      <ellipse
        cx="80"
        cy="66"
        rx="63"
        ry="40"
        fill="none"
        stroke="#2dd4bf"
        strokeWidth="1.2"
        opacity="0.45"
      />
      {/* Living shell */}
      <circle cx="80" cy="66" r="30" fill="#2dd4bf" opacity="0.1" />
      <circle cx="80" cy="66" r="30" fill="none" stroke="#2dd4bf" strokeWidth="1.4" opacity="0.5" />
      {/* Resonant core */}
      <circle cx="80" cy="66" r="9" fill="#fbbf24" opacity="0.95" />
      <circle cx="80" cy="66" r="14" fill="#fbbf24" opacity="0.22" />
      {/* Cellular motes drifting around the shell */}
      <circle cx="38" cy="46" r="2.6" fill="#2dd4bf" opacity="0.85" />
      <circle cx="122" cy="52" r="2.6" fill="#2dd4bf" opacity="0.7" />
      <circle cx="46" cy="88" r="2.6" fill="#fbbf24" opacity="0.8" />
      <circle cx="118" cy="84" r="2.6" fill="#2dd4bf" opacity="0.75" />
      <circle cx="80" cy="26" r="2.2" fill="#2dd4bf" opacity="0.6" />
    </svg>
  );
}