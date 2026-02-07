import React, { useRef, useState } from 'react'
import MatrixCanvas from './matrix/MatrixCanvas'
import ScanConsole from './ScanConsole'
import ResultsPanel from './ResultsPanel'
import './index.css'

export default function App() {
  const runSignal = useRef({})
  const [isRunning, setIsRunning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showConsole, setShowConsole] = useState(true)
  const [scanNonce, setScanNonce] = useState(0)

  const startScan = () => {
    if (isRunning) return
    setIsRunning(true)
    setShowResults(false)
    setShowConsole(true)
    setScanNonce(n => n + 1)
    const start = Date.now()
    const tick = () => {
      const fn = runSignal.current?.run
      if (typeof fn === 'function') { fn(); return }
      if (Date.now() - start > 1500) { setIsRunning(false); return }
      setTimeout(tick, 25)
    }
    setTimeout(tick, 0)
  }

  const handleComplete = () => {
    setIsRunning(false)
    setShowResults(true)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <MatrixCanvas />
      <main style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
        <div className="container-max text-center" style={{ paddingTop: 72 }}>
          <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: '36px 32px', display: 'inline-block', backdropFilter: 'blur(4px)' }}>
            <h1 className="hero-title">SHADOWTRACE</h1>
            <p className="hero-sub mt-6">Find your public footprint. Before someone else does.</p>

            <div className="mt-8 flex flex-col items-center gap-3">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input aria-label="query" placeholder="Enter email, username, or phone" className="w-full max-w-md px-4 py-3 rounded input-cta" disabled={isRunning} style={{ opacity: isRunning ? 0.6 : 1 }} />
                <button onClick={startScan} className="button-cta" style={{ borderRadius: 8, opacity: isRunning ? 0.8 : 1 }} disabled={isRunning}>
                  {isRunning ? 'TASKING' : 'Scan'}
                </button>
              </div>
              <div className="secondary-cta">See a sample report →</div>
            </div>

            <p className="disclaimer mt-6">Only searches public sources. No hacks. No magic.</p>

            <div className="panel-layers">
              <div className={[ 'layer', 'console-layer', isRunning ? 'layer-in' : 'layer-out' ].join(' ')}>
                <div className="console-wrap">
                  <ScanConsole key={`console-${scanNonce}`} runSignal={runSignal} onComplete={handleComplete} />
                </div>
              </div>

              <div className={[ 'layer', 'results-layer', showResults ? 'layer-in' : 'layer-out' ].join(' ')}>
                {showResults ? <ResultsPanel key={`results-${scanNonce}`} /> : null}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
