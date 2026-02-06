import React, {useState, useEffect, useRef} from 'react'

const STATES = ['IDLE','TASKING','INITIALIZING','COLLECTING','CORRELATING','COMPILING','COMPLETE']

export default function ScanConsole({onStart}){
  const [state, setState] = useState('IDLE')
  const [lines, setLines] = useState([])
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(false)
  const containerRef = useRef(null)

  useEffect(()=>{
    if(state==='IDLE') return
    let timers=[]
    async function run(){
      // TASKING
      setState('TASKING')
      setLines(l=>[...l, {text:'TASK ACCEPTED', status:'done'}])
      setProgress(2)
      await new Promise(r=> timers.push(setTimeout(r,300)))
      // INITIALIZING
      setState('INITIALIZING')
      setLines(l=>[...l, {text:'Initializing recon pipeline...', status:'active'}])
      setProgress(8)
      // show sublines
      const initLines=['Normalizing identifier','Hashing input','Spawning workers']
      for(let i=0;i<initLines.length;i++){
        await new Promise(r=> timers.push(setTimeout(r,220)))
        setLines(l=>[...l, {text:initLines[i], status:'done'}])
        setProgress(p=>p+ (i===0?1:1))
      }
      await new Promise(r=> timers.push(setTimeout(r,800)))
      // COLLECTING
      setState('COLLECTING')
      const collectLines=[
        'Enumerating identifier variants...',
        'Querying public identity indexes...',
        'Scanning breach metadata...',
        'Mapping username reuse patterns...',
        'Analyzing social graph overlaps...',
        'Correlating cross-platform signals...'
      ]
      let pct=10
      for(let i=0;i<collectLines.length;i++){
        await new Promise(r=> timers.push(setTimeout(r, 600 + Math.random()*800)))
        setLines(l=>[...l, {text:collectLines[i], status:'done'}])
        pct += (i===0?10: (10 + Math.random()*8))
        setProgress(Math.min(65, Math.floor(pct)))
      }
      // CORRELATING
      setState('CORRELATING')
      setLines(l=>[...l, {text:'Cross-referencing signals...', status:'active'}])
      setProgress(68)
      await new Promise(r=> timers.push(setTimeout(r,900)))
      setLines(l=>lines=>[...lines, {text:'Calculating exposure confidence...', status:'done'}])
      setProgress(82)
      await new Promise(r=> timers.push(setTimeout(r,800)))
      // COMPILING
      setState('COMPILING')
      setLines(l=>[...l, {text:'Compiling intelligence brief...', status:'active'}])
      setProgress(95)
      await new Promise(r=> timers.push(setTimeout(r,1000)))
      setProgress(100)
      // COMPLETE
      setState('COMPLETE')
      setLines(l=>[...l, {text:'REPORT READY', status:'done'}])
      setRunning(false)
      return ()=> timers.forEach(t=>clearTimeout(t))
    }
    run()
    return ()=>{}
  },[state])

  // helper to start from outside
  useEffect(()=>{
    if(!onStart) return
  },[onStart])

  function start(){
    if(running) return
    setLines([])
    setProgress(1)
    setRunning(true)
    setState('TASKING')
  }

  return (
    <div style={{marginTop:24}}>
      <div style={{background:'rgba(0,0,0,0.45)', borderRadius:8, padding:12, fontFamily:'monospace', fontSize:14, color:'#E5E7EB'}}>
        <div style={{height:160, overflow:'hidden'}} ref={containerRef}>
          {lines.map((l,i)=> (
            <div key={i} style={{color: l.status==='active' ? '#7CFC9A' : '#9CA3AF', opacity: l.status==='done'?0.95:1, marginBottom:6, transition:'opacity 300ms'}}>{l.text}</div>
          ))}
        </div>
        <div style={{height:8, background:'rgba(255,255,255,0.06)', borderRadius:4, marginTop:10, overflow:'hidden'}}>
          <div style={{width: `${progress}%`, height:8, background:'#00c878', transition:'width 500ms'}} />
        </div>
        {state==='COMPLETE' && (
          <div style={{marginTop:10, padding:8, background:'rgba(255,255,255,0.03)', borderRadius:6}}>
            <div style={{fontFamily:'monospace', color:'#F9FAFB'}}>Scan completed · Public sources only</div>
            <div style={{height:60, marginTop:8, border: '1px dashed rgba(255,255,255,0.04)', borderRadius:6}} />
          </div>
        )}
      </div>
      <div style={{display:'flex',gap:8,marginTop:12, justifyContent:'center'}}>
        <button onClick={start} style={{padding:'10px 16px', borderRadius:6, background:'#00c878', border:'none', fontFamily:'monospace'}}>Start (dev)</button>
      </div>
    </div>
  )
}
