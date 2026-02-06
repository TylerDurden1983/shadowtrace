import React, {useState, useRef, useEffect} from 'react'

function wait(ms, timers){
  return new Promise(r=>{ const t = setTimeout(r, ms); timers.current.push(t) })
}

export default function ScanConsole({runSignal, onComplete}){
  const [state, setState] = useState('IDLE')
  const [lines, setLines] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const runningRef = useRef(false)
  const timers = useRef([])

  useEffect(()=>{
    return ()=>{ // cleanup timers on unmount
      timers.current.forEach(t=>clearTimeout(t))
      timers.current = []
    }
  },[])

  const appendLine = (text, status) => {
    setLines(l => { const next = [...l, {text, status}]; setActiveIndex(next.length-1); return next })
  }
  const markLastDone = () => {
    setLines(l => { if(l.length===0) return l; const copy = l.slice(); copy[copy.length-1] = {...copy[copy.length-1], status:'done'}; return copy })
  }

  const animateProgressTo = (target, duration) => {
    return new Promise(res=>{
      const start = progress
      const delta = target - start
      if(duration <= 0){ setProgress(target); return res() }
      const stepMs = 50
      const steps = Math.max(1, Math.floor(duration/stepMs))
      let cur = 0
      const t = setInterval(()=>{
        cur++
        const v = Math.round(start + delta*(cur/steps))
        setProgress(v)
        if(cur>=steps){ clearInterval(t); timers.current.push(t); return res() }
      }, stepMs)
      timers.current.push(t)
    })
  }

  async function runSequence(){
    if(runningRef.current) return
    runningRef.current = true
    // reset state for a fresh run
    setState('TASKING')
    setLines([])
    setActiveIndex(-1)
    setProgress(0)

    const steps = [
      {text:'TASK ACCEPTED', progress:3, delay:450},
      {text:'Initializing reconnaissance pipeline...', progress:10, delay:900},
      {text:'Normalizing identifier', progress:16, delay:650},
      {text:'Hashing input', progress:22, delay:650},
      {text:'Spawning workers', progress:28, delay:650},
      {text:'Enumerating identifier variants...', progress:36, delay:750},
      {text:'Querying public identity indexes...', progress:46, delay:750},
      {text:'Scanning breach metadata...', progress:58, delay:850},
      {text:'Mapping username reuse patterns...', progress:68, delay:850},
      {text:'Analyzing social graph overlaps...', progress:76, delay:850},
      {text:'Correlating cross-platform signals...', progress:84, delay:900},
      {text:'Cross-referencing signals...', progress:90, delay:900},
      {text:'Calculating exposure confidence...', progress:96, delay:900},
      {text:'Compiling intelligence brief...', progress:100, delay:1100},
      {text:'REPORT READY', progress:100, delay:400},
    ]

    try{
      for(let i=0;i<steps.length;i++){
        const s = steps[i]
        appendLine(s.text, 'active')
        // animate progress to target over the step delay
        await animateProgressTo(s.progress, s.delay)
        // mark current as done
        markLastDone()
      }
      // briefly highlight REPORT READY then clear
      setActiveIndex(lines.length) // last index (may be stale, but fine)
      await wait(300, timers)
      setActiveIndex(-1)
    }finally{
      // final cleanup and notify parent
      setState('COMPLETE')
      runningRef.current = false
      onComplete?.()
    }
  }

  // expose runSequence to parent via runSignal ref
  useEffect(() => {
    if (runSignal?.current) runSignal.current.run = runSequence
  }, [runSignal])

  return (
    <div style={{marginTop:24}}>
      {state!== 'COMPLETE' ? (
      <div style={{background:'rgba(0,0,0,0.45)', borderRadius:8, padding:12, fontFamily:'monospace', fontSize:14, color:'#E5E7EB'}}>
        <div style={{height:160, overflow:'hidden'}}>
          {lines.map((l,i)=> (
            <div key={i} className={`console-line ${i===activeIndex ? 'active' : (i<activeIndex ? 'muted' : '')}`} style={{marginBottom:6, transition:'opacity 300ms', fontFamily:'monospace'}}>{l.text}</div>
          ))}
        </div>
        <div style={{height:8, background:'rgba(255,255,255,0.06)', borderRadius:4, marginTop:10, overflow:'hidden'}}>
          <div style={{width: `${progress}%`, height:8, background:'#00c878', transition:'width 800ms linear'}} />
        </div>
      </div>
      ) : (
        <div style={{padding:8}}>
          <div style={{fontFamily:'monospace', color:'#F9FAFB'}}>Scan completed · Public sources only</div>
          <div style={{height:80, marginTop:8, border: '1px dashed rgba(255,255,255,0.04)', borderRadius:6}} />
        </div>
      )}
    </div>
  )
}
