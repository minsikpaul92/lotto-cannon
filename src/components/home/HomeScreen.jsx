// =============================================================================
// HomeScreen Component
// Initial view for configuring game parameters (number of balls).
// =============================================================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import cannonImg from '../../assets/Cannon.svg'
import styles from './HomeScreen.module.css'

export default function HomeScreen({ onStart }) {
  const [value, setValue] = useState('')

  // Validation parsed logic
  const n = parseInt(value, 10)
  const isValid = !isNaN(n) && n >= 2 && n <= 99

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isValid) {
      onStart(n)
    }
  }

  return (
    <motion.div
      className={styles.screen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Ambience Orbs */}
      <div className={styles.bgOrb} style={{ width: 500, height: 500, top: -150, right: -100, background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)' }} />
      <div className={styles.bgOrb} style={{ width: 400, height: 400, bottom: -100, left: -80, background: 'radial-gradient(circle, rgba(108,92,231,0.2) 0%, transparent 70%)' }} />
      <div className={styles.bgOrb} style={{ width: 300, height: 300, bottom: 80, right: 60, background: 'radial-gradient(circle, rgba(255,107,107,0.12) 0%, transparent 70%)' }} />

      <div className={styles.content}>
        
        {/* Header Block */}
        <div className={styles.logo}>
          <div className={styles.icon}>
            <img src={cannonImg} alt="Lotto Cannon Logo" style={{ width: 88, height: 'auto', display: 'block', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))' }} />
          </div>
          <h1 className={styles.title}>Lotto Cannon</h1>
          <p className={styles.subtitle}>Random number selector — powered by physics</p>
        </div>

        {/* Input Form Card */}
        <form onSubmit={handleSubmit}>
          <div className={styles.card}>
            <label className={styles.label} htmlFor="num-input">
              How many balls?
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="num-input"
                className={styles.input}
                type="number"
                min="2"
                max="99"
                placeholder="e.g. 45"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            </div>
            <p className={styles.hint}>Enter a number between 2 and 99</p>
            <motion.button
              type="submit"
              className={styles.btnStart}
              disabled={!isValid}
              whileTap={{ scale: 0.97 }}
            >
              🚀 Launch Machine
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
