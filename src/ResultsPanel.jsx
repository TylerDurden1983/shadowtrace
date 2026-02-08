import React, { useMemo } from "react";

function safeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}

function Badge({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        fontFamily: "monospace",
        fontSize: 12,
        color: "rgba(255,255,255,0.85)",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      {children}
    </span>
  );
}

function StatRow({ label, value }) {
  return (
    <li style={{ marginBottom: 8, display: "flex", gap: 10 }}>
      <span style={{ color: "rgba(255,255,255,0.75)" }}>{label}:</span>
      <strong style={{ color: "rgba(255,255,255,0.92)" }}>{value}</strong>
    </li>
  );
}

function SectionCard({ title, children, accent = false }) {
  return (
    <div
      style={{
        padding: "18px 18px",
        borderRadius: 14,
        background: accent
          ? "linear-gradient(180deg, rgba(0,200,120,0.08), rgba(0,0,0,0.55))"
          : "rgba(0,0,0,0.55)",
        border: accent
          ? "1px solid rgba(0,200,120,0.35)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: accent
          ? "0 0 0 1px rgba(0,200,120,0.15), inset 0 0 18px rgba(0,200,120,0.08)"
          : "none",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          letterSpacing: 0.6,
          fontWeight: 800,
          color: accent
            ? "rgba(200,255,230,0.95)"
            : "rgba(255,255,255,0.92)",
          marginBottom: 12,
          textTransform: "uppercase",
          fontSize: 13,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function sortFindings(findings) {
  if (!Array.isArray(findings)) return [];
  return [...findings].sort((a, b) => {
    const ca = Number(a?.confidence ?? 0);
    const cb = Number(b?.confidence ?? 0);
    if (cb !== ca) return cb - ca;
    return String(a?.source ?? "").localeCompare(String(b?.source ?? ""));
  });
}

export default function ResultsPanel({ data, error }) {
  const liveData = useMemo(() => {
    if (data && typeof data === "object") return data;
    const cached = safeParse(localStorage.getItem("shadowtrace:lastResult") || "");
    if (cached && typeof cached === "object") return cached;
    if (typeof window !== "undefined" && window.__shadowtraceLastResult)
      return window.__shadowtraceLastResult;
    return null;
  }, [data]);

  const summary = liveData?.summary || {};
  const entities = liveData?.entities || { emails: [], usernames: [] };
  const findings = sortFindings(liveData?.findings || []);

  const total = summary.totalFindings ?? findings.length ?? 0;
  const platforms = summary.platforms ?? 0;
  const riskIndicators = summary.riskIndicators ?? 0;
  const confidence = summary.confidence ?? (total > 0 ? "MODERATE" : "LOW");

  const confidenceLabel =
    confidence === "HIGH" ? "HIGH" :
    confidence === "MODERATE" ? "MODERATE" :
    "LOW";

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge>Live report</Badge>
        <Badge>Confidence: {confidenceLabel}</Badge>
        <Badge>Findings: {total}</Badge>
        <Badge>Platforms: {platforms}</Badge>
        <Badge>Risk signals: {riskIndicators}</Badge>
      </div>

      {error ? (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255, 80, 80, 0.12)",
            border: "1px solid rgba(255, 80, 80, 0.25)",
            color: "rgba(255,255,255,0.9)",
            fontFamily: "monospace",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "minmax(280px, 380px) minmax(0, 1fr)",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: "grid", gap: 14 }}>
          <SectionCard title="Executive Summary" accent>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <StatRow label="Public exposures detected" value={total} />
              <StatRow label="Platforms correlated" value={platforms} />
              <StatRow label="Risk indicators" value={riskIndicators} />
              <StatRow label="Exposure level" value={confidenceLabel} />
            </ul>

            <div
              style={{
                marginTop: 14,
                fontSize: 13,
                color: "rgba(200,255,230,0.75)",
              }}
            >
              OSINT-lite assessment. Public sources only. No breach databases yet.
            </div>
          </SectionCard>

          <SectionCard title="Input Entities">
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace", marginBottom: 8 }}>
                  Emails ({entities.emails.length})
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {entities.emails.map((e, i) => (
                    <li key={i} style={{ fontFamily: "monospace" }}>{e}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace", marginBottom: 8 }}>
                  Usernames ({entities.usernames.length})
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {entities.usernames.map((u, i) => (
                    <li key={i} style={{ fontFamily: "monospace" }}>{u}</li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT COLUMN */}
        <SectionCard title="Key Findings">
          {findings.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>
              No public matches found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 12,
              }}
            >
              {findings.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    <Badge>{f.source}</Badge>
                    <Badge>{f.type}</Badge>
                    {typeof f.confidence === "number" && (
                      <Badge>conf {f.confidence.toFixed(2)}</Badge>
                    )}
                  </div>

                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    {f.title}
                  </div>

                  <div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.75 }}>
                    entity: {f.entity}
                  </div>

                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "block",
                      marginTop: 8,
                      color: "rgba(0,200,120,0.95)",
                      fontFamily: "monospace",
                      fontSize: 12,
                      wordBreak: "break-all",
                      textDecoration: "none",
                    }}
                  >
                    {f.url}
                  </a>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
