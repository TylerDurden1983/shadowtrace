import React from 'react'
import MatrixCanvas from './matrix/MatrixCanvas'
export default function App(){
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <MatrixCanvas />
      <main className="relative z-10 max-w-lg w-full px-6">
        <h1 className="text-5xl md:text-6xl font-black text-center tracking-widest">SHADOWTRACE</h1>
        <p className="text-center mt-4 opacity-80">OSINT Self Recon</p>
        <div className="mt-8 flex gap-2">
          <input aria-label="query" placeholder="Enter email, username, or phone" className="flex-1 px-4 py-3 rounded bg-white bg-opacity-6 placeholder-gray-400 outline-none" />
          <button onClick={(e)=>e.preventDefault()} className="px-4 py-3 bg-green-500 text-black font-semibold rounded">Scan</button>
        </div>
        <p className="text-sm mt-4 opacity-70">Only searches public sources. No hacks. No magic.</p>
      </main>
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="scanlines"></div>
        <div className="vignette"></div>
      </div>
    </div>
  )
}
