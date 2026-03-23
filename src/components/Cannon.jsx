import { motion, AnimatePresence } from 'framer-motion'
import cannonImg from './Cannon.svg'

// Cannon component using cannon.png instead of SVG.

export default function Cannon({ droppedBall, isFiring, showBang }) {
  return (
    <div className="cannon-area">
      {/* Chute: ball drops from sphere into cannon breech */}
      <div className="cannon-chute-v2">
        <AnimatePresence>
          {droppedBall && (
            <motion.div
              key={droppedBall.id + '-chute'}
              className="chute-ball-v2"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${lightenHex(droppedBall.color)}, ${droppedBall.color} 60%, ${darkenHex(droppedBall.color)} 100%)`
              }}
              initial={{ y: -60, opacity: 0, scale: 0.4 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            >
              <span style={{ fontSize: droppedBall.id > 9 ? 11 : 13, fontWeight: 900, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                {droppedBall.id}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Classic horizontal cannon image */}
      <div className="cannon-wrap-v2">
        <AnimatePresence>
          {showBang && (
            <motion.div
              className="bang-text"
              initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
              animate={{ scale: 1.3, opacity: 1, rotate: 8 }}
              exit={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              💥 BANG!
            </motion.div>
          )}
        </AnimatePresence>

        <motion.img
          src={cannonImg}
          alt="Cannon"
          width={336}
          animate={isFiring
            ? { x: [0, -18, 6, -4, 0], y: [0, 4, -2, 1, 0], rotate: [0, -2, 1, -1, 0] }
            : { x: 0, y: 0, rotate: 0 }
          }
          transition={{ duration: 0.5, ease: [0.1, 0.8, 0.2, 1] }}
          style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}
        />
      </div>
    </div>
  )
}

function lightenHex(hex) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16)+70)
  const g = Math.min(255, parseInt(hex.slice(3,5),16)+70)
  const b = Math.min(255, parseInt(hex.slice(5,7),16)+70)
  return `rgb(${r},${g},${b})`
}
function darkenHex(hex) {
  const r = Math.max(0, parseInt(hex.slice(1,3),16)-50)
  const g = Math.max(0, parseInt(hex.slice(3,5),16)-50)
  const b = Math.max(0, parseInt(hex.slice(5,7),16)-50)
  return `rgb(${r},${g},${b})`
}
