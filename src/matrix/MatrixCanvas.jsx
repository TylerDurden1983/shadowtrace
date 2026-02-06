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
      const count = Math.max(20, Math.floor(w / 18))
      cols = new Array(count).fill(0).map(()=>({y: -Math.random()*h, speed: 0.08 + Math.random()*0.3}))
    }
    function randChar(){
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZあいうえおカタカナ'
      return chars.charAt(Math.floor(Math.random()*chars.length))
    }
    let raf
    function draw(){
      if(!running){ raf = requestAnimationFrame(draw); return }
      // draw translucent black to create fading trail (tracer)
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(0,0,w,h)
      ctx.font = '18px monospace'
      for(let i=0;i<cols.length;i++){
        const x = Math.floor(i * (w / cols.length))
        const col = cols[i]
        const y = Math.floor(col.y)
        // draw tail: slightly dimmer characters trailing behind head
        for(let t=0;t<5;t++){
          const yy = y - t*18
          if(yy < 0) continue
          const opacity = Math.max(0, 0.8 - t*0.16)
          ctx.fillStyle = `rgba(0,255,102,${opacity * 0.6})`
          ctx.fillText(randChar(), x, yy)
        }
        // bright head
        ctx.fillStyle = 'rgba(180,255,180,0.98)'
        ctx.fillText(randChar(), x, y)
        col.y = y > h + 20 ? -20 : y + col.speed * 1.0
        col.speed += (Math.random()-0.5)*0.01
        if(col.speed < 0.03) col.speed = 0.03
        if(col.speed > 0.6) col.speed = 0.6
      }
      raf = requestAnimationFrame(draw)
    }
    function start(){ cols.forEach(c=> c.y = -Math.random()*h); running = true }
    resize()
    window.addEventListener('resize', resize)
    const t = setTimeout(start, 300)
    raf = requestAnimationFrame(draw)
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize', resize); clearTimeout(t) }
  },[])
  return <canvas ref={ref} style={{position:'fixed',left:0,top:0,width:'100vw',height:'100vh',zIndex:0,pointerEvents:'none'}} />
}
