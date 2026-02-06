import React from 'react'
import './index.css'
export default function ResultsPanel(){
  return (
    <div style={{padding:12, fontFamily:'system-ui, monospace', color:'#E5E7EB'}}>
      <div className="results-panel" style={{background:'rgba(255,255,255,0.02)', padding:16, borderRadius:8}}>
        <h3 style={{margin:0, marginBottom:8}}>EXECUTIVE SUMMARY</h3>
        <ul style={{textAlign:'left', lineHeight:1.6}}>
          <li>Public exposures detected: <strong>14</strong></li>
          <li>High-confidence identity matches: <strong>3</strong></li>
          <li>Platforms correlated: <strong>5</strong></li>
          <li>Earliest public trace: <strong>2011</strong></li>
          <li>Latest observed activity: <strong>2024</strong></li>
          <li>Exposure level: <strong>MODERATE</strong></li>
        </ul>
      </div>

      <div style={{height:12}} />

      <div style={{background:'rgba(255,255,255,0.02)', padding:16, borderRadius:8}}>
        <h3 style={{marginTop:0}}>KEY FINDINGS</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {[1,2,3,4].map(i=> (
            <div key={i} style={{padding:12, borderRadius:6, background:'rgba(0,0,0,0.25)'}}>
              <div style={{fontWeight:700}}>Finding {i} title</div>
              <div className="blurred" style={{marginTop:8}}>Sensitive detail text blurred for privacy and monetization. Unlock to view full detail.</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:8, fontSize:12, opacity:0.85}}>Click to upgrade for full findings.</div>
      </div>

      <div style={{height:12}} />

      <div style={{background:'rgba(255,255,255,0.02)', padding:16, borderRadius:8}}>
        <h3 style={{marginTop:0}}>RAW INTELLIGENCE (locked)</h3>
        <div style={{opacity:0.95, lineHeight:1.6}}>
          <div>4 sources detected</div>
          <div style={{marginTop:8}}>Email: <strong>j***@gmail.com</strong></div>
          <div>Username: <strong>shadow****</strong></div>
          <div style={{marginTop:8}}>Forum excerpt: <span className="blurred">I remember when we deployed to—</span></div>
        </div>
      </div>

      <div style={{height:12}} />

      <div style={{background:'rgba(255,255,255,0.02)', padding:16, borderRadius:8, textAlign:'center'}}>
        <div style={{fontWeight:700}}>Restricted Intelligence</div>
        <div style={{marginTop:8}}>Some findings are withheld due to sensitivity and correlation depth. Unlock the full public-source intelligence report to continue.</div>
        <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:12}}>
          <button style={{background:'#00c878',border:'none',padding:'10px 14px',borderRadius:6}}>Unlock Full Report — $9</button>
          <button style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',padding:'10px 14px',borderRadius:6}}>Continuous Monitoring — $9/month</button>
        </div>
      </div>
    </div>
  )
}
