import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import LottoMachine from './LottoMachine'
import Cannon from './Cannon'
import HistoryList from './HistoryList'

function fireConfetti() {
  const duration = 2200
  const end = Date.now() + duration
  const frame = () => {
    confetti({ particleCount: 7, angle: 55, spread: 60, origin: { x: 0, y: 0.55 }, colors: ['#FFD700','#FF6B6B','#A29BFE','#55EFC4','#FDCB6E'], zIndex: 9999 })
    confetti({ particleCount: 7, angle: 125, spread: 60, origin: { x: 1, y: 0.55 }, colors: ['#FFD700','#FF8C42','#74B9FF','#FD79A8','#00CEC9'], zIndex: 9999 })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  confetti({ particleCount: 140, spread: 110, origin: { y: 0.5 }, colors: ['#FFD700','#FF6B6B','#A29BFE','#55EFC4','#FF8C42'], zIndex: 9999 })
}

// Flying ball that zooms toward the viewer from cannon position
function FlyingBall({ ball, getBallColor, onFinish }) {
  const color = getBallColor(ball)
  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 180, pointerEvents: 'none',
      }}
    >
      {/* Trajectory trail */}
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
      {/* Main ball zooming toward viewer */}
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
        {/* Shine */}
        <div style={{
          position: 'absolute', top: '12%', left: '15%',
          width: '40%', height: '35%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)',
          transform: 'rotate(-30deg)',
        }}/>
        <span style={{
          fontSize: String(ball).length > 1 ? 64 : 80,
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

export default function PlayScreen({ totalN, getBallColor, onExit }) {
  const allBalls = Array.from({ length: totalN }, (_, i) => i + 1)

  const [remainingBalls, setRemainingBalls] = useState([...allBalls])
  const [pickedHistory, setPickedHistory] = useState([])
  // phases: 'idle' | 'mixing' | 'dropping' | 'firing' | 'flying' | 'result'
  const [phase, setPhase] = useState('idle')
  const [droppedBall, setDroppedBall] = useState(null)
  const [showBang, setShowBang] = useState(false)
  const [isMixing, setIsMixing] = useState(false)
  const [flyingBall, setFlyingBall] = useState(null) // the ball # that is flying toward viewer

  const timerRef = useRef(null)
  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null } }

  const pickRandomBall = useCallback((balls) => balls[Math.floor(Math.random() * balls.length)], [])

  const handleLaunch = useCallback(() => {
    if (phase !== 'idle' || remainingBalls.length === 0) return
    clearTimer()
    setPhase('mixing')
    setIsMixing(true)

    // Random mixing duration: 3000–5000ms
    const mixDuration = Math.floor(Math.random() * 2000 + 3000)

    timerRef.current = setTimeout(() => {
      const picked = pickRandomBall(remainingBalls)
      setIsMixing(false)
      setPhase('dropping')
      setDroppedBall({ id: picked, color: getBallColor(picked) })

      // Ball loads into cannon
      timerRef.current = setTimeout(() => {
        setPhase('firing')
        setShowBang(true)
        fireConfetti()

        // Brief firing flash
        timerRef.current = setTimeout(() => {
          setShowBang(false)
          setDroppedBall(null)
          // Ball flies toward viewer
          setPhase('flying')
          setFlyingBall(picked)
          setRemainingBalls(prev => prev.filter(b => b !== picked))
          setPickedHistory(prev => [...prev, picked])
        }, 350)
      }, 900)
    }, mixDuration)
  }, [phase, remainingBalls, pickRandomBall, getBallColor])

  const handleFlyDone = useCallback(() => {
    setPhase('result')
  }, [])

  const handleNext = useCallback(() => {
    if (phase !== 'result') return
    setFlyingBall(null)
    setPhase('idle')
    setIsMixing(false)
  }, [phase])

  const handleRetry = useCallback(() => {
    clearTimer()
    setRemainingBalls([...allBalls])
    setPickedHistory([])
    setDroppedBall(null)
    setShowBang(false)
    setFlyingBall(null)
    setPhase('idle')
    setIsMixing(false)
  }, [allBalls])

  useEffect(() => () => clearTimer(), [])

  const lastPicked = pickedHistory.length > 0 ? pickedHistory[pickedHistory.length - 1] : null
  const isAllDone = remainingBalls.length === 0 && phase !== 'result' && phase !== 'flying'
  const isLaunching = phase === 'mixing' || phase === 'dropping' || phase === 'firing' || phase === 'flying'

  return (
    <motion.div
      className="play-screen"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="play-orb" style={{ width: 600, height: 600, top: -200, right: -200, background: 'radial-gradient(circle, rgba(255,215,0,1) 0%, transparent 70%)' }} />
      <div className="play-orb" style={{ width: 500, height: 500, bottom: -150, left: -150, background: 'radial-gradient(circle, rgba(108,92,231,1) 0%, transparent 70%)' }} />

      <HistoryList history={pickedHistory} getBallColor={getBallColor} />

      <div className="status-bar">
        Balls remaining: <span>{remainingBalls.length}</span>{' / '}<span>{totalN}</span>
      </div>

      <div className="play-main">
        <LottoMachine balls={remainingBalls} getBallColor={getBallColor} isMixing={isMixing} />

        <Cannon droppedBall={droppedBall} isFiring={phase === 'firing'} showBang={showBang} />

        {isAllDone ? (
          <div className="all-done-banner">🎉 All {totalN} numbers selected!</div>
        ) : (
          <motion.button
            className="btn-launch"
            onClick={handleLaunch}
            disabled={isLaunching || phase === 'result' || remainingBalls.length === 0}
            animate={phase === 'mixing' ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            {phase === 'mixing' ? '🌀 Mixing...' :
             phase === 'dropping' ? '⬇️ Loading...' :
             phase === 'firing' ? '💥 Firing!' :
             phase === 'flying' ? '🚀 Incoming!' :
             '🎯 Launch!'}
          </motion.button>
        )}
      </div>

      <div className="play-actions">
        <motion.button className="btn-action btn-exit" onClick={onExit} disabled={isLaunching} whileTap={{ scale: 0.96 }}>← Exit</motion.button>
        <motion.button className="btn-action btn-retry" onClick={handleRetry} disabled={isLaunching} whileTap={{ scale: 0.96 }}>🔄 Retry</motion.button>
      </div>

      {/* Flying ball toward viewer */}
      <AnimatePresence>
        {phase === 'flying' && flyingBall !== null && (
          <FlyingBall key={flyingBall} ball={flyingBall} getBallColor={getBallColor} onFinish={handleFlyDone} />
        )}
      </AnimatePresence>

      {/* Result overlay — shows the ball (large) + number */}
      <AnimatePresence>
        {phase === 'result' && lastPicked !== null && (() => {
          const color = getBallColor(lastPicked)
          return (
            <div className="result-overlay">
              <motion.div className="result-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}/>
              <motion.div
                className="result-card"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0, y: -60 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <div className="result-label">🎯 Winner!</div>
                {/* Large ball showing the result */}
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
                  <div style={{
                    position: 'absolute', top: '12%', left: '15%',
                    width: '40%', height: '35%', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, transparent 100%)',
                    transform: 'rotate(-30deg)',
                  }}/>
                  <span style={{
                    fontSize: String(lastPicked).length > 1 ? 60 : 76,
                    fontWeight: 900, color: 'white',
                    textShadow: '0 2px 14px rgba(0,0,0,0.45)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1, position: 'relative', zIndex: 1,
                  }}>
                    {lastPicked}
                  </span>
                </motion.div>

                <div className="result-subtitle">
                  {remainingBalls.length > 0
                    ? `${remainingBalls.length} ball${remainingBalls.length !== 1 ? 's' : ''} remaining`
                    : '🎊 Last ball!'}
                </div>
                <motion.button
                  className="btn-next"
                  onClick={handleNext}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  {remainingBalls.length > 0 ? 'Next →' : '🎉 Done!'}
                </motion.button>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>
    </motion.div>
  )
}

function lightenHex(hex) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16)+70)
  const g = Math.min(255, parseInt(hex.slice(3,5),16)+70)
  const b = Math.min(255, parseInt(hex.slice(5,7),16)+70)
  return `rgb(${r},${g},${b})`
}
function darkenHex(hex) {
  const r = Math.max(0, parseInt(hex.slice(1,3),16)-60)
  const g = Math.max(0, parseInt(hex.slice(3,5),16)-60)
  const b = Math.max(0, parseInt(hex.slice(5,7),16)-60)
  return `rgb(${r},${g},${b})`
}
