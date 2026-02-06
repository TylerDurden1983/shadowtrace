import React, {useRef, useState} from 'react'
import MatrixCanvas from './matrix/MatrixCanvas'
import ScanConsole from './ScanConsole'
import ResultsPanel from './ResultsPanel'
import './index.css'
export default function App(){
  const consoleRef = useRef({})
  const [panelMode, setPanelMode] = useState('closed') // closed | open | settled

  function onScanClick(e){
    e.preventDefault()
    const input = document.getElementById('queryInput')
    const btn = document.getElementById('scanBtn')
    if(!input || !btn) return
    if(btn.disabled) return
    input.disabled = true
    input.style.opacity = '0.6'
    btn.textContent = 'TASKING'
    btn.disabled = true
    btn.style.opacity = '0.8'
    // open hatch
    setPanelMode('open')
    // trigger console run
    if(consoleRef.current && typeof consoleRef.current.run === 'function'){
      consoleRef.current.run()
    }
  }
  function onComplete(){
    const input = document.getElementById('queryInput')
    const btn = document.getElementById('scanBtn')
    if(input){ input.disabled = false; input.style.opacity = '1' }
    if(btn){ btn.disabled = false; btn.style.opacity = '1'; btn.textContent = 'Scan' }
    // settle hatch (compact showing header/placeholder)
    setPanelMode('settled')
  }

  const hatchMode = panelMode === 'closed' ? 'hatch-closed' : panelMode === 'open' ? 'hatch-open' : 'hatch-settled'

  return (
    <div style={{minHeight:'100vh'}}>
      <MatrixCanvas />
      <main style={{position:'relative',zIndex:10,display:'flex',alignItems:'flex-start',justifyContent:'center',width:'100%'}}>
        <div className="container-max text-center" style={{paddingTop:72}}>
          <div className="glass-panel"> 
            <h1 className="hero-title">SHADOWTRACE</h1>
            <p className="hero-sub mt-6">Find your public footprint. Before someone else does.</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <input id="queryInput" aria-label="query" placeholder="Enter email, username, or phone" className="w-full max-w-md px-4 py-3 rounded input-cta" />
                <button id="scanBtn" onClick={onScanClick} className="button-cta" style={{borderRadius:8}}>Scan</button>
              </div>
              <div className="secondary-cta">See a sample report →</div>
            </div>
            <p className="disclaimer mt-6">Only searches public sources. No hacks. No magic.</p>

            <div className={`hatch ${hatchMode}`} style={{marginTop:16}}>
              <div className={`console-wrap ${(panelMode==='open' || panelMode==='settled') ? 'console-visible' : 'console-hidden'}`} style={{transitionDelay: panelMode==='open'?'150ms':'0ms'}}>
                {panelMode === 'settled' ? (
                  <ResultsPanel />
                ) : (
                  <ScanConsole runSignal={consoleRef} onComplete={onComplete} />
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
