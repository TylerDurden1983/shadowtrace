import React, { useState, useRef, useEffect } from 'react'

function wait(ms, timers) {
  return new Promise(r => {
    const t = setTimeout(r, ms)
    timers.current.push(t)
  })
}

async function postScan(query) {
  const resp = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })

  const text = await resp.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch (e) {}

  if (!resp.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `HTTP ${resp.status} from /api/scan`
    throw new Error(msg)
  }

  return data
}

export default function ScanConsole({ runSignal, onComplete, query, onResult, onError }) {
  const [state, setState] = useState('IDLE')
  const [lines, setLines] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const runningRef = useRef(false)
  const timers = useRef([])
  const creepTimer = useRef(null)

  useEffect(() => {
    return () => {
      timers.current.forEach(t => clearTimeout(t))
      timers.current = []
      if (creepTimer.current) clearInterval(creepTimer.current)
      creepTimer.current = null
    }
  }, [])

  const appendLine = (text, status) => {
    setLines(l => {
      const next = [...l, { text, status }]
      setActiveIndex(next.length - 1)
      return next
    })
  }

  const markLastDone = () => {
    setLines(l => {
      if (l.length === 0) return l
      const copy = l.slice()
      copy[copy.length - 1] = { ...copy[copy.length - 1], status: 'done' }
      return copy
    })
  }

  const startProgressCreep = (from = 70, cap = 95) => {
    if (creepTimer.current) clearInterval(creepTimer.current)
    creepTimer.current = null

    const start = Date.now()
    setProgress(from)

    creepTimer.current = setInterval(() => {
      // Smooth-ish creep: approaches cap over ~15-20s without ever reaching it
      const elapsed = (Date.now() - start) / 1000
      const p = from + (cap - from) * (1 - Math.exp(-elapsed / 7.5))
      const next = Math.min(cap, Math.floor(p))
      setProgress(next)
    }, 200)
  }

  const stopProgressCreep = () => {
    if (creepTimer.current) clearInterval(creepTimer.current)
    creepTimer.current = null
  }

  async function runSequence() {
    if (runningRef.current) return
    runningRef.current = true

    const q = String(query || '').trim()

    setState('TASKING')
    setLines([])
    setActiveIndex(-1)
    setProgress(0)

    // Trim the “fake” sequence so we get to the real call faster
    const steps = [
      { text: 'TASK ACCEPTED', progress: 4, delay: 220 },
      { text: 'Initializing pipeline...', progress: 12, delay: 260 },
      { text: 'Normalizing identifier', progress: 18, delay: 220 },
      { text: 'Enumerating candidates...', progress: 30, delay: 320 },
      { text: 'Validating public endpoints...', progress: 44, delay: 360 },
      { text: 'Correlating signals...', progress: 58, delay: 380 },
      { text: 'Preparing request...', progress: 66, delay: 260 },
    ]

    try {
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i]
        appendLine(s.text, 'active')
        setProgress(s.progress)
        await wait(s.delay, timers)
        markLastDone()
      }

      appendLine(`Dispatching scan request → /api/scan`, 'active')
      setProgress(70)

      if (!q) {
        markLastDone()
        appendLine('ERROR: Missing query', 'active')
        setProgress(100)
        throw new Error('Missing query. Enter an email, username, or phone.')
      }

      // This is the key fix: keep progress “alive” while the network is working.
      markLastDone()
      appendLine('Awaiting network response…', 'active')
      startProgressCreep(72, 95)

      let result = null
      try {
        result = await postScan(q)
      } finally {
        stopProgressCreep()
        markLastDone()
      }

      appendLine('REPORT READY', 'active')
      setProgress(100)
      await wait(220, timers)
      markLastDone()

      try { window.__shadowtraceLastResult = result } catch (e) {}
      onResult?.(result)

      setActiveIndex(-1)
      setState('COMPLETE')
      onComplete?.()
    } catch (err) {
      stopProgressCreep()

      const msg = err?.message || 'Scan failed.'
      onError?.(msg)

      appendLine(`ERROR: ${msg}`, 'active')
      setProgress(100)
      await wait(320, timers)

      setActiveIndex(-1)
      setState('COMPLETE')
      onComplete?.()
    } finally {
      runningRef.current = false
    }
  }

  useEffect(() => {
    if (runSignal?.current) runSignal.current.run = runSequence
  }, [runSignal, query])

  return (
    <div style={{ marginTop: 24 }}>
      {state !== 'COMPLETE' ? (
        <div style={{ background: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 14, color: '#E5E7EB' }}>
          <div style={{ height: 160, overflow: 'hidden' }}>
            {lines.map((l, i) => (
              <div
                key={i}
                className={`console-line ${i === activeIndex ? 'active' : (i < activeIndex ? 'muted' : '')}`}
                style={{ marginBottom: 6, transition: 'opacity 250ms', fontFamily: 'monospace' }}
              >
                {l.text}
              </div>
            ))}
          </div>

          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: 8, background: '#00c878', transition: 'width 300ms linear' }} />
          </div>
        </div>
      ) : (
        <div style={{ padding: 8 }}>
          <div style={{ fontFamily: 'monospace', color: '#F9FAFB' }}>Scan completed · Public sources only</div>
          <div style={{ height: 80, marginTop: 8, border: '1px dashed rgba(255,255,255,0.04)', borderRadius: 6 }} />
        </div>
      )}
    </div>
  )
}
