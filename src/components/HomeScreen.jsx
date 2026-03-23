import { useState } from 'react'
import { motion } from 'framer-motion'
import cannonImg from './Cannon.svg'

export default function HomeScreen({ onStart }) {
  const [value, setValue] = useState('')

  const n = parseInt(value)
  const isValid = !isNaN(n) && n >= 2 && n <= 99

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isValid) onStart(n)
  }

  return (
    <motion.div
      className="home-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decorative orbs */}
      <div className="home-bg-orb" style={{
        width: 500, height: 500,
        top: -150, right: -100,
        background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)'
      }} />
      <div className="home-bg-orb" style={{
        width: 400, height: 400,
        bottom: -100, left: -80,
        background: 'radial-gradient(circle, rgba(108,92,231,0.2) 0%, transparent 70%)'
      }} />
      <div className="home-bg-orb" style={{
        width: 300, height: 300,
        bottom: 80, right: 60,
        background: 'radial-gradient(circle, rgba(255,107,107,0.12) 0%, transparent 70%)'
      }} />

      <div className="home-content">
        <div className="home-logo">
          <div className="home-icon">
            <img src={cannonImg} alt="Cannon logo" style={{ width: 88, height: 'auto', display: 'block', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))' }} />
          </div>
          <h1 className="home-title">Lotto Cannon</h1>
          <p className="home-subtitle">Random number selector — powered by physics</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="home-card">
            <label className="home-label" htmlFor="num-input">
              How many balls?
            </label>
            <div className="home-input-wrapper">
              <input
                id="num-input"
                className="home-input"
                type="number"
                min="2"
                max="99"
                placeholder="e.g. 45"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            </div>
            <p className="home-hint">Enter a number between 2 and 99</p>
            <motion.button
              type="submit"
              className="btn-start"
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
