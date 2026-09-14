"use client";

/**
 * CycleOrbit3D — a small decorative 3D "orbital cycle" icon for the period
 * widget's empty state: two tilted orbital rings in teal + gold with a moon
 * orbiting the teal ring and a soft additive glow, echoing the FibroCare
 * Midnight Emerald palette and the luminous AnatomicalBody3D markers.
 *
 * Progressive-enhancement contract (mirrors AnatomicalBody3D):
 *  - SSR, reduced motion, or no WebGL → a static inline-SVG orbit graphic
 *    renders instead; there is no markup difference on the server, so no
 *    hydration mismatch.
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

const ICON_HEIGHT = 128;

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

/** Soft radial glow texture shared by the halo and the orbiting moon's aura. */
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

function initIcon(canvas: HTMLCanvasElement, THREE: ThreeModule): () => void {
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
  camera.position.set(0, 0, 3.1);

  const light = new THREE.DirectionalLight(0xffffff, 1.1);
  light.position.set(1.5, 2, 2.5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x2dd4bf, 0.5));

  const root = new THREE.Group();
  scene.add(root);

  const teal = 0x2dd4bf;
  const gold = 0xfbbf24;

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.034, 10, 56),
    new THREE.MeshBasicMaterial({
      color: teal,
      transparent: true,
      opacity: 0.95,
      toneMapped: false,
    })
  );
  ring1.rotation.x = 1.25;
  root.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.024, 10, 48),
    new THREE.MeshBasicMaterial({
      color: gold,
      transparent: true,
      opacity: 0.8,
      toneMapped: false,
    })
  );
  ring2.rotation.set(1.7, 0.6, 0.8);
  root.add(ring2);

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(THREE),
      color: teal,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  halo.scale.set(3.6, 3.6, 1);
  root.add(halo);

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 12, 10),
    new THREE.MeshPhongMaterial({
      color: gold,
      emissive: gold,
      emissiveIntensity: 0.6,
      shininess: 90,
      toneMapped: false,
    })
  );
  orb.position.set(1.05, 0.18, 0);
  const orbHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(THREE),
      color: gold,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  orbHalo.scale.set(0.7, 0.7, 1);
  const orbHolder = new THREE.Group();
  orbHolder.add(orb);
  orbHolder.add(orbHalo);
  root.add(orbHolder);

  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 8, 8),
    new THREE.MeshBasicMaterial({ color: gold, toneMapped: false })
  );
  dot.position.set(0.68, -0.12, 0.1);
  const dotHolder = new THREE.Group();
  dotHolder.add(dot);
  root.add(dotHolder);

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
  let angle = 0.8;

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

    root.rotation.y += dt * 0.5;
    angle += dt * 1.1;
    orbHolder.rotation.y = angle;
    dotHolder.rotation.y = -angle * 0.8;

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
  const [webgl, setWebgl] = React.useState(false);

  React.useEffect(() => {
    setWebgl(isWebGLAvailable());
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!motion || !webgl || !canvas) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    void import("three").then((THREE) => {
      if (cancelled || !canvas.isConnected) return;
      dispose = initIcon(canvas, THREE);
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [motion, webgl]);

  const showFallback = !motion || !webgl;

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
      {showFallback && <CycleOrbitFallback />}
    </div>
  );
}

/** Static SVG orbit so the icon reads even with reduced motion / no WebGL. */
function CycleOrbitFallback() {
  const uid = React.useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 160 128"
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
      <circle cx="80" cy="64" r="56" fill={`url(#fibro-orbit-glow-${uid})`} />
      <ellipse
        cx="80"
        cy="64"
        rx="58"
        ry="26"
        fill="none"
        stroke="#2dd4bf"
        strokeWidth="2.5"
        transform="rotate(-14 80 64)"
        opacity="0.95"
      />
      <ellipse
        cx="80"
        cy="64"
        rx="37"
        ry="18"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2"
        transform="rotate(18 80 64)"
        opacity="0.8"
      />
      <circle cx="132" cy="46" r="6" fill="#fbbf24" opacity="0.95" />
      <circle cx="53" cy="81" r="3.5" fill="#fbbf24" opacity="0.8" />
    </svg>
  );
}