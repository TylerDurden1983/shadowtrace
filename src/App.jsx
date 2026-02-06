import React from 'react'
import MatrixCanvas from './matrix/MatrixCanvas'
import './index.css'
export default function App(){
  return (
    <div className="min-h-screen">
      <MatrixCanvas />
      <div style={{position:'fixed',inset:0,zIndex:5,pointerEvents:'none',background:'rgba(0,0,0,0.4)',backdropFilter:'blur(2px)'}} />
      <main style={{position:'relative',zIndex:10}} className="min-h-screen flex items-center justify-center">
        <div className="container-max">
          <h1 className="hero-title text-center">SHADOWTRACE</h1>
          <p className="hero-sub text-center mt-4">Find your public footprint. Before someone else does.</p>
          <div className="mt-8 flex gap-2">
            <input aria-label="query" placeholder="Enter email, username, or phone" className="flex-1 px-4 py-3 rounded placeholder-gray-400 outline-none" />
            <button onClick={(e)=>e.preventDefault()} className="px-4 py-3 bg-green-500 text-black font-semibold rounded">Scan</button>
          </div>
          <p className="text-sm mt-4" style={{opacity:0.9}}>Only searches public sources. No hacks. No magic.</p>
        </div>
      </main>
    </div>
  )
}
