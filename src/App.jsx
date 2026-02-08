import React, { useRef, useState } from 'react'
import MatrixCanvas from './matrix/MatrixCanvas'
import ScanConsole from './ScanConsole'
import ResultsPanel from './ResultsPanel'
import './index.css'

export default function App() {
  const runSignal = useRef({})
  const [isRunning, setIsRunning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [scanNonce, setScanNonce] = useState(0)

  const [query, setQuery] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [lastError, setLastError] = useState(null)

  const startScan = () => {
    if (isRunning) return

    const q = query.trim()
    if (!q) {
      setLastError('Enter something to scan (email / username / phone).')
      setShowResults(false)
      return
    }

    setLastError(null)
    setIsRunning(true)
    setShowResults(false)
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

  const handleScanResult = (result) => {
    setLastResult(result)
    try {
      localStorage.setItem('shadowtrace:lastResult', JSON.stringify(result))
    } catch (e) {}
  }

  const handleScanError = (msg) => {
    setLastError(msg || 'Scan failed.')
    setLastResult(null)
    try {
      localStorage.removeItem('shadowtrace:lastResult')
    } catch (e) {}
  }

  const handleComplete = () => {
    setIsRunning(false)
    setShowResults(true)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <MatrixCanvas />

      <main
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '100%',
          padding: '0 18px'
        }}
      >
        <div style={{ width: 'min(1180px, 100%)', paddingTop: 72 }}>
          <div
            style={{
              background: 'rgba(0,0,0,0.6)',
              borderRadius: 12,
              padding: '36px 32px',
              display: 'block',
              width: '100%',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h1 className="hero-title">SHADOWTRACE</h1>
              <p className="hero-sub mt-6">Find your public footprint. Before someone else does.</p>

              <div className="mt-8 flex flex-col items-center gap-3">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: 'min(720px, 100%)' }}>
                  <input
                    aria-label="query"
                    placeholder="Enter email, username, or phone"
                    className="w-full px-4 py-3 rounded input-cta"
                    disabled={isRunning}
                    style={{ opacity: isRunning ? 0.6 : 1 }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') startScan()
                    }}
                  />

                  <button
                    onClick={startScan}
                    className="button-cta"
                    style={{ borderRadius: 8, opacity: isRunning ? 0.8 : 1, whiteSpace: 'nowrap' }}
                    disabled={isRunning}
                  >
                    {isRunning ? 'TASKING' : 'Scan'}
                  </button>
                </div>

                {lastError ? (
                  <div style={{ color: '#ff6b6b', fontFamily: 'monospace', fontSize: 13 }}>
                    {lastError}
                  </div>
                ) : (
                  <div className="secondary-cta">See a sample report →</div>
                )}
              </div>

              <p className="disclaimer mt-6">Only searches public sources. No hacks. No magic.</p>
            </div>

            <div className="panel-layers" style={{ marginTop: 10 }}>
              <div className={[ 'layer', 'console-layer', isRunning ? 'layer-in' : 'layer-out' ].join(' ')}>
                <div className="console-wrap">
                  <ScanConsole
                    key={`console-${scanNonce}`}
                    runSignal={runSignal}
                    query={query}
                    onResult={handleScanResult}
                    onError={handleScanError}
                    onComplete={handleComplete}
                  />
                </div>
              </div>

              <div className={[ 'layer', 'results-layer', showResults ? 'layer-in' : 'layer-out' ].join(' ')}>
                {showResults ? (
                  <div style={{ textAlign: 'left' }}>
                    <ResultsPanel key={`results-${scanNonce}`} data={lastResult} error={lastError} />
                  </div>
                ) : null}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
