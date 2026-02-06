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
    function resize(){
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      // lower density: fewer columns
      const count = Math.max(8, Math.floor(w / 40))
      cols = new Array(count).fill(0).map(()=>({y: -Math.random()*h, speed: 0.2 + Math.random()*0.6}))
    }
    function randChar(){
      const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      return chars.charAt(Math.floor(Math.random()*chars.length))
    }
    let raf
    function draw(){
      if(!running){ raf = requestAnimationFrame(draw); return }
      // subtle trail
      ctx.fillStyle = 'rgba(10,10,12,0.12)'
      ctx.fillRect(0,0,w,h)
      ctx.font = '16px monospace'
      for(let i=0;i<cols.length;i++){
        const x = Math.floor(i * (w / cols.length))
        const col = cols[i]
        const y = col.y
        ctx.fillStyle = 'rgba(95,127,98,0.18)' // muted green low opacity
        ctx.shadowColor = 'rgba(95,127,98,0.35)'
        ctx.shadowBlur = 4
        ctx.fillText(randChar(), x, y)
        col.y = y > h + 20 ? -20 : y + col.speed * 1.2 // slower motion
        // slight organic speed variation
        col.speed += (Math.random()-0.5)*0.02
        if(col.speed < 0.1) col.speed = 0.1
        if(col.speed > 1) col.speed = 1
      }
      raf = requestAnimationFrame(draw)
    }
    function start(){
      // reinit so drops start from top
      cols.forEach(c=> c.y = -Math.random()*h)
      running = true
    }
    resize()
    window.addEventListener('resize', resize)
    // initial static for ~300ms then start
    const t = setTimeout(start, 300)
    raf = requestAnimationFrame(draw)
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize', resize); clearTimeout(t) }
  },[])
  return <canvas ref={ref} style={{position:'fixed',left:0,top:0,width:'100vw',height:'100vh',zIndex:0,pointerEvents:'none'}} />
}
