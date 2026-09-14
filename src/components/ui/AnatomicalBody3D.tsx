"use client";

/**
 * AnatomicalBody3D — WebGL anatomical viewer for the FibroCare pain maps.
 *
 * Replaces the flat SVG figure with a lightweight Three.js scene when the
 * client supports WebGL and motion is enabled. The body is a set of low-poly
 * primitives with a glossy Midnight Emerald material; pain pools render as
 * additive glow sprites; interactive tender-point markers render as both DOM
 * buttons (accessible, keyboard-focusable) and luminous nodes in the scene.
 * Drag to rotate, wheel/pinch to zoom.
 *
 * Progressive-enhancement contract:
 *  - SSR, reduced motion, or no WebGL → renders VolumetricBody (the SVG
 *    figure) on a PerspectiveStage. Interaction and keyboard access stay
 *    identical via the same DOM hotspot buttons.
 *  - `three` is imported lazily inside an effect (never in the server bundle),
 *    so the SSR build cannot crash and devices that don't need 3D never
 *    download the library.
 *  - Pixel ratio is capped at 2, geometry is low-poly, and the render loop is
 *    paused when the stage leaves the viewport or the tab is hidden. Pointer
 *    input never hijacks vertical page scrolling (`touch-action: pan-y`).
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  REGION_ANCHORS,
  severityBand,
  viewBoxFromVec3,
  type BodyRegionId,
  type Vec3,
} from "@/lib/anatomy";
import { VolumetricBody } from "@/components/ui/VolumetricBody";
import { PerspectiveStage } from "@/components/ui/PerspectiveStage";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";

type ThreeModule = typeof import("three");

// Type-only namespace for annotation positions (erased at compile time, so it
// never pulls the library into the server bundle).
import type * as THREE from "three";

export interface Hotspot3D {
  /** Stable id; also used as the aria-label fallback if label is short. */
  id: string;
  label: string;
  /** Anchor in anatomy world units (y-up, feet at y≈0, +z faces viewer). */
  position: Vec3;
  /** Marker color (CSS hex). Defaults to the pain-map teal. */
  color?: string;
  /** Marker color when selected or hovered. Defaults to mint. */
  activeColor?: string;
  /** Marker core radius in world units. Default 0.05. */
  radius?: number;
}

export interface AnatomicalBody3DProps {
  /** Per-region pain severity on the 0–10 scale (drives glow pools). */
  severity?: Partial<Record<BodyRegionId, number>>;
  /** Region to ring-highlight (no ring when the region has severity 0). */
  highlight?: BodyRegionId | null;
  /** Rotate the anatomy to its back view (default front). */
  backView?: boolean;
  /** Interactive markers rendered as buttons (works in both render modes). */
  hotspots?: readonly Hotspot3D[];
  /** Set of hotspot ids currently selected (active styling). */
  selected?: ReadonlySet<string> | null;
  /** Fired when a hotspot button is activated. */
  onSelect?: (id: string) => void;
  /** Fired when a hotspot is hovered/focused (or null on leave/blur). */
  onHover?: (id: string | null) => void;
  /** Slow continuous rotation when the scene is idle. Default false. */
  autoRotate?: boolean;
  className?: string;
}

interface Viewer {
  syncAll(): void;
  setBack(back: boolean): void;
  dispose(): void;
}

interface Snapshot {
  severity: Partial<Record<BodyRegionId, number>>;
  highlight: BodyRegionId | null;
  backView: boolean;
  hotspots: readonly Hotspot3D[];
  selected: ReadonlySet<string>;
  hovered: string | null;
}

const EMPTY_SET: ReadonlySet<string> = new Set();

const TARGET_Y = 1.85;
const CAM_FOV = 42;
const CAM_MIN_DIST = 3.6;
const CAM_MAX_DIST = 8.5;
const CAM_DEFAULT_DIST = 6.1;
const SPRITE_BASE = 0.42;
/** Marker core as a fraction of its configured radius (delicate pinpoint). */
const MARKER_SIZE = 0.225;
/** Marker core opacity so the anatomy stays visible through the point. */
const MARKER_OPACITY = 0.35;
const AUTO_ROTATE_SPEED = 0.12;

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export function AnatomicalBody3D({
  severity = {},
  highlight = null,
  backView = false,
  hotspots,
  selected = EMPTY_SET,
  onSelect,
  onHover,
  autoRotate = false,
  className,
}: AnatomicalBody3DProps) {
  const motionEnabled = useMotionEnabled();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const buttonRefs = React.useRef(new Map<string, HTMLButtonElement>());

  const [mode, setMode] = React.useState<"svg" | "gl">("svg");
  const [hovered, setHovered] = React.useState<string | null>(null);

  const threeRef = React.useRef<ThreeModule | null>(null);
  const viewerRef = React.useRef<Viewer | null>(null);

  // Live snapshot for the rAF loop / syncs so they never read stale closures.
  const dataRef = React.useRef<Snapshot>({
    severity: {},
    highlight: null,
    backView: false,
    hotspots: [],
    selected: EMPTY_SET,
    hovered: null,
  });
  dataRef.current = {
    severity,
    highlight,
    backView,
    hotspots: hotspots ?? [],
    selected: selected ?? EMPTY_SET,
    hovered,
  };

  const setHover = React.useCallback(
    (id: string | null) => {
      setHovered(id);
      onHover?.(id);
    },
    [onHover]
  );

  // Upgrade to WebGL only when motion is allowed AND WebGL exists. `three` is
  // loaded lazily so SSR and non-WebGL clients never bundle it.
  React.useEffect(() => {
    if (!motionEnabled || !isWebGLAvailable()) return;
    let cancelled = false;
    import("three").then((three) => {
      if (cancelled) return;
      threeRef.current = three;
      setMode("gl");
    });
    return () => {
      cancelled = true;
      threeRef.current = null;
      setMode("svg");
    };
  }, [motionEnabled]);

  // Build / tear down the WebGL viewer when the mode flips to "gl".
  React.useEffect(() => {
    if (mode !== "gl") return;
    const THREE = threeRef.current;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!THREE || !canvas || !root) return;
    const viewer = buildViewer(THREE, canvas, root, buttonRefs, dataRef, autoRotate);
    viewerRef.current = viewer;
    return () => {
      viewer.dispose();
      viewerRef.current = null;
    };
  }, [mode, autoRotate]);

  // Rebroadcast prop changes to the live scene (no-ops in SVG mode).
  React.useEffect(() => {
    viewerRef.current?.syncAll();
  }, [severity, highlight, hotspots, selected, hovered, mode]);

  React.useEffect(() => {
    viewerRef.current?.setBack(backView);
  }, [backView, mode]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-full w-full select-none overflow-hidden",
        className
      )}
    >
      {mode === "gl" ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full touch-pan-y"
        />
      ) : (
        <PerspectiveStage
          className="h-full w-full"
          resting={{ rotateX: 6, rotateY: backView ? 6 : -6 }}
          flipped={backView}
          tiltDeg={6}
        >
          <VolumetricBody severity={severity} highlight={highlight} backView={backView} />
        </PerspectiveStage>
      )}

      {hotspots?.map((hotspot) => {
        const active = (selected ?? EMPTY_SET).has(hotspot.id) || hovered === hotspot.id;
        const color = active
          ? (hotspot.activeColor ?? "#5eead4")
          : (hotspot.color ?? "#2dd4bf");
        const pos = mode === "svg" ? viewBoxFromVec3(hotspot.position) : null;
        return (
          <button
            key={hotspot.id}
            type="button"
            ref={(el) => {
              if (el) buttonRefs.current.set(hotspot.id, el);
              else buttonRefs.current.delete(hotspot.id);
            }}
            aria-label={hotspot.label}
            aria-pressed={active}
            onClick={() => onSelect?.(hotspot.id)}
            onMouseEnter={() => setHover(hotspot.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(hotspot.id)}
            onBlur={() => setHover(null)}
            className="group absolute left-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2"
            style={
              pos
                ? { left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }
                : undefined
            }
            data-hotspot={hotspot.id}
          >
            <span
              aria-hidden="true"
              className="block h-4 w-4 rounded-full transition-all duration-200"
              style={{
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85), ${color} 62%)`,
                boxShadow: active
                  ? `0 0 ${hotspot.radius ? 14 : 10}px ${color}`
                  : `0 0 7px rgba(45,212,191,0.55)`,
                transform: active ? "scale(1.15)" : undefined,
              }}
            />
            <span
              className="pointer-events-none absolute start-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/60 bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 rtl:translate-x-1/2"
              aria-hidden="true"
            >
              {hotspot.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WebGL scene                                                         */
/* ------------------------------------------------------------------ */

function buildViewer(
  THREE: ThreeModule,
  canvas: HTMLCanvasElement,
  root: HTMLDivElement,
  buttonRefs: React.RefObject<Map<string, HTMLButtonElement>>,
  dataRef: React.RefObject<Snapshot>,
  autoRotate: boolean
): Viewer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.1, 40);

  // Lights: cool hemisphere + warm key + mint rim for the Midnight Emerald look.
  const hemi = new THREE.HemisphereLight(0x9deef0, 0x04302d, 0.85);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(4, 7, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x5eead4, 1.8);
  rim.position.set(-4, 3, -5);
  scene.add(rim);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f766e,
    metalness: 0.25,
    roughness: 0.38,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
  });
  const bodyGroup = new THREE.Group();
  scene.add(bodyGroup);
  const glowSprites: THREE.Sprite[] = [];
  buildBody(THREE, bodyGroup, bodyMat, glowSprites);

  // Soft glow texture shared by pools, markers, and ambient aura.
  const glowTex = makeGlowTexture(THREE);

  const aura = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  aura.position.set(0, TARGET_Y, -0.5);
  aura.scale.set(4.4, 4.8, 1);
  scene.add(aura);

  // Glow pools per region, markers per hotspot, and the highlight ring.
  const glowRoot = new THREE.Group();
  scene.add(glowRoot);
  const markerRoot = new THREE.Group();
  scene.add(markerRoot);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.02, 8, 30),
    new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.9,
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.visible = false;
  scene.add(ring);

  const glowMap = new Map<
    string,
    {
      sprite: THREE.Sprite;
      base: number;
      seed: number;
      pulse: number;
    }
  >();
  const markerMap = new Map<
    string,
    {
      shell: THREE.Mesh;
      halo: THREE.Sprite;
      baseScale: number;
      seed: number;
    }
  >();

  const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material.dispose();
  };

  // Camera orbit state.
  const orbit = {
    yaw: dataRef.current?.backView ? Math.PI : 0,
    pitch: 0.08,
    dist: CAM_DEFAULT_DIST,
  };

  function resize() {
    const width = root.clientWidth || 1;
    const height = root.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();

  const ro =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  ro?.observe(root);

  /* ---- pointer input: drag rotate, pinch / wheel zoom ------------------ */

  const pointers = new Map<number, { x: number; y: number }>();
  let pinchStartSep = 0;
  let pinchStartDist = 0;
  let dragging = false;
  let vx = 0;
  let vy = 0;

  function clampDist(d: number) {
    return Math.max(CAM_MIN_DIST, Math.min(CAM_MAX_DIST, d));
  }

  const onPointerDown = (event: PointerEvent) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // capture is a nicety, not a requirement
    }
    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      pinchStartSep = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      pinchStartDist = orbit.dist;
      vx = 0;
      vy = 0;
    } else if (pointers.size === 1) {
      dragging = true;
      vx = 0;
      vy = 0;
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    const prev = pointers.get(event.pointerId);
    if (!prev) return;
    const dx = event.clientX - prev.x;
    const dy = event.clientY - prev.y;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size >= 2) {
      const pts = [...pointers.values()];
      const sep = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      orbit.dist = clampDist((pinchStartDist * pinchStartSep) / sep);
      return;
    }
    if (dragging) {
      orbit.yaw += dx * 0.0055;
      orbit.pitch = Math.max(-0.5, Math.min(0.85, orbit.pitch + dy * 0.004));
      vx = dx * 0.0012;
      vy = dy * 0.0012;
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    pinchStartSep = 0;
    pinchStartDist = 0;
    if (pointers.size === 0) {
      dragging = false;
    }
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    orbit.dist = clampDist(orbit.dist * (1 + Math.sign(event.deltaY) * 0.08));
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  /* ---- lifecycle: pause render when offscreen or hidden ----------------- */

  let paused = false;
  const onVisibility = () => {
    setPaused(document.visibilityState !== "visible" || !intersects);
  };
  let intersects = true;
  const io =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            intersects = entries[0]?.isIntersecting ?? true;
            setPaused(!intersects);
          },
          { threshold: 0.05 }
        )
      : null;
  void io?.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);

  let raf = 0;
  let lastTime = 0;
  const tmp = new THREE.Vector3();

  const projectButtons = () => {
    const width = root.clientWidth;
    const height = root.clientHeight;
    if (!width || !height || !buttonRefs.current) return;
    camera.updateMatrixWorld(true);
    for (const hotspot of dataRef.current?.hotspots ?? []) {
      const el = buttonRefs.current.get(hotspot.id);
      if (!el) continue;
      tmp.set(hotspot.position[0], hotspot.position[1], hotspot.position[2]);
      tmp.project(camera);
      const behind = tmp.z > 1;
      const px = (tmp.x * 0.5 + 0.5) * width;
      const py = (-tmp.y * 0.5 + 0.5) * height;
      el.style.transform = `translate(-50%, -50%) translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      el.style.opacity = behind ? "0.12" : "1";
      el.style.pointerEvents = behind ? "none" : "auto";
    }
  };

  const frame = (time: number) => {
    raf = requestAnimationFrame(frame);
    if (paused) return;
    const dt = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0.016;
    lastTime = time;
    const t = time / 1000;

    // Idle motion: inertia + optional auto-rotate.
    if (!dragging && pointers.size === 0) {
      orbit.yaw += vx;
      orbit.pitch = Math.max(-0.5, Math.min(0.85, orbit.pitch + vy));
      vx *= 0.92;
      vy *= 0.92;
      if (autoRotate) orbit.yaw += dt * AUTO_ROTATE_SPEED;
    }

    // Pulse the glow pools and marker halos.
    for (const entry of glowMap.values()) {
      entry.pulse += dt;
      const s = entry.base * (0.82 + 0.18 * Math.sin(entry.pulse * 2.0 + entry.seed));
      entry.sprite.scale.set(s, s, 1);
    }
    for (const entry of markerMap.values()) {
      const s = entry.baseScale * (0.85 + 0.15 * Math.sin(t * 2.4 + entry.seed));
      entry.halo.scale.set(s, s, 1);
    }

    // Spin the highlight ring slowly so it reads as "active".
    if (ring.visible) ring.rotation.z += dt * 0.5;

    // Camera from orbit.
    const cp = Math.cos(orbit.pitch);
    camera.position.set(
      orbit.dist * Math.sin(orbit.yaw) * cp,
      TARGET_Y + orbit.dist * Math.sin(orbit.pitch),
      orbit.dist * Math.cos(orbit.yaw) * cp
    );
    camera.lookAt(0, TARGET_Y, 0);

    projectButtons();
    renderer.render(scene, camera);
  };

  function setPaused(value: boolean) {
    if (value === paused) return;
    paused = value;
    if (!paused) {
      lastTime = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }
  raf = requestAnimationFrame(frame);

  /* ---- content sync ----------------------------------------------------- */

  function syncAll() {
    const current = dataRef.current;
    const wantedGlows = new Set<string>();
    let glowIndex = 0;

    for (const [region, raw] of Object.entries(current.severity) as [
      BodyRegionId,
      number,
    ][]) {
      const value = Math.max(0, Math.min(10, raw));
      if (value === 0) continue;
      const band = severityBand(value);
      for (const anchor of REGION_ANCHORS[region]) {
        const key = `${region}:${glowIndex++}`;
        wantedGlows.add(key);
        let entry = glowMap.get(key);
        if (!entry) {
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: glowTex,
              color: 0xffffff,
              transparent: true,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            })
          );
          sprite.position.set(anchor[0], anchor[1], anchor[2]);
          glowRoot.add(sprite);
          entry = { sprite, base: 0.4, seed: Math.random() * Math.PI * 2, pulse: 0 };
          glowMap.set(key, entry);
        }
        const mat = entry.sprite.material as THREE.SpriteMaterial;
        mat.color.set(band.hex);
        mat.opacity = 0.16 + (value / 10) * 0.3;
        entry.base = SPRITE_BASE * (0.5 + (value / 10) * 0.6);
        entry.sprite.visible = true;
      }
    }

    for (const [key, entry] of glowMap) {
      if (!wantedGlows.has(key)) {
        glowRoot.remove(entry.sprite);
        entry.sprite.material.dispose();
        glowMap.delete(key);
      }
    }

    // Highlight ring.
    const highlightRegion =
      current.highlight && (current.severity[current.highlight] ?? 0) > 0
        ? current.highlight
        : null;
    if (highlightRegion) {
      const anchor = REGION_ANCHORS[highlightRegion][0];
      ring.position.set(anchor[0], anchor[1], anchor[2]);
      ring.visible = true;
    } else {
      ring.visible = false;
    }

    // Hotspot markers (1:1 with the DOM buttons).
    const wantedMarkers = new Set<string>();
    for (const hs of current.hotspots) {
      wantedMarkers.add(hs.id);
      let entry = markerMap.get(hs.id);
      if (!entry) {
        const shell = new THREE.Mesh(
          new THREE.SphereGeometry((hs.radius ?? 0.05) * MARKER_SIZE, 12, 10),
          new THREE.MeshPhongMaterial({
            transparent: true,
            opacity: MARKER_OPACITY,
            depthWrite: false,
            toneMapped: false,
          })
        );
        shell.position.set(hs.position[0], hs.position[1], hs.position[2]);
        const halo = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTex,
            color: 0xffffff,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        halo.position.set(hs.position[0], hs.position[1], hs.position[2]);
        markerRoot.add(shell, halo);
        entry = { shell, halo, baseScale: 0.3, seed: Math.random() * Math.PI * 2 };
        markerMap.set(hs.id, entry);
      }
      const active = current.selected.has(hs.id) || current.hovered === hs.id;
      const color = active ? (hs.activeColor ?? "#5eead4") : (hs.color ?? "#2dd4bf");
      const shellMat = entry.shell.material as THREE.MeshPhongMaterial;
      shellMat.color.set(color);
      shellMat.emissive.set(color);
      const haloMat = entry.halo.material as THREE.SpriteMaterial;
      haloMat.color.set(color);
      haloMat.opacity = active ? 0.4 : 0.18;
      entry.baseScale = (hs.radius ?? 0.05) * (active ? 3.1 : 2.0);
      entry.shell.scale.setScalar(active ? 1.35 : 1);
    }
    for (const [id, entry] of markerMap) {
      if (!wantedMarkers.has(id)) {
        markerRoot.remove(entry.shell, entry.halo);
        disposeMaterial(entry.shell.material);
        disposeMaterial(entry.halo.material);
        markerMap.delete(id);
      }
    }
  }

  function setBack(back: boolean) {
    orbit.yaw = back ? Math.PI : 0;
    vx = 0;
    vy = 0;
  }

  function dispose() {
    if (raf) cancelAnimationFrame(raf);
    ro?.disconnect();
    io?.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("wheel", onWheel);
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = (mesh as THREE.Mesh).material as
        | THREE.Material
        | THREE.Material[]
        | undefined;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });
    glowTex.dispose();
    renderer.dispose();
  }

  return { syncAll, setBack, dispose };
}

/* ------------------------------------------------------------------ */
/* Body primitive assembly                                             */
/* ------------------------------------------------------------------ */

function buildBody(
  THREE: ThreeModule,
  root: THREE.Group,
  material: THREE.Material,
  glowSprites: THREE.Sprite[]
) {
  const add = (
    geometry: THREE.BufferGeometry,
    position: Vec3,
    opts: { scale?: Vec3; rotation?: Vec3 } = {}
  ) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    if (opts.scale) mesh.scale.set(opts.scale[0], opts.scale[1], opts.scale[2]);
    if (opts.rotation)
      mesh.rotation.set(opts.rotation[0], opts.rotation[1], opts.rotation[2]);
    root.add(mesh);
    return mesh;
  };

  const sphere = (radius: number) => new THREE.SphereGeometry(radius, 14, 12);
  const capsule = (radius: number, length: number) =>
    new THREE.CapsuleGeometry(radius, length, 4, 10);

  // Feet
  const foot = sphere(0.1);
  add(foot, [-0.15, 0.1, 0.1], { scale: [1, 0.5, 1.7] });
  add(foot, [0.15, 0.1, 0.1], { scale: [1, 0.5, 1.7] });

  // Calves, knees, thighs
  const calf = capsule(0.105, 0.34);
  add(calf, [-0.16, 0.43, 0]);
  add(calf, [0.16, 0.43, 0]);
  const knee = sphere(0.145);
  add(knee, [-0.17, 0.62, 0.03]);
  add(knee, [0.17, 0.62, 0.03]);
  const thigh = capsule(0.15, 0.42);
  add(thigh, [-0.17, 0.86, 0]);
  add(thigh, [0.17, 0.86, 0]);

  // Pelvis + hips
  add(sphere(0.3), [0, 1.12, -0.02], { scale: [1.15, 0.82, 0.78] });

  // Torso (lathe profile, bottom → top; x = radius, y = height offset)
  const profile = [
    new THREE.Vector2(0.24, -1.05),
    new THREE.Vector2(0.31, -0.82),
    new THREE.Vector2(0.3, -0.45),
    new THREE.Vector2(0.27, -0.1),
    new THREE.Vector2(0.29, 0.3),
    new THREE.Vector2(0.315, 0.62),
    new THREE.Vector2(0.34, 0.9),
    new THREE.Vector2(0.42, 1.05),
    new THREE.Vector2(0.4, 1.07),
    new THREE.Vector2(0.2, 1.08),
    new THREE.Vector2(0.09, 1.08),
  ];
  const torso = new THREE.LatheGeometry(profile, 24);
  add(torso, [0, 2.0, 0]);

  // Shoulder caps + neck + head
  const deltoid = sphere(0.17);
  add(deltoid, [-0.4, 2.68, 0]);
  add(deltoid, [0.4, 2.68, 0]);
  const neck = capsule(0.09, 0.16);
  add(neck, [0, 3.06, 0]);
  const head = sphere(0.3);
  add(head, [0, 3.42, 0], { scale: [0.92, 1.05, 0.95] });

  // Arms (upper + forearm slightly flared outward)
  const upperArm = capsule(0.1, 0.4);
  add(upperArm, [-0.42, 2.38, 0], { rotation: [0, 0, -0.12] });
  add(upperArm, [0.42, 2.38, 0], { rotation: [0, 0, 0.12] });
  const foreArm = capsule(0.082, 0.36);
  add(foreArm, [-0.435, 1.81, 0], { rotation: [0, 0, -0.2] });
  add(foreArm, [0.435, 1.81, 0], { rotation: [0, 0, 0.2] });

  // Hands
  const hand = sphere(0.08);
  add(hand, [-0.44, 1.62, 0.02], { scale: [1, 1.35, 0.55] });
  add(hand, [0.44, 1.62, 0.02], { scale: [1, 1.35, 0.55] });
}

/* ------------------------------------------------------------------ */
/* Radial glow texture                                                  */
/* ------------------------------------------------------------------ */

function makeGlowTexture(THREE: ThreeModule): THREE.Texture {
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
    gradient.addColorStop(0.28, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}