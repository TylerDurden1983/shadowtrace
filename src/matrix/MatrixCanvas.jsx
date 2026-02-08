import React, { useRef, useEffect } from 'react'
import '../matrix.css'

export default function MatrixCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')

    let w = 0, h = 0
    let cols = []
    let running = false
    let raf = null

    function setSize() {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    function resize() {
      setSize()
      const count = Math.max(20, Math.floor(w / 18))
      cols = new Array(count).fill(0).map(() => ({ y: Math.random() * h, speed: 2 + Math.random() * 5 }))
    }

    function randChar() {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      return chars.charAt(Math.floor(Math.random() * chars.length))
    }

    function draw() {
      if (!running) { raf = requestAnimationFrame(draw); return }
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = '18px monospace'

      for (let i = 0; i < cols.length; i++) {
        const x = Math.floor(i * (w / cols.length))
        const col = cols[i]
        const y = col.y
        ctx.fillStyle = 'rgba(0,200,120,0.9)'
        ctx.fillText(randChar(), x, y)
        col.y = col.y > h + 20 ? -20 : col.y + col.speed
      }

      raf = requestAnimationFrame(draw)
    }

    function start() {
      cols.forEach(c => c.y = Math.random() * h)
      running = true
    }

    setSize()
    resize()

    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    const t = setTimeout(start, 300)
    raf = requestAnimationFrame(draw)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      clearTimeout(t)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
