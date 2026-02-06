import React from 'react'
export default function ResultsPanel(){
  const summary = [
    'Public exposures detected: 14',
    'High-confidence identity matches: 3',
    'Platforms correlated: 5',
    'Earliest public trace: 2011',
    'Latest observed activity: 2024',
    'Exposure level: MODERATE'
  ]
  const findings = [
    'Email address appears in multiple credential datasets',
    'Username reused across multiple platforms',
    'Profile image match detected on public forum',
    'Archived forum activity referencing operational context'
  ]
  return (
    <div style={{padding:12, fontFamily:'system-ui, monospace', color:'#E5E7EB'}}>
      
      <div style={{fontFamily:'monospace', color:'#F9FAFB', marginBottom:10}}>Scan completed · Public sources only</div>
      <div className="rp-section" style={{animationDelay:'150ms'}}><div className="results-panel" style={{background:'rgba(255,255,255,0.02)', padding:16, borderRadius:8}}>
        <h3 style={{margin:0, marginBottom:8}}>EXECUTIVE SUMMARY</h3>
        <ul style={{textAlign:'left', lineHeight:1.6}}>
          {summary.map((s,i)=> (
            <li key={i} className="summary-line" style={{animationDelay:`${350 + i*220}ms`}}>{s}</li>
          ))}
        </ul>
      </div></div>

      <div style={{height:12}} />

      <div className="rp-section" style={{animationDelay:'650ms'}}>
      <div style={{background:'rgba(255,255,255,0.02)', padding:16, borderRadius:8}}>
        <h3 style={{marginTop:0}}>KEY FINDINGS</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {findings.map((t,i)=> (
            <div key={i} style={{padding:12, borderRadius:6, background:'rgba(0,0,0,0.25)'}}>
              <div style={{fontWeight:700}}>{t}</div>
              <div className="blurred" style={{marginTop:8}}>Sensitive detail text blurred for privacy and monetization. Unlock to view full detail.</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:8, fontSize:12, opacity:0.85}}>Click to upgrade for full findings.</div>
      </div></div>

      <div style={{height:12}} />

      <div className="rp-section" style={{animationDelay:'650ms'}}>
      <div style={{background:'rgba(255,255,255,0.02)', padding:16, borderRadius:8}}>
        <h3 style={{marginTop:0}}>RAW INTELLIGENCE (locked)</h3>
        <div style={{opacity:0.95, lineHeight:1.6}}>
          <div>4 sources detected</div>
          <div style={{marginTop:8}}>Email: <strong>j***@gmail.com</strong></div>
          <div>Username: <strong>shadow****</strong></div>
          <div style={{marginTop:8}}>Forum excerpt: <span className="blurred">I remember when we deployed to—</span></div>
        </div>
      </div></div>

      <div style={{height:12}} />

      <div className="rp-section" style={{animationDelay:'1450ms'}}>
      <div style={{background:'rgba(255,255,255,0.02)', padding:16, borderRadius:8, textAlign:'center'}}>
        <div style={{fontWeight:700}}>Restricted Intelligence</div>
        <div style={{marginTop:8}}>Some findings are withheld due to sensitivity and correlation depth. Unlock the full public-source intelligence report to continue.</div>
        <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:12}}>
          <button style={{background:'#00c878',border:'none',padding:'10px 14px',borderRadius:6}}>Unlock Full Report — $9</button>
          <button style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',padding:'10px 14px',borderRadius:6}}>Continuous Monitoring — $9/month</button>
        </div>
      </div></div></div>
    </div>
  )
}
