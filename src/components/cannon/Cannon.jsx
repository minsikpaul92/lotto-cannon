// =============================================================================
// Cannon Component
// Renders the cannon visual and handles the ball drop/firing animations.
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion'
import cannonImg from '../../assets/Cannon.svg'
import { lightenHex, darkenHex } from '../../utils/colorUtils.js'
import styles from './Cannon.module.css'

export default function Cannon({ droppedBall, isFiring, showBang }) {
  return (
    <div className={styles.area}>
      
      {/* 1. Transparent chute where the ball drops before firing */}
      <div className={styles.chute}>
        <AnimatePresence>
          {droppedBall && (
             <motion.div
               key={droppedBall.id + '-chute'}
               className={styles.chuteBall}
               style={{
                 background: `radial-gradient(circle at 35% 35%, ${lightenHex(droppedBall.color)}, ${droppedBall.color} 60%, ${darkenHex(droppedBall.color)} 100%)`
               }}
               initial={{ y: -80, opacity: 0, scale: 0.4 }}
               animate={{ y: 60, opacity: 1, scale: 1 }}
               exit={{ y: 100, opacity: 0, scale: 0.6 }}
               transition={{ type: 'spring', stiffness: 280, damping: 20 }}
             >
               <span style={{ fontSize: droppedBall.id > 9 ? 11 : 13, fontWeight: 900, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                 {droppedBall.id}
               </span>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Main Cannon Graphic */}
      <div className={styles.cannonWrap}>
        
        {/* Flash BANG text effect */}
        <AnimatePresence>
          {showBang && (
             <motion.div
               className={styles.bangText}
               initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
               animate={{ scale: 1.3, opacity: 1, rotate: 8 }}
               exit={{ scale: 2.2, opacity: 0 }}
               transition={{ duration: 0.35, ease: 'easeOut' }}
             >
               💥 BANG!
             </motion.div>
          )}
        </AnimatePresence>

        {/* Shudder animation when firing */}
        <motion.img
          src={cannonImg}
          alt="Cannon Graphic"
          width={336}
          animate={
            isFiring
              ? { x: [70, 52, 76, 66, 70], y: [0, 4, -2, 1, 0], rotate: [0, -2, 1, -1, 0] }
              : { x: 70, y: 0, rotate: 0 }
          }
          transition={{ duration: 0.5, ease: [0.1, 0.8, 0.2, 1] }}
          style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}
        />
      </div>
    </div>
  )
}
