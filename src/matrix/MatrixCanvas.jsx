import React, {useRef, useEffect} from 'react'
import '../matrix.css'
export default function MatrixCanvas(){
  const ref = useRef(null)
  useEffect(()=>{
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w, h
    let cols = []
    let runs = false
    function resize(){
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      cols = new Array(Math.ceil(w / 20)).fill(0).map(()=>({y: Math.random()*h, speed: 0.5 + Math.random()*1.2}))
    }
    function randChar(){
      const chars = 'ｱｳｶｷｸｹｺ0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      return chars.charAt(Math.floor(Math.random()*chars.length))
    }
    let raf
    function draw(){
      if(!runs){ raf = requestAnimationFrame(draw); return }
      ctx.fillStyle = 'rgba(10,10,12,0.12)'
      ctx.fillRect(0,0,w,h)
      ctx.font = '16px monospace'
      for(let i=0;i<cols.length;i++){
        const x = i*20
        const col = cols[i]
        const y = col.y
        ctx.fillStyle = '#5f7f62' // muted desaturated green
        ctx.shadowColor = 'rgba(95,127,98,0.6)'
        ctx.shadowBlur = 6
        ctx.fillText(randChar(), x, y)
        col.y = y > h + 50 ? -20 : y + col.speed * 2 // slow motion
        // slight variation per column
        col.speed += (Math.random()-0.5)*0.05
        if(col.speed < 0.2) col.speed = 0.2
        if(col.speed > 2) col.speed = 2
      }
      raf = requestAnimationFrame(draw)
    }
    function start(){ runs = true }
    resize()
    window.addEventListener('resize', resize)
    // start after brief delay to show static background first
    const t = setTimeout(start, 700)
    raf = requestAnimationFrame(draw)
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize', resize); clearTimeout(t) }
  },[])
  return <canvas ref={ref} className="fixed inset-0 w-full h-full -z-10" style={{background:'#08090a'}} />
}
