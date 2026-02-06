import React, {useRef, useEffect} from 'react'
import '../matrix.css'
export default function MatrixCanvas(){
  const ref = useRef(null)
  useEffect(()=>{
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w, h
    const cols = []
    function resize(){
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      cols.length = Math.ceil(w / 20)
      for(let i=0;i<cols.length;i++) cols[i] = Math.random()*h
    }
    function randChar(){
      const chars = 'アァカサタナハマヤラワ0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      return chars.charAt(Math.floor(Math.random()*chars.length))
    }
    function draw(){
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fillRect(0,0,w,h)
      ctx.font = '16px monospace'
      for(let i=0;i<cols.length;i++){
        const x = i*20
        const y = cols[i]
        ctx.fillStyle = '#8aff8a'
        ctx.shadowColor = '#38f38f'
        ctx.shadowBlur = 8
        ctx.fillText(randChar(), x, y)
        cols[i] = y > h+Math.random()*1000 ? 0 : y + 18 + Math.random()*10
      }
      requestId = requestAnimationFrame(draw)
    }
    let requestId
    resize()
    window.addEventListener('resize', resize)
    requestId = requestAnimationFrame(draw)
    return ()=>{ cancelAnimationFrame(requestId); window.removeEventListener('resize', resize) }
  },[])
  return <canvas ref={ref} className="fixed inset-0 w-full h-full -z-10" />
}
