import React, {useRef, useState} from 'react'
import MatrixCanvas from './matrix/MatrixCanvas'
import ScanConsole from './ScanConsole'
import ResultsPanel from './ResultsPanel'
import './index.css'
export default function App(){
  const consoleRef = useRef({})
  const [isRunning, setIsRunning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [resultsVisible, setResultsVisible] = useState(false)
  const [scanNonce, setScanNonce] = useState(0)
  const [panelMode, setPanelMode] = useState('closed') // closed | open | handoff | results | results-exit

  function onScanClick(){
    if(isRunning) return
    const startScan = () => {
      setIsRunning(true)
      setPanelMode('open')
      setScanNonce(n=>n+1)
      // let the console mount, then run
      setTimeout(()=>{
        if(consoleRef.current && typeof consoleRef.current.run === 'function'){
          consoleRef.current.run()
        }
      },60)
    }
    // If results are visible, animate them out first
    if(showResults){
      setPanelMode('results-exit')
      setResultsVisible(false)
      setTimeout(()=>{ setShowResults(false); startScan() }, 260)
      return
    }
    // Normal first scan
    startScan()
  }

  function handleComplete(){
    setIsRunning(false)
    // Begin morph: mount results hidden, then fade in while console visible
    setShowResults(true)
    setPanelMode('handoff')
    // trigger results enter on next frame
    requestAnimationFrame(()=> setResultsVisible(true))
    // after crossfade completes, lock into results mode
    setTimeout(()=> setPanelMode('results'), 320)
  }

  const hatchMode = panelMode === 'closed' ? 'hatch-closed' : panelMode === 'open' ? 'hatch-open' : (panelMode === 'results' || panelMode === 'handoff' || panelMode === 'results-exit') ? 'hatch-results' : 'hatch-settled'

  return (
    <div style={{minHeight:'100vh'}}>
      <MatrixCanvas />
      <main style={{position:'relative',zIndex:10,display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
        <div className="container-max text-center">
          <div className="glass-panel"> 
            <h1 className="hero-title">SHADOWTRACE</h1>
            <p className="hero-sub mt-6">Find your public footprint. Before someone else does.</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <input id="queryInput" aria-label="query" placeholder="Enter email, username, or phone" className="w-full max-w-md px-4 py-3 rounded input-cta" disabled={isRunning} />
                <button id="scanBtn" onClick={onScanClick} className="button-cta" style={{borderRadius:8}} disabled={isRunning}>{isRunning ? 'TASKING' : 'Scan'}</button>
              </div>
              <div className="secondary-cta">See a sample report →</div>
            </div>
            <p className="disclaimer mt-6">Only searches public sources. No hacks. No magic.</p>

            <div className={`hatch ${hatchMode}`} style={{marginTop:16}}>
              <div className={`console-wrap ${(panelMode === 'open' || panelMode === 'handoff') ? 'console-visible' : 'console-hidden'}`} style={{transitionDelay: panelMode==='open' ? '150ms' : '0ms'}}>
                <ScanConsole key={`console-${scanNonce}`} runSignal={consoleRef} onComplete={handleComplete} />
              </div>
              <div className={`results-wrap ${resultsVisible ? 'results-visible' : 'results-hidden'}`}>
                {showResults && <ResultsPanel key={`results-${scanNonce}`} />}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
