import React from 'react'
export default function ResultsPanel() {
  return (
    <div className="results-root">
      {/* EXEC SUMMARY */}
      <section className="glass-block reveal">
        <div className="block-title">EXECUTIVE SUMMARY</div>
        <ul className="bullets">
          <li>Public exposures detected: <b>14</b></li>
          <li>High-confidence identity matches: <b>3</b></li>
          <li>Platforms correlated: <b>5</b></li>
          <li>Earliest public trace: <b>2011</b></li>
          <li>Latest observed activity: <b>2024</b></li>
          <li>Exposure level: <b>MODERATE</b></li>
        </ul>
      </section>

      {/* KEY FINDINGS */}
      <section className="glass-block reveal delay-1">
        <div className="block-title">KEY FINDINGS</div>
        <div className="grid-2">
          <div className="finding">
            <div className="finding-title">Email address appears in multiple credential datasets</div>
            <div className="finding-body blurred">j***@gmail.com · dataset references · timestamps</div>
          </div>
          <div className="finding">
            <div className="finding-title">Username reused across multiple platforms</div>
            <div className="finding-body blurred">shadow**** · 6 platforms · correlation score</div>
          </div>
          <div className="finding">
            <div className="finding-title">Profile image match detected on public forum</div>
            <div className="finding-body blurred">match confidence · source preview</div>
          </div>
          <div className="finding">
            <div className="finding-title">Archived forum activity referencing operational context</div>
            <div className="finding-body blurred">“I remember when we deployed to—”</div>
          </div>
        </div>
        <div className="muted-note">Click to upgrade for full findings.</div>
      </section>

      {/* RAW INTELLIGENCE */}
      <section className="glass-block reveal delay-2">
        <div className="block-title">RAW INTELLIGENCE (locked)</div>
        <div className="mono">
          <div>4 sources detected</div>
          <div>Email: <b>j***@gmail.com</b></div>
          <div>Username: <b>shadow****</b></div>
          <div>Forum excerpt: <span className="blurred">“I remember when we deployed to—”</span></div>
        </div>
      </section>

      {/* PAYWALL CTA */}
      <section className="glass-block reveal delay-3 paywall">
        <div className="paywall-title">Restricted Intelligence</div>
        <div className="paywall-body">
          Some findings are withheld due to sensitivity and correlation depth. Unlock the full public-source intelligence report to continue.
        </div>
        <div className="paywall-actions">
          <button className="hero-button">Unlock Full Report — $9</button>
          <button className="ghost-button">Monthly sub (unlimited)</button>
        </div>
      </section>
    </div>
  );
}
