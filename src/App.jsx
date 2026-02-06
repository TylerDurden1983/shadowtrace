import React, {useRef} from 'react'
import MatrixCanvas from './matrix/MatrixCanvas'
import ScanConsole from './ScanConsole'
import './index.css'
export default function App(){
  const consoleRef = useRef({})
  function onScanClick(e){
    e.preventDefault()
    const input = document.getElementById('queryInput')
    const btn = document.getElementById('scanBtn')
    if(!input || !btn) return
    if(btn.disabled) return
    input.disabled = true
    input.style.opacity = '0.6'
    btn.textContent = 'TASKING'
    btn.disabled = true
    btn.style.opacity = '0.8'
    // trigger console run
    if(consoleRef.current && typeof consoleRef.current.run === 'function'){
      consoleRef.current.run()
    }
  }

  return (
    <div style={{minHeight:'100vh'}}>
      <MatrixCanvas />
      <main style={{position:'relative',zIndex:10,display:'flex',alignItems:'flex-start',justifyContent:'center',width:'100%'}}>
        <div className="container-max text-center" style={{paddingTop:72}}>
          <div style={{background:'rgba(0,0,0,0.6)', borderRadius:12, padding:'36px 32px', display:'inline-block', backdropFilter:'blur(4px)'}}> 
            <h1 className="hero-title">SHADOWTRACE</h1>
            <p className="hero-sub mt-6">Find your public footprint. Before someone else does.</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <input id="queryInput" aria-label="query" placeholder="Enter email, username, or phone" className="w-full max-w-md px-4 py-3 rounded input-cta" />
                <button id="scanBtn" onClick={onScanClick} className="button-cta" style={{borderRadius:8}}>Scan</button>
              </div>
              <div className="secondary-cta">See a sample report →</div>
            </div>
            <p className="disclaimer mt-6">Only searches public sources. No hacks. No magic.</p>
            <ScanConsole runSignal={consoleRef} />
          </div>
        </div>
      </main>
    </div>
  )
}
