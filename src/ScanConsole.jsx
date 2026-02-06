import React, {useState, useRef, useEffect} from 'react'

const STATES = ['IDLE','TASKING','INITIALIZING','COLLECTING','CORRELATING','COMPILING','COMPLETE']

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

  const appendLine = (text, status) => {
    setLines(l => { const next = [...l, {text, status}]; setActiveIndex(next.length-1); return next })
  }
  const markLastDone = () => {
    setLines(l => { if(l.length===0) return l; const copy = l.slice(); copy[copy.length-1] = {...copy[copy.length-1], status:'done'}; return copy })
  }
  const animateProgressTo = (target, duration) => {
    return new Promise(res=>{
      if(duration<=0){ setProgress(target); return res() }
      const start = progress;
      const delta = target - start;
      const stepMs = 50;
      const steps = Math.max(1, Math.floor(duration/stepMs));
      let cur = 0;
      const t = setInterval(()=>{
        cur++
        const v = Math.round(start + delta*(cur/steps))
        setProgress(v)
        if(cur>=steps){ clearInterval(t); timers.current.push(t); return res() }
      }, stepMs)
      timers.current.push(t)
    })
  }

  useEffect(()=>{
    return ()=>{ // cleanup timers on unmount
      timers.current.forEach(t=>clearTimeout(t))
      timers.current = []
    }
  },[])

  async function runSequence(){
    if(runningRef.current) return
    runningRef.current = true
    setLines([])
    setActiveIndex(-1)
    setProgress(0)
    try{
      // define deterministic steps: text, progressTarget, delay
      const steps = [
        {text:'TASK ACCEPTED', progress:3, delay:300},
        {text:'Initializing reconnaissance pipeline...', progress:10, delay:1000},
        {text:'Normalizing identifier', progress:16, delay:200},
        {text:'Hashing input', progress:22, delay:200},
        {text:'Spawning workers', progress:28, delay:200},
        {text:'Enumerating identifier variants...', progress:36, delay:600},
        {text:'Querying public identity indexes...', progress:46, delay:600},
        {text:'Scanning breach metadata...', progress:58, delay:600},
        {text:'Mapping username reuse patterns...', progress:68, delay:600},
        {text:'Analyzing social graph overlaps...', progress:76, delay:600},
        {text:'Correlating cross-platform signals...', progress:84, delay:600},
        {text:'Cross-referencing signals...', progress:90, delay:700},
        {text:'Calculating exposure confidence...', progress:96, delay:800},
        {text:'Compiling intelligence brief...', progress:100, delay:1000},
        {text:'REPORT READY', progress:100, delay:300}
      ]
      // run steps in order
      for(let i=0;i<steps.length;i++){
        const s = steps[i]
        appendLine(s.text, 'active')
        // animate progress to target over delay
        await animateProgressTo(s.progress, s.delay)
        // mark current as done
        markLastDone()
      }
      // complete handling: briefly highlight REPORT READY then clear
      setActiveIndex(steps.length-1)
      await wait(300, timers)
      setActiveIndex(-1)
    }catch(e){
      // swallow errors but ensure cleanup
      console.error(e)
    }finally{
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
          <div style={{width: `${progress}%`, height:8, background:'#00c878', transition:'width 400ms'}} />
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
