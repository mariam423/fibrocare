"use client";

/**
 * CycleOrbit3D — a small decorative 3D "menstrual cycle orbit" icon for the
 * period tracker's empty state. A luminous gold core sits at the center of
 * two tilted orbital rings (teal + gold): three teal phase nodes advance
 * around the outer ring while a single gold ovum node traces the inner one —
 * a quiet, abstract read of the monthly cycle. Soft additive glows echo the
 * FibroCare Midnight Emerald palette and the luminous AnatomicalBody3D
 * markers.
 *
 * Progressive-enhancement contract (mirrors AnatomicalBody3D):
 *  - SSR, reduced motion, or no WebGL → a static inline-SVG orbit graphic
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

const RING_A = 1.0;
const RING_B = 0.6;
const CORE_RADIUS = 0.15;

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

/** Soft radial glow texture shared by the halos and the aura. */
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

function initIcon(canvas: HTMLCanvasElement, THREE: ThreeModule): () => void {
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

  // Soft teal aura behind the whole composition (AnatomicalBody3D style).
  root.add(makeHalo(THREE, TEAL, 0.16, 3.8));

  // Gold core + gold halo — the cycle's center.
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(CORE_RADIUS, 20, 16),
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
  const coreHalo = makeHalo(THREE, GOLD, 0.5, 0.85);
  core.add(coreHalo);

  // Outer teal ring + three phase nodes (follicular → ovulation → luteal).
  const holderA = new THREE.Group();
  holderA.rotation.x = 1.1;
  root.add(holderA);

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(RING_A, 0.03, 10, 56),
    new THREE.MeshBasicMaterial({
      color: TEAL,
      transparent: true,
      opacity: 0.85,
      toneMapped: false,
    })
  );
  holderA.add(ringA);

  const phaseGroup = new THREE.Group();
  holderA.add(phaseGroup);
  const phaseNodes: Array<{ mesh: THREE.Mesh; halo: THREE.Sprite }> = [];
  for (let i = 0; i < 3; i += 1) {
    const a = (i / 3) * Math.PI * 2;
    const node = new THREE.Group();
    node.position.set(Math.cos(a) * RING_A, Math.sin(a) * RING_A, 0);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.062, 12, 10),
      new THREE.MeshPhysicalMaterial({
        color: TEAL,
        emissive: TEAL,
        emissiveIntensity: 0.55,
        metalness: 0.2,
        roughness: 0.32,
        clearcoat: 0.5,
        toneMapped: false,
      })
    );
    const halo = makeHalo(THREE, TEAL, 0.4, 0.52);
    node.add(mesh, halo);
    phaseGroup.add(node);
    phaseNodes.push({ mesh, halo });
  }

  // Inner gold ring + a single ovum node tracing the opposite direction.
  const holderB = new THREE.Group();
  holderB.rotation.set(1.6, 0.6, 0.9);
  root.add(holderB);

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(RING_B, 0.02, 10, 44),
    new THREE.MeshBasicMaterial({
      color: GOLD,
      transparent: true,
      opacity: 0.75,
      toneMapped: false,
    })
  );
  holderB.add(ringB);

  const ovumGroup = new THREE.Group();
  holderB.add(ovumGroup);
  const ovum = new THREE.Group();
  ovum.position.set(RING_B, 0.1, 0);
  const ovumMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 12, 10),
    new THREE.MeshPhysicalMaterial({
      color: GOLD,
      emissive: GOLD,
      emissiveIntensity: 0.6,
      metalness: 0.25,
      roughness: 0.28,
      clearcoat: 0.6,
      toneMapped: false,
    })
  );
  const ovumHalo = makeHalo(THREE, GOLD, 0.5, 0.62);
  ovum.add(ovumMesh, ovumHalo);
  ovumGroup.add(ovum);

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

    root.rotation.y += dt * 0.4;
    phaseGroup.rotation.z += dt * 0.6;
    ovumGroup.rotation.z -= dt * 0.45;

    // Gentle breathing on the glows so the icon stays alive but calm.
    const breath = 1 + 0.06 * Math.sin(t * 2.2);
    core.scale.setScalar(breath);
    coreHalo.scale.setScalar(0.85 * (1 + 0.1 * Math.sin(t * 2.2 + 0.6)));
    for (let i = 0; i < phaseNodes.length; i += 1) {
      const pulse = 1 + 0.08 * Math.sin(t * 2.2 + i * 1.4);
      phaseNodes[i].mesh.scale.setScalar(pulse);
      phaseNodes[i].halo.scale.setScalar(0.52 * pulse);
    }
    ovumMesh.scale.setScalar(1 + 0.08 * Math.sin(t * 2.6 + 0.9));
    ovumHalo.scale.setScalar(0.62 * (1 + 0.1 * Math.sin(t * 2.6)));

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

export function CycleOrbit3D({ className }: { className?: string }) {
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
      dispose = initIcon(canvas, THREE);
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
      {!live && <CycleOrbitFallback />}
    </div>
  );
}

/** Static SVG orbit so the icon reads even with reduced motion / no WebGL. */
function CycleOrbitFallback() {
  const uid = React.useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 160 132"
      className="absolute inset-0 mx-auto h-full w-auto max-w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`fibro-orbit-glow-${uid}`}>
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#2dd4bf" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="66" r="58" fill={`url(#fibro-orbit-glow-${uid})`} />
      <ellipse
        cx="80"
        cy="66"
        rx="59"
        ry="26"
        fill="none"
        stroke="#2dd4bf"
        strokeWidth="2.5"
        transform="rotate(-14 80 66)"
        opacity="0.9"
      />
      <ellipse
        cx="80"
        cy="66"
        rx="35"
        ry="18"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2"
        transform="rotate(20 80 66)"
        opacity="0.8"
      />
      {/* Central gold core */}
      <circle cx="80" cy="66" r="8" fill="#fbbf24" opacity="0.95" />
      <circle cx="80" cy="66" r="13" fill="#fbbf24" opacity="0.25" />
      {/* Three phase nodes on the teal ring */}
      <circle cx="133" cy="39" r="5" fill="#2dd4bf" opacity="0.95" />
      <circle cx="36" cy="76" r="5" fill="#2dd4bf" opacity="0.9" />
      <circle cx="79" cy="98" r="5" fill="#2dd4bf" opacity="0.85" />
      {/* Ovum node on the gold ring */}
      <circle cx="112" cy="62" r="6" fill="#fbbf24" opacity="0.95" />
    </svg>
  );
}