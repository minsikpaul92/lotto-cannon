// =============================================================================
// ResultCard Component
// Overlay that displays the final drawn number and prompts user for next steps.
// =============================================================================

import { motion } from 'framer-motion'
import { getBallColor } from '../../constants/index.js'
import { lightenHex, darkenHex } from '../../utils/colorUtils.js'
import styles from './PlayScreen.module.css'

export default function ResultCard({ lastPicked, remainingCount, onNext }) {
  const color = getBallColor(lastPicked)
  const isDoubleDigit = lastPicked > 9
  const hasMoreBalls = remainingCount > 0

  return (
    <div className={styles.resultOverlay}>
      <motion.div 
        className={styles.resultBg} 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.25 }}
      />
      
      <motion.div
        className={styles.resultCard}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.4, opacity: 0, y: -60 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      >
        <div className={styles.resultLabel}>🎯 Winner!</div>
        
        {/* Large Result Indicator Object */}
        <motion.div
          style={{
            width: 180, height: 180,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${lightenHex(color)}, ${color} 55%, ${darkenHex(color)} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 50px ${color}66, 0 8px 40px rgba(0,0,0,0.4)`,
            position: 'relative',
            margin: '4px 0',
          }}
          initial={{ scale: 1.4 }}
          animate={{ scale: [1.4, 0.9, 1.05, 1] }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Glass Highlight */}
          <div style={{
            position: 'absolute', top: '12%', left: '15%',
            width: '40%', height: '35%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, transparent 100%)',
            transform: 'rotate(-30deg)',
          }}/>
          
          <span style={{
            fontSize: isDoubleDigit ? 60 : 76,
            fontWeight: 900, color: 'white',
            textShadow: '0 2px 14px rgba(0,0,0,0.45)',
            fontFamily: 'Outfit, sans-serif',
            lineHeight: 1, position: 'relative', zIndex: 1,
          }}>
            {lastPicked}
          </span>
        </motion.div>

        {/* Status indicator below winner */}
        <div className={styles.resultSubtitle}>
          {hasMoreBalls
            ? `${remainingCount} ball${remainingCount !== 1 ? 's' : ''} remaining`
            : '🎊 Last ball!'}
        </div>
        
        <motion.button
          className={styles.btnNext}
          onClick={onNext}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {hasMoreBalls ? 'Next →' : '🎉 Done!'}
        </motion.button>
      </motion.div>
    </div>
  )
}
