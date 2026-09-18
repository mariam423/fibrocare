import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");
const IMAGES_DIR = path.join(process.cwd(), "public", "images");

const SIZE = { width: 1200, height: 630 };

/**
 * Real screenshots used for the "features" variant collage. PNGs are read
 * from disk at request time and inlined as data URLs — no image optimization
 * service involved, and the OG image always shows the current UI.
 */
const FEATURE_SHOTS: Record<"en" | "ar", readonly string[]> = {
  en: ["fog-shield.png", "clinical-hub.png", "sos-modal.png"],
  ar: ["fog-shield-ar.png", "clinical-hub-ar.png", "sos-modal-ar.png"],
};

async function toDataUrl(file: string): Promise<string | null> {
  try {
    const buf = await readFile(path.join(IMAGES_DIR, file));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null; // missing screenshot — collage just skips that card
  }
}

type Copy = {
  eyebrow: string;
  headline: string;
  subhead: string;
  footer: string;
};

const COPY: Record<"en" | "ar", Copy> = {
  en: {
    eyebrow: "Made for life with fibromyalgia",
    headline: "Your pain is real. Your pace is yours.",
    subhead:
      "Daily check-ins that turn invisible symptoms into clear patterns, calmer days, and reports your care team can actually use.",
    footer: "FibroCare · A gentle health companion",
  },
  ar: {
    eyebrow: "صُمِّم للحياة مع الفيبروميالجيا",
    headline: "ألمُك حقيقي. وإيقاعُك ملكُك.",
    subhead:
      "تسجيلات يومية تحوّل الأعراض الخفية إلى أنماط واضحة، وأيام أكثر هدوءًا، وتقارير يفيد بها فريق رعايتك فعلًا.",
    footer: "فيبروكير · رفيق صحي لطيف",
  },
};

/** Copy for the "features" variant — September 2026 tool wave. */
const FEATURE_COPY: Record<"en" | "ar", Copy> = {
  en: {
    eyebrow: "New: Fog Shield · SOS · Clinical Hub",
    headline: "Tools for the days pain decides.",
    subhead:
      "An emergency SOS button, fibro-fog rescue, spoon budgeting, and doctor-ready reports — in Arabic and English.",
    footer: "FibroCare · A gentle health companion",
  },
  ar: {
    eyebrow: "جديد: درع الضباب · SOS · المركز الإكلينيكي",
    headline: "أدواتٌ للأيام التي يحكم فيها الألم.",
    subhead:
      "زر نجدَة للطوارئ، وإنقاذ من ضباب الدماغ، وموازنة الطاقة، وتقارير جاهزة لطبيبك — بالعربية والإنجليزية.",
    footer: "فيبروكير · رفيق صحي لطيف",
  },
};

async function loadFont(weight: number): Promise<ArrayBuffer> {
  const buffer = await readFile(path.join(FONT_DIR, `ReadexPro-${weight}.ttf`));
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") === "ar" ? "ar" : "en";
  const variant =
    searchParams.get("variant") === "features" ? "features" : "default";
  const copy = variant === "features" ? FEATURE_COPY[lang] : COPY[lang];
  const isRtl = lang === "ar";

  const [font400, font600, font700] = await Promise.all([
    loadFont(400),
    loadFont(600),
    loadFont(700),
  ]);

  // Features variant: real-screenshot collage of the 2026-09 tool wave.
  // The default variant below keeps the original type-led layout.
  if (variant === "features") {
    const shots = await Promise.all(FEATURE_SHOTS[lang].map(toDataUrl));
    const cards = shots
      .map((src, i) => ({ src, key: i }))
      .filter((c): c is { src: string; key: number } => c.src !== null)
      .map(({ src, key }) => (
        <div
          key={key}
          style={{
            display: "flex",
            flex: 1,
            aspectRatio: "1280/800",
            borderRadius: 18,
            overflow: "hidden",
            border: "2px solid rgba(199,211,204,0.25)",
            boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
            background: "#0B101B",
          }}
        >
          <img
            src={src}
            width={1280}
            height={800}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
        </div>
      ));

    return new ImageResponse(
      (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background:
              "linear-gradient(135deg, #0B101B 0%, #10202E 50%, #0B101B 100%)",
            color: "#F4F7F4",
            fontFamily: "Readex Pro",
            padding: "48px 64px 44px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ambient emerald glow — mirrored for RTL. */}
          <div
            style={{
              position: "absolute",
              top: -180,
              right: isRtl ? undefined : -160,
              left: isRtl ? -160 : undefined,
              width: 520,
              height: 520,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(76,143,95,0.4) 0%, rgba(76,143,95,0) 70%)",
            }}
          />

          {/* Brand row */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #4C8F5F 0%, #2E5740 100%)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 512 512" fill="none">
                <path
                  d="M218 322 C 218 322, 64 222, 64 128 C 64 66, 104 38, 146 50 C 168 57, 198 78, 218 104 C 238 78, 268 57, 290 50 C 332 38, 372 66, 372 128 C 372 222, 218 322, 218 322 Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
                FibroCare
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#4C8F5F",
                  letterSpacing: 0.3,
                }}
              >
                {copy.eyebrow}
              </span>
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 28,
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 58,
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: -1,
                color: "#FFFFFF",
                textShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }}
            >
              {copy.headline}
            </div>
            <div style={{ fontSize: 25, lineHeight: 1.45, color: "#C7D3CC", maxWidth: 1000 }}>
              {copy.subhead}
            </div>
          </div>

          {/* Screenshot collage — top-cropped so page headers stay visible. */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: "auto",
              marginBottom: 20,
              position: "relative",
            }}
          >
            {cards}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 21, color: "#7E9A8A", fontWeight: 400 }}>
              {copy.footer}
            </span>
            <span style={{ fontSize: 21, color: "#4C8F5F", fontWeight: 600, letterSpacing: 0.3 }}>
              fibrocare.app
            </span>
          </div>
        </div>
      ),
      {
        ...SIZE,
        fonts: [
          { name: "Readex Pro", data: font400, weight: 400, style: "normal" },
          { name: "Readex Pro", data: font600, weight: 600, style: "normal" },
          { name: "Readex Pro", data: font700, weight: 700, style: "normal" },
        ],
      }
    );
  }

  return new ImageResponse(
    (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0B101B 0%, #10202E 50%, #0B101B 100%)",
          color: "#F4F7F4",
          fontFamily: "Readex Pro",
          padding: "64px 72px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient emerald glow */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: isRtl ? undefined : -160,
            left: isRtl ? -160 : undefined,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(76,143,95,0.45) 0%, rgba(76,143,95,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: isRtl ? -120 : undefined,
            left: isRtl ? undefined : -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(46,87,64,0.55) 0%, rgba(46,87,64,0) 70%)",
          }}
        />

        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #4C8F5F 0%, #2E5740 100%)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 512 512" fill="none">
              <path
                d="M218 322 C 218 322, 64 222, 64 128 C 64 66, 104 38, 146 50 C 168 57, 198 78, 218 104 C 238 78, 268 57, 290 50 C 332 38, 372 66, 372 128 C 372 222, 218 322, 218 322 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -0.5 }}>
              FibroCare
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: "#A7B8AC",
                letterSpacing: 0.2,
              }}
            >
              {copy.eyebrow}
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            marginTop: "auto",
            marginBottom: "auto",
            position: "relative",
            maxWidth: 960,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -1,
              color: "#FFFFFF",
              textShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            {copy.headline}
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.5, color: "#C7D3CC", maxWidth: 880 }}>
            {copy.subhead}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <span style={{ fontSize: 24, color: "#7E9A8A", fontWeight: 400 }}>
            {copy.footer}
          </span>
          <span style={{ fontSize: 24, color: "#4C8F5F", fontWeight: 600, letterSpacing: 0.3 }}>
            fibrocare.app
          </span>
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: [
        { name: "Readex Pro", data: font400, weight: 400, style: "normal" },
        { name: "Readex Pro", data: font600, weight: 600, style: "normal" },
        { name: "Readex Pro", data: font700, weight: 700, style: "normal" },
      ],
    }
  );
}
