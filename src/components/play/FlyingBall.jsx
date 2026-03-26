// =============================================================================
// FlyingBall Component
// The animation of the newly fired ball flying from the cannon toward the screen.
// =============================================================================

import { motion } from 'framer-motion'
import { getBallColor } from '../../constants/index.js'
import { lightenHex, darkenHex } from '../../utils/colorUtils.js'

export default function FlyingBall({ ball, onFinish }) {
  const color = getBallColor(ball)
  const isDoubleDigit = ball > 9

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 180, pointerEvents: 'none',
      }}
    >
      {/* Visual Trajectory Trail */}
      <motion.div
        style={{
          position: 'absolute',
          width: 20, height: 20,
          borderRadius: '50%',
          background: color,
          filter: 'blur(18px)',
          opacity: 0.7,
        }}
        initial={{ scale: 0.1, y: 280, x: 60 }}
        animate={{ scale: 3, y: 0, x: 0, opacity: 0 }}
        transition={{ duration: 0.55, ease: 'easeIn' }}
      />
      
      {/* 3D Ball Projectile */}
      <motion.div
        style={{
          width: 200, height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${lightenHex(color)}, ${color} 55%, ${darkenHex(color)} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 60px ${color}88, 0 0 120px ${color}44`,
          position: 'relative',
        }}
        initial={{ scale: 0.04, y: 260, x: 60, opacity: 0.7 }}
        animate={{ scale: [0.04, 0.8, 1.15, 1.0], y: [260, 60, 0, 0], x: [60, 20, 0, 0], opacity: [0.7, 1, 1, 1] }}
        transition={{ duration: 0.72, ease: [0.2, 0.7, 0.3, 1.0] }}
        onAnimationComplete={onFinish}
      >
        {/* Curved Glass Highlight */}
        <div style={{
          position: 'absolute', top: '12%', left: '15%',
          width: '40%', height: '35%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)',
          transform: 'rotate(-30deg)',
        }}/>
        <span style={{
          fontSize: isDoubleDigit ? 64 : 80,
          fontWeight: 900,
          color: 'white',
          textShadow: '0 2px 16px rgba(0,0,0,0.5)',
          fontFamily: 'Outfit, sans-serif',
          lineHeight: 1,
          position: 'relative', zIndex: 1,
        }}>
          {ball}
        </span>
      </motion.div>
    </motion.div>
  )
}
