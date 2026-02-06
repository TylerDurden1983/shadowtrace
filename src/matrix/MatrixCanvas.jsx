import React, {useRef, useEffect} from 'react'
import '../matrix.css'
export default function MatrixCanvas(){
  const ref = useRef(null)
  useEffect(()=>{
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w=0, h=0
    let cols = []
    let running = false
    function setSize(){
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    function resize(){
      setSize()
      const count = Math.max(20, Math.floor(w / 18))
      // per instructions: start y within [0,h] and faster speeds
      cols = new Array(count).fill(0).map(()=>({y: Math.random()*h, speed: 2 + Math.random()*5}))
    }
    function randChar(){
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      return chars.charAt(Math.floor(Math.random()*chars.length))
    }
    let raf
    function draw(){
      if(!running){ raf = requestAnimationFrame(draw); return }
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(0,0,w,h)
      ctx.font = '18px monospace'
      for(let i=0;i<cols.length;i++){
        const x = Math.floor(i * (w / cols.length))
        const col = cols[i]
        const y = col.y
        ctx.fillStyle = 'rgba(0,200,120,0.9)'
        ctx.fillText(randChar(), x, y)
        // update per instructions: use precise y and faster speed
        col.y = col.y > h + 20 ? -20 : col.y + col.speed
      }
      raf = requestAnimationFrame(draw)
    }
    function start(){ cols.forEach(c=> c.y = Math.random()*h); running = true }
    // ensure canvas full-screen size set immediately
    setSize()
    resize()
    window.addEventListener('resize', () => { setSize(); resize(); })
    const t = setTimeout(start, 300)
    raf = requestAnimationFrame(draw)
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize', resize); clearTimeout(t) }
  },[])
  return <canvas ref={ref} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:0,pointerEvents:'none'}} />
}
