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
    setProgress(0)
    try{
      // TASKING (~300ms) - no bar
      setState('TASKING')
      appendLine('TASK ACCEPTED', 'done')
      await wait(300, timers)

      // INITIALIZING (~800ms) bar 0 -> 10
      setState('INITIALIZING')
      appendLine('Initializing recon pipeline...', 'active')
      await wait(500, timers)
      appendLine('Normalizing identifier', 'done')
      await wait(200, timers)
      appendLine('Hashing input', 'done')
      await wait(200, timers)
      appendLine('Spawning workers', 'done')
      setProgress(10)
      await wait(100, timers)

      // COLLECTING (~3-4s) 10 ->25->40->55->65
      setState('COLLECTING')
      const collect = [
        'Enumerating identifier variants...',
        'Querying public identity indexes...',
        'Scanning breach metadata...',
        'Mapping username reuse patterns...',
        'Analyzing social graph overlaps...',
        'Correlating cross-platform signals...'
      ]
      const collectProgress = [25,40,55,65]
      let pIndex = 0
      for(let i=0;i<collect.length;i++){
        appendLine(collect[i], 'done')
        // pause between lines
        await wait(600, timers)
        // update progress at certain points (after certain lines)
        if(i===0){ setProgress(25) }
        else if(i===1){ setProgress(40) }
        else if(i===2){ setProgress(55) }
        else if(i===3){ setProgress(65) }
      }

      // CORRELATING (~1.5-2s) 65->75->85
      setState('CORRELATING')
      appendLine('Cross-referencing signals...', 'active')
      await wait(700, timers)
      markLastDone()
      appendLine('Calculating exposure confidence...', 'done')
      setProgress(75)
      await wait(800, timers)
      setProgress(85)

      // COMPILING (~1s) 85->100
      setState('COMPILING')
      appendLine('Compiling intelligence brief...', 'active')
      await wait(1000, timers)
      markLastDone()
      setProgress(100)

      // COMPLETE
      setState('COMPLETE')
      setLines([{text:'REPORT READY', status:'done'}])
      setActiveIndex(0)
      await wait(700, timers)
      setActiveIndex(-1)
      runningRef.current = false
      onComplete?.()
    }catch(e){
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
            <div key={i} className={`console-line ${i===activeIndex ? 'active' : (l.status==='done' ? 'muted' : '')}`} style={{marginBottom:6, transition:'opacity 300ms', fontFamily:'monospace'}}>{l.text}</div>
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
