import React, {useRef, useState} from 'react'
import ScanConsole from './ScanConsole'
import ResultsPanel from './ResultsPanel'
import './matrix.css'
import './index.css'
import './App.css'

export default function App(){
  const consoleRef = useRef(null)
  const [query, setQuery] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | scanning | results
  const [scanNonce, setScanNonce] = useState(0)

  const startScan = () => {
    if(isRunning) return
    setIsRunning(true)
    setPhase('scanning')
    setScanNonce(n=>n+1)
    setTimeout(()=>{ consoleRef.current?.run?.() }, 180)
  }
  const handleComplete = () => {
    setIsRunning(false)
    // fade console out, then show results
    setTimeout(()=>{ setPhase('results') }, 450)
  }

  const glassClass = phase === 'idle' ? 'glass-panel glass-closed' : phase === 'scanning' ? 'glass-panel glass-open' : 'glass-panel glass-results'

  return (
    <div className="matrix-wrap">
      <main className="container-max hero">
        <h1 className="title">SHADOWTRACE</h1>
        <p className="tagline">Find your public footprint. Before someone else does.</p>
        <div className="hero-controls">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Enter email, username, or" className="hero-input" disabled={isRunning} />
          <button className="hero-button" onClick={startScan} disabled={isRunning}>{isRunning ? 'TASKING' : 'Scan'}</button>
        </div>
        <a className="sample-link" href="#">See a sample report →</a>
        <div className="disclaimer">Only searches public sources. No hacks. No magic.</div>

        <div className={glassClass}>
          <div className={`console-layer ${phase === 'results' ? 'layer-out' : 'layer-in'}`}>
            <ScanConsole key={`console-${scanNonce}`} runSignal={consoleRef} onComplete={handleComplete} />
          </div>
          <div className={`results-layer ${phase === 'results' ? 'layer-in' : 'layer-out'}`}>
            {phase === 'results' && <ResultsPanel key={`results-${scanNonce}`} />}
          </div>
        </div>
      </main>
    </div>
  )
}
