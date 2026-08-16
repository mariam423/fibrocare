"use client";

import { flushSync } from "react-dom";
import { ViewTransition, useTransition, useState } from "react";

export default function VTTestPage() {
  const [tab, setTab] = useState("a");
  const [syncTab, setSyncTab] = useState("x");
  const [, startTransition] = useTransition();
  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <button
        id="vt-toggle"
        onClick={() =>
          startTransition(() => setTab((t) => (t === "a" ? "b" : "a")))
        }
      >
        toggle (startTransition)
      </button>
      <button
        id="vt-toggle-sync"
        onClick={() =>
          flushSync(() => setSyncTab((t) => (t === "x" ? "y" : "x")))
        }
      >
        toggle (flushSync)
      </button>
      <div id="sync-result">sync box: {syncTab}</div>
      <ViewTransition key={tab} name="box" share="auto" enter="auto" default="none">
        <div
          id="vt-box"
          style={{ width: 200, height: 100, background: "teal", color: "#fff" }}
        >
          {tab}
        </div>
      </ViewTransition>
      <ViewTransition
        key={syncTab}
        name="syncbox"
        share="auto"
        enter="auto"
        default="none"
      >
        <div
          id="vt-box-sync"
          style={{ width: 200, height: 100, background: "olive", color: "#fff" }}
        >
          {syncTab}
        </div>
      </ViewTransition>
    </div>
  );
}
