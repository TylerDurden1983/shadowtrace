import React from 'react'
import MatrixCanvas from './matrix/MatrixCanvas'
import './index.css'
export default function App(){
  return (
    <div style={{minHeight:'100vh'}}>
      <MatrixCanvas />
      <div style={{position:'fixed',inset:0,zIndex:5,pointerEvents:'none',background:'rgba(0,0,0,0.32)'}} />
      <main style={{position:'relative',zIndex:10,display:'flex',alignItems:'flex-start',justifyContent:'center',width:'100%'}}>
        <div className="container-max text-center" style={{paddingTop:72}}>
          <h1 className="hero-title">SHADOWTRACE</h1>
          <p className="hero-sub mt-4">Find your public footprint. Before someone else does.</p>
          <div className="mt-8 flex gap-2 justify-center">
            <input aria-label="query" placeholder="Enter email, username, or phone" className="w-full max-w-md px-4 py-3 rounded placeholder-gray-400 outline-none" />
            <button onClick={(e)=>e.preventDefault()} className="px-4 py-3 bg-green-500 text-black font-semibold rounded">Scan</button>
          </div>
          <p className="text-sm mt-4" style={{opacity:0.9}}>Only searches public sources. No hacks. No magic.</p>
        </div>
      </main>
    </div>
  )
}
