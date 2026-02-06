import React, { useRef, useState } from "react";
import MatrixCanvas from "./matrix/MatrixCanvas";
import ScanConsole from "./ScanConsole";
import ResultsPanel from "./ResultsPanel";
import "./index.css";

export default function App() {
  const consoleRef = useRef({});
  const [panelMode, setPanelMode] = useState("closed"); // closed | open | results
  const [phase, setPhase] = useState("idle"); // idle | scanning | results
  const [scanNonce, setScanNonce] = useState(0);
  const [query, setQuery] = useState("");

  function beginScan() {
    if (phase === "scanning") return;
    // If we're in results, animate out first, then restart scan.
    if (phase === "results") {
      setPanelMode("open");
      setPhase("scanning");
      setScanNonce((n) => n + 1);
      setTimeout(() => {
        if (consoleRef.current && typeof consoleRef.current.run === "function") {
          consoleRef.current.run();
        }
      }, 150);
      return;
    }

    setPanelMode("open");
    setPhase("scanning");
    setScanNonce((n) => n + 1);
    // tiny delay so the panel visibly opens before console starts typing
    setTimeout(() => {
      if (consoleRef.current && typeof consoleRef.current.run === "function") {
        consoleRef.current.run();
      }
    }, 150);
  }

  function onComplete() {
    // console finishes -> morph to results
    setPanelMode("results");
    setPhase("results");
  }

  const isRunning = phase === "scanning";

  return (
    <div style={{ minHeight: "100vh" }}>
      <MatrixCanvas />
      <main className="app-shell">
        <div className="container-max">
          <div
            className={[
              "glass-panel",
              panelMode === "closed"
                ? "glass-closed"
                : panelMode === "open"
                ? "glass-open"
                : "glass-results",
            ].join(" ")}
          >
            <h1 className="hero-title">SHADOWTRACE</h1>
            <p className="hero-sub mt-6">Find your public footprint. Before someone else does.</p>

            <div className="mt-8 flex flex-col items-center gap-3">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  id="queryInput"
                  aria-label="query"
                  placeholder="Enter email, username, or phone"
                  className="w-full max-w-md px-4 py-3 rounded input-cta"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isRunning}
                />
                <button
                  id="scanBtn"
                  onClick={(e) => {
                    e.preventDefault();
                    beginScan();
                  }}
                  className="button-cta"
                  style={{ borderRadius: 8 }}
                  disabled={isRunning}
                >
                  {isRunning ? "TASKING" : "Scan"}
                </button>
              </div>
              <div className="secondary-cta">See a sample report →</div>
            </div>

            <p className="disclaimer mt-6">Only searches public sources. No hacks. No magic.</p>

            {/* LAYERS: console then results. Both mounted; opacity + pointer-events controlled by CSS */}
            <div className="panel-layers">
              <div className={[
                "layer",
                "console-layer",
                phase === "scanning" ? "layer-in" : "layer-out",
              ].join(" ")} >
                <div className="console-wrap console-visible">
                  <ScanConsole key={`console-${scanNonce}`} runSignal={consoleRef} onComplete={onComplete} />
                </div>
              </div>

              <div className={[
                "layer",
                "results-layer",
                phase === "results" ? "layer-in" : "layer-out",
              ].join(" ")} >
                <ResultsPanel key={`results-${scanNonce}`} />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
