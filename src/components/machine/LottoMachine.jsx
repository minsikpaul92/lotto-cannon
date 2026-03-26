// =============================================================================
// LottoMachine Component
// Contains the canvas-based 2D physics engine simulating the bouncing balls inside the sphere.
// =============================================================================

import { useEffect, useRef } from 'react'
import cannonImg from '../../assets/Cannon.svg'

import {
  SPHERE_RADIUS, CENTER_X, CENTER_Y, GRAVITY, DAMPING,
  BALL_SIZE_THRESHOLD, BALL_RADIUS_LARGE, BALL_RADIUS_SMALL,
  SPEED_MIXING, SPEED_IDLE, MAX_SPEED_MIXING, MAX_SPEED_IDLE,
  getBallColor, CANVAS_SIZE
} from '../../constants/index.js'

import { adjustColor, randomBetween } from '../../utils/colorUtils.js'
import styles from './LottoMachine.module.css'

// Determine physical radius scalar based on density of requested balls
function getBallRadius(count) {
  return count > BALL_SIZE_THRESHOLD ? BALL_RADIUS_SMALL : BALL_RADIUS_LARGE
}

// Generate starting physical properties mapped to each available ball ID
function initBallsPhysics(balls, ballR) {
  return balls.map((b) => {
    // Distribute randomly across the internal geometry
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * (SPHERE_RADIUS - ballR - 8)
    
    return {
      id: b,
      x: CENTER_X + Math.cos(angle) * dist,
      y: CENTER_Y + Math.sin(angle) * dist,
      vx: randomBetween(-3, 3), // Initial velocity X
      vy: randomBetween(-3, 3), // Initial velocity Y
      color: getBallColor(b),
      label: String(b),
    }
  })
}

export default function LottoMachine({ balls, isMixing }) {
  const canvasRef = useRef(null)
  const stateRef = useRef([])
  const rafRef = useRef(null)
  
  // Ref for isMixing to bypass closure traps inside requestAnimationFrame tick loop
  const mixingRef = useRef(isMixing)

  useEffect(() => { mixingRef.current = isMixing }, [isMixing])

  // Lifecycle: When available unpicked balls change, re-generate physics entities
  useEffect(() => {
    const ballR = getBallRadius(balls.length)
    stateRef.current = initBallsPhysics(balls, ballR)
  }, [balls])

  // Lifecycle: 2D Engine Heartbeat 
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    // Support High DPI Retinal displays 
    canvas.width = CANVAS_SIZE * dpr
    canvas.height = CANVAS_SIZE * dpr
    ctx.scale(dpr, dpr)

    function drawTick() {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      const mixing = mixingRef.current
      const physicsState = stateRef.current
      const ballR = getBallRadius(physicsState.length)

      // ----- No Balls State -----
      if (physicsState.length === 0) {
        // Render simple glowing outlet effect when machine is empty
        const grad = ctx.createRadialGradient(CENTER_X - 40, CENTER_Y - 40, 20, CENTER_X, CENTER_Y, SPHERE_RADIUS)
        grad.addColorStop(0, 'rgba(255,255,255,0.06)')
        grad.addColorStop(1, 'rgba(0,0,0,0.1)')
        ctx.beginPath()
        ctx.arc(CENTER_X, CENTER_Y, SPHERE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        
        rafRef.current = requestAnimationFrame(drawTick)
        return
      }

      // Modifier constants based on whether the turbine is active
      const speedMult = mixing ? SPEED_MIXING : SPEED_IDLE
      const maxSpeed = mixing ? MAX_SPEED_MIXING : MAX_SPEED_IDLE

      // Render Machine Glass
      const grad = ctx.createRadialGradient(CENTER_X - 40, CENTER_Y - 40, 20, CENTER_X, CENTER_Y, SPHERE_RADIUS)
      grad.addColorStop(0, mixing ? 'rgba(255,200,100,0.1)' : 'rgba(255,255,255,0.06)')
      grad.addColorStop(0.6, 'rgba(100,150,255,0.03)')
      grad.addColorStop(1, 'rgba(0,0,0,0.15)')
      ctx.beginPath()
      ctx.arc(CENTER_X, CENTER_Y, SPHERE_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // ----- Kinematics Loop Pass 1: Forces and Boundaries -----
      for (let i = 0; i < physicsState.length; i++) {
        const b = physicsState[i]
        
        if (mixing) {
          // Chaos theory
          b.vy += GRAVITY * 1.2
          b.vx += randomBetween(-0.9, 0.9)
          b.vy += randomBetween(-0.9, 0.9)
          
          if (Math.random() < 0.04) { // Occasional violent kick
            b.vx += randomBetween(-4, 4)
            b.vy += randomBetween(-4, 4)
          }
        } else {
          // Friction + mild gravity
          b.vx *= 0.96
          b.vy *= 0.96
          b.vy += 0.06
        }

        b.x += b.vx * speedMult
        b.y += b.vy * speedMult

        // Enforce hard spherical boundary reflection using geometry
        const dx = b.x - CENTER_X
        const dy = b.y - CENTER_Y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = SPHERE_RADIUS - ballR

        if (dist > maxDist) {
          const nx = dx / dist
          const ny = dy / dist
          b.x = CENTER_X + nx * maxDist
          b.y = CENTER_Y + ny * maxDist
          
          const dot = b.vx * nx + b.vy * ny
          // Reflect velocity over boundary normal logic with energy loss
          b.vx = (b.vx - 2 * dot * nx) * DAMPING
          b.vy = (b.vy - 2 * dot * ny) * DAMPING
        }

        // Clamp
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed
          b.vy = (b.vy / speed) * maxSpeed
        }
      }

      // ----- Kinematics Loop Pass 2: Particle-Particle Resolution (AABB overlapping) -----
      for (let i = 0; i < physicsState.length; i++) {
        for (let j = i + 1; j < physicsState.length; j++) {
          const a = physicsState[i], bb = physicsState[j]
          const dx = bb.x - a.x
          const dy = bb.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          // Basic elastic collision response
          if (dist < ballR * 2 && dist > 0) {
            const nx = dx / dist
            const ny = dy / dist
            const overlap = ballR * 2 - dist
            // Correct position to prevent clipping
            a.x -= nx * overlap * 0.5
            a.y -= ny * overlap * 0.5
            bb.x += nx * overlap * 0.5
            bb.y += ny * overlap * 0.5
            
            // Adjust velocities
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

      // ----- Presentation Loop: Depth sorting and rendering -----
      // Sort back to front strictly visually by Y-axis depth fake 
      const sorted = [...physicsState].sort((a, b) => a.y - b.y)
      for (const b of sorted) {
        
        // Drop shadow cast behind
        ctx.beginPath()
        ctx.arc(b.x + 1, b.y + 2, ballR, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,0,0,0.22)'
        ctx.fill()

        // Ball graphic sphere
        const ballGrad = ctx.createRadialGradient(b.x - ballR * 0.35, b.y - ballR * 0.35, 1, b.x, b.y, ballR)
        ballGrad.addColorStop(0, adjustColor(b.color, 70))
        ballGrad.addColorStop(0.5, b.color)
        ballGrad.addColorStop(1, adjustColor(b.color, -40))
        ctx.beginPath()
        ctx.arc(b.x, b.y, ballR, 0, Math.PI * 2)
        ctx.fillStyle = ballGrad
        ctx.fill()

        // Specular highlight gloss
        const shineGrad = ctx.createRadialGradient(b.x - ballR * 0.35, b.y - ballR * 0.4, 1, b.x - ballR * 0.2, b.y - ballR * 0.25, ballR * 0.6)
        shineGrad.addColorStop(0, 'rgba(255,255,255,0.72)')
        shineGrad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(b.x, b.y, ballR, 0, Math.PI * 2)
        ctx.fillStyle = shineGrad
        ctx.fill()

        // Number Typography
        if (ballR >= 14) {
          ctx.fillStyle = 'rgba(255,255,255,0.95)'
          ctx.font = `bold ${b.label.length > 1 ? Math.max(9, ballR * 0.65) : Math.max(11, ballR * 0.78)}px Outfit, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = 'rgba(0,0,0,0.6)'
          ctx.shadowBlur = 3
          ctx.fillText(b.label, b.x, b.y)
          ctx.shadowBlur = 0 // Reset
        } else if (ballR >= 9) {
          ctx.fillStyle = 'rgba(255,255,255,0.9)'
          ctx.font = `bold ${b.label.length > 1 ? 7 : 8}px Outfit, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(b.label, b.x, b.y)
        }
      }

      // Draw bottom outlet gate
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(CENTER_X, 316, 22, 6, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()

      rafRef.current = requestAnimationFrame(drawTick)
    }

    // Ignite the engine
    rafRef.current = requestAnimationFrame(drawTick)
    
    return () => { 
      if (rafRef.current) cancelAnimationFrame(rafRef.current) 
    }
  }, [balls.length]) // Engine recreates only when ball count strictly increases/decreases

  return (
    <div className={styles.wrapper}>
      <div className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <img src={cannonImg} alt="icon" style={{ width: 18 }} />
        LOTTO CANNON
      </div>
      
      <div className={styles.container}>
        {/* Underlay vector visual glass components spanning entire 320x320 element */}
        <svg className={styles.svg} viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="160" cy="160" r="150" stroke="rgba(255,255,255,0.28)" strokeWidth="2" fill="none" />
          <circle cx="160" cy="160" r="150" fill="rgba(255,255,255,0.04)" />
          <path d="M 80 80 Q 160 40 240 80" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 100 65 Q 140 50 180 65" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="160" cy="160" r="148" stroke="rgba(0,0,0,0.2)" strokeWidth="2" fill="none" />
          
          {/* Glass Funnel Outlet Component at exactly y:316 mapping to canvas renderer bottom base */}
          <path d="M 110 301 Q 138 316 138 316 L 182 316 Q 182 316 210 301" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <ellipse cx="160" cy="316" rx="22" ry="6" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <rect x="138" y="316" width="44" height="20" fill="rgba(0,0,0,0.3)" />
          <rect x="140" y="316" width="40" height="20" fill="rgba(255,255,255,0.05)" />
        </svg>

        {/* Action bounds overlapping SVGs */}
        <canvas ref={canvasRef} className={styles.canvas} />

        {balls.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, zIndex: 5 }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <div className={styles.emptyMachine}>All balls fired!</div>
          </div>
        )}
      </div>
    </div>
  )
}
