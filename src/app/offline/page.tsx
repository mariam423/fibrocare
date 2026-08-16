import type { Metadata } from "next";

/**
 * Offline fallback page.
 *
 * The service worker precaches this page at install time and serves it for any
 * navigation that fails while the device is offline (network-first strategy).
 * Because it is rendered from the cache — where the hashed /_next/ CSS chunks
 * may not be available — it ships its own critical styles inline so it always
 * looks like part of the app, in both light and dark mode.
 */
export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export const dynamic = "force-static";

const criticalStyles = `
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: "Readex Pro", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    background: #fafafa;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #060d0c; color: #e8f0eb; }
  }

  .fc-card {
    width: 100%;
    max-width: 26rem;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow:
      inset 0 1px 0 0 rgba(15, 23, 42, 0.06),
      0 1px 2px rgba(15, 23, 42, 0.02),
      0 4px 20px rgba(15, 23, 42, 0.03),
      0 12px 40px rgba(15, 23, 42, 0.04);
    padding: 2.5rem 2rem 2rem;
    text-align: center;
  }
  @media (prefers-color-scheme: dark) {
    .fc-card {
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(14, 24, 23, 0.72);
      box-shadow:
        inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
        0 2px 4px rgba(0, 0, 0, 0.2),
        0 8px 32px rgba(0, 0, 0, 0.37);
    }
  }

  .fc-orb {
    width: 3.5rem;
    height: 3.5rem;
    margin: 0 auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    border: 1px solid rgba(59, 107, 72, 0.2);
    background: rgba(59, 107, 72, 0.1);
    color: #3b6b48;
    animation: fc-breathe 5s ease-in-out infinite;
  }
  @media (prefers-color-scheme: dark) {
    .fc-orb {
      border-color: rgba(143, 191, 155, 0.36);
      background: rgba(143, 191, 155, 0.16);
      color: #8fbf9b;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .fc-orb { animation: none; }
  }
  @keyframes fc-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
  }

  .fc-orb svg { width: 1.75rem; height: 1.75rem; }

  .fc-title {
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.02em;
  }
  .fc-copy {
    margin-top: 0.75rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #5b6575;
  }
  @media (prefers-color-scheme: dark) {
    .fc-copy { color: #a5b8ac; }
  }

  .fc-path {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    opacity: 0.7;
    overflow-wrap: anywhere;
  }

  .fc-actions {
    margin-top: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  .fc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.625rem;
    padding: 0.625rem 1rem;
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
  }
  .fc-btn-primary {
    border: 1px solid #3b6b48;
    background: #3b6b48;
    color: #ffffff;
  }
  .fc-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(59, 107, 72, 0.28); }
  @media (prefers-color-scheme: dark) {
    .fc-btn-primary {
      border-color: #8fbf9b;
      background: #8fbf9b;
      color: #0c1f12;
    }
    .fc-btn-primary:hover { box-shadow: 0 4px 18px rgba(143, 191, 155, 0.28); }
  }
  .fc-btn-ghost {
    border: 1px solid rgba(15, 23, 42, 0.1);
    background: transparent;
    color: inherit;
  }
  .fc-btn-ghost:hover { background: rgba(15, 23, 42, 0.05); }
  @media (prefers-color-scheme: dark) {
    .fc-btn-ghost {
      border-color: rgba(255, 255, 255, 0.12);
    }
    .fc-btn-ghost:hover { background: rgba(255, 255, 255, 0.06); }
  }
  @media (prefers-reduced-motion: reduce) {
    .fc-btn { transition: none; }
    .fc-btn:hover { transform: none; }
  }
`;

const retryScript = `(function(){try{var p=document.getElementById("fc-path");if(p)p.textContent=location.pathname}catch(e){}var b=document.getElementById("fc-retry");if(b)b.addEventListener("click",function(){location.reload()})})();`;

export default function OfflinePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
      <main className="fc-card" role="main">
        <div className="fc-orb" aria-hidden="true">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 26h8l4-10 6 18 5-12 3 6h10" />
          </svg>
        </div>
        <h1 className="fc-title">You&rsquo;re offline</h1>
        <p className="fc-copy" dir="auto">
          FibroCare is still here — your check-ins and notes stay safe on this
          device. Reconnect to keep tracking.
        </p>
        <span className="fc-path" id="fc-path" aria-hidden="true" />
        <div className="fc-actions">
          <button type="button" id="fc-retry" className="fc-btn fc-btn-primary">
            Try again
          </button>
          <a className="fc-btn fc-btn-ghost" href="/">
            Back to home
          </a>
        </div>
      </main>
      <script dangerouslySetInnerHTML={{ __html: retryScript }} />
    </>
  );
}
