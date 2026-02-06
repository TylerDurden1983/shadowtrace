import React, {useState, useRef, useEffect} from 'react'

const STATES = ['IDLE','TASKING','INITIALIZING','COLLECTING','CORRELATING','COMPILING','COMPLETE']

function wait(ms, timers){
  return new Promise(r=>{ const t = setTimeout(r, ms); timers.current.push(t) })
}

export default function ScanConsole({runSignal, onComplete}){
  const [state, setState] = useState('IDLE')
  const [lines, setLines] = useState([])
  const [progress, setProgress] = useState(0)
  const runningRef = useRef(false)
  const timers = useRef([])

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
      setLines(l=>[...l, {text:'TASK ACCEPTED', status:'done'}])
      await wait(300, timers)

      // INITIALIZING (~800ms) bar 0 -> 10
      setState('INITIALIZING')
      setLines(l=>[...l, {text:'Initializing recon pipeline...', status:'active'}])
      await wait(500, timers)
      setLines(l=>[...l, {text:'Normalizing identifier', status:'done'}])
      await wait(200, timers)
      setLines(l=>[...l, {text:'Hashing input', status:'done'}])
      await wait(200, timers)
      setLines(l=>[...l, {text:'Spawning workers', status:'done'}])
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
        setLines(l=>[...l, {text:collect[i], status:'done'}])
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
      setLines(l=>[...l, {text:'Cross-referencing signals...', status:'active'}])
      await wait(700, timers)
      setLines(l=>[...l.slice(0,-1), {text:'Cross-referencing signals...', status:'done'}])
      setLines(l=>[...l, {text:'Calculating exposure confidence...', status:'done'}])
      setProgress(75)
      await wait(800, timers)
      setProgress(85)

      // COMPILING (~1s) 85->100
      setState('COMPILING')
      setLines(l=>[...l, {text:'Compiling intelligence brief...', status:'active'}])
      await wait(1000, timers)
      setLines(l=>[...l.slice(0,-1), {text:'Compiling intelligence brief...', status:'done'}])
      setProgress(100)

      // COMPLETE
      setState('COMPLETE')
      setLines([{text:'REPORT READY', status:'done'}])
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
            <div key={i} style={{color: l.status==='active' ? '#7CFC9A' : '#9CA3AF', opacity: l.status==='done'?0.95:1, marginBottom:6, transition:'opacity 300ms'}}>{l.text}</div>
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
