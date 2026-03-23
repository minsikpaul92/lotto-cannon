import { useEffect, useRef } from 'react'
import cannonImg from './Cannon.svg'

const SPHERE_R = 150
const CENTER_X = 160
const CENTER_Y = 160
const GRAVITY = 0.25
const DAMPING = 0.82

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

function getBallRadius(count) {
  return count > 50 ? 9 : 18
}

function initBalls(balls, getBallColor, ballR) {
  return balls.map((b) => {
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * (SPHERE_R - ballR - 8)
    return {
      id: b,
      x: CENTER_X + Math.cos(angle) * dist,
      y: CENTER_Y + Math.sin(angle) * dist,
      vx: randomBetween(-3, 3),
      vy: randomBetween(-3, 3),
      color: getBallColor(b),
      label: String(b),
    }
  })
}

export default function LottoMachine({ balls, getBallColor, isMixing, outletBallId }) {
  const canvasRef = useRef(null)
  const stateRef = useRef([])
  const rafRef = useRef(null)
  const mixingRef = useRef(isMixing)

  useEffect(() => { mixingRef.current = isMixing }, [isMixing])

  useEffect(() => {
    const ballR = getBallRadius(balls.length)
    stateRef.current = initBalls(balls, getBallColor, ballR)
  }, [balls, getBallColor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = 320 * dpr
    canvas.height = 320 * dpr
    ctx.scale(dpr, dpr)

    function tick() {
      ctx.clearRect(0, 0, 320, 320)
      const mixing = mixingRef.current
      const bs = stateRef.current
      if (bs.length === 0) {
        // Draw outlet glow
        const grad = ctx.createRadialGradient(CENTER_X - 40, CENTER_Y - 40, 20, CENTER_X, CENTER_Y, SPHERE_R)
        grad.addColorStop(0, 'rgba(255,255,255,0.06)')
        grad.addColorStop(1, 'rgba(0,0,0,0.1)')
        ctx.beginPath()
        ctx.arc(CENTER_X, CENTER_Y, SPHERE_R, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const ballR = getBallRadius(bs.length)
      // During mixing: much faster and chaotic
      const speedMult = mixing ? 5.5 : 0.35

      // Sphere inner glow
      const grad = ctx.createRadialGradient(CENTER_X - 40, CENTER_Y - 40, 20, CENTER_X, CENTER_Y, SPHERE_R)
      grad.addColorStop(0, mixing ? 'rgba(255,200,100,0.1)' : 'rgba(255,255,255,0.06)')
      grad.addColorStop(0.6, 'rgba(100,150,255,0.03)')
      grad.addColorStop(1, 'rgba(0,0,0,0.15)')
      ctx.beginPath()
      ctx.arc(CENTER_X, CENTER_Y, SPHERE_R, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Update physics
      for (let i = 0; i < bs.length; i++) {
        const b = bs[i]
        if (mixing) {
          // Heavy turbulence
          b.vy += GRAVITY * 1.2
          b.vx += randomBetween(-0.9, 0.9)
          b.vy += randomBetween(-0.9, 0.9)
          // Occasional random kick
          if (Math.random() < 0.04) {
            b.vx += randomBetween(-4, 4)
            b.vy += randomBetween(-4, 4)
          }
        } else {
          b.vx *= 0.96
          b.vy *= 0.96
          b.vy += 0.06
        }

        b.x += b.vx * speedMult
        b.y += b.vy * speedMult

        // Sphere boundary
        const dx = b.x - CENTER_X
        const dy = b.y - CENTER_Y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = SPHERE_R - ballR

        if (dist > maxDist) {
          const nx = dx / dist
          const ny = dy / dist
          b.x = CENTER_X + nx * maxDist
          b.y = CENTER_Y + ny * maxDist
          const dot = b.vx * nx + b.vy * ny
          b.vx = (b.vx - 2 * dot * nx) * DAMPING
          b.vy = (b.vy - 2 * dot * ny) * DAMPING
        }

        // Clamp speed
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
        const maxSpeed = mixing ? 14 : 1.5
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed
          b.vy = (b.vy / speed) * maxSpeed
        }
      }

      // Ball–ball collision
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i], bb = bs[j]
          const dx = bb.x - a.x
          const dy = bb.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < ballR * 2 && dist > 0) {
            const nx = dx / dist
            const ny = dy / dist
            const overlap = ballR * 2 - dist
            a.x -= nx * overlap * 0.5
            a.y -= ny * overlap * 0.5
            bb.x += nx * overlap * 0.5
            bb.y += ny * overlap * 0.5
            const relVx = bb.vx - a.vx
            const relVy = bb.vy - a.vy
            const dot = relVx * nx + relVy * ny
            if (dot < 0) {
              a.vx += dot * nx * 0.5
              a.vy += dot * ny * 0.5
              bb.vx -= dot * nx * 0.5
              bb.vy -= dot * ny * 0.5
            }
          }
        }
      }

      // Draw balls (back to front by y)
      const sorted = [...bs].sort((a, b) => a.y - b.y)
      for (const b of sorted) {
        ctx.beginPath()
        ctx.arc(b.x + 1, b.y + 2, ballR, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,0,0,0.22)'
        ctx.fill()

        const ballGrad = ctx.createRadialGradient(b.x - ballR * 0.35, b.y - ballR * 0.35, 1, b.x, b.y, ballR)
        ballGrad.addColorStop(0, lightenColor(b.color, 70))
        ballGrad.addColorStop(0.5, b.color)
        ballGrad.addColorStop(1, darkenColor(b.color, 40))
        ctx.beginPath()
        ctx.arc(b.x, b.y, ballR, 0, Math.PI * 2)
        ctx.fillStyle = ballGrad
        ctx.fill()

        const shineGrad = ctx.createRadialGradient(b.x - ballR * 0.35, b.y - ballR * 0.4, 1, b.x - ballR * 0.2, b.y - ballR * 0.25, ballR * 0.6)
        shineGrad.addColorStop(0, 'rgba(255,255,255,0.72)')
        shineGrad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(b.x, b.y, ballR, 0, Math.PI * 2)
        ctx.fillStyle = shineGrad
        ctx.fill()

        // Label
        if (ballR >= 14) {
          ctx.fillStyle = 'rgba(255,255,255,0.95)'
          ctx.font = `bold ${b.label.length > 1 ? Math.max(9, ballR * 0.65) : Math.max(11, ballR * 0.78)}px Outfit, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = 'rgba(0,0,0,0.6)'
          ctx.shadowBlur = 3
          ctx.fillText(b.label, b.x, b.y)
          ctx.shadowBlur = 0
        } else if (ballR >= 9) {
          ctx.fillStyle = 'rgba(255,255,255,0.9)'
          ctx.font = `bold ${b.label.length > 1 ? 7 : 8}px Outfit, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(b.label, b.x, b.y)
        }
      }

      // Draw outlet at the bottom of the sphere — sized to match ball diameter (ballR=18 → diameter=36)
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(CENTER_X, CENTER_X + SPHERE_R - 2, 19, 19, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div className="sphere-wrapper">
      <div className="sphere-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <img src={cannonImg} alt="icon" style={{ width: 18 }} />
        LOTTO CANNON
      </div>
      <div className="sphere-container">
        <svg className="sphere-svg" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="160" cy="160" r="150" stroke="rgba(255,255,255,0.28)" strokeWidth="2" fill="none"/>
          <circle cx="160" cy="160" r="150" fill="rgba(255,255,255,0.04)"/>
          <path d="M 80 80 Q 160 40 240 80" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M 100 65 Q 140 50 180 65" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <circle cx="160" cy="160" r="148" stroke="rgba(0,0,0,0.2)" strokeWidth="2" fill="none"/>
          {/* Outlet opening at bottom — diameter matches ball size (ballR=18 → diameter=36) */}
          <ellipse cx="160" cy="308" rx="19" ry="10" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          {/* Tube going down from outlet */}
          <rect x="141" y="308" width="38" height="28" fill="rgba(0,0,0,0.4)" rx="4"/>
          <rect x="143" y="308" width="34" height="28" fill="rgba(255,255,255,0.04)" rx="3"/>
        </svg>

        <canvas ref={canvasRef} className="sphere-canvas" style={{ borderRadius: '50%' }} />

        {balls.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, zIndex: 5 }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <div className="empty-machine">All balls fired!</div>
          </div>
        )}
      </div>
    </div>
  )
}

function lightenColor(hex, amount) { return adjustColor(hex, amount) }
function darkenColor(hex, amount) { return adjustColor(hex, -amount) }
function adjustColor(hex, amount) {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount))
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount))
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount))
  return `rgb(${r},${g},${b})`
}
