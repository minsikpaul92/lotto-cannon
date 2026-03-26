// =============================================================================
// PlayScreen Component
// Serves as the primary controller view for the gaming interface. 
// Glues together all sub-components and passes state derived from custom hooks.
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion'
import useGameLogic from '../../hooks/useGameLogic.js'

import LottoMachine from '../machine/LottoMachine.jsx'
import Cannon from '../cannon/Cannon.jsx'
import HistoryList from '../history/HistoryList.jsx'
import FlyingBall from './FlyingBall.jsx'
import ResultCard from './ResultCard.jsx'

import cannonLogo from '../../assets/Cannon.svg'
import styles from './PlayScreen.module.css'

export default function PlayScreen({ totalN, onExit }) {
  // Extract state & logic from our specialized hook to keep UI clean
  const { state, actions } = useGameLogic(totalN)
  
  const {
    phase, remainingBalls, pickedHistory, droppedBall,
    showBang, isMixing, flyingBall, lastPicked, isAllDone, isLaunching
  } = state

  const {
    launchSequence, handleFlyComplete, nextRound, retryGame
  } = actions

  // Determine button label text contextually based on state 
  const getLaunchLabel = () => {
    switch (phase) {
      case 'mixing': return <><img src={cannonLogo} alt="" style={{ width: 20, height: 20 }} /> Mixing...</>
      case 'dropping': return <><img src={cannonLogo} alt="" style={{ width: 20, height: 20 }} /> Loading...</>
      case 'firing': return <><img src={cannonLogo} alt="" style={{ width: 20, height: 20 }} /> Firing!</>
      case 'flying': return <><img src={cannonLogo} alt="" style={{ width: 20, height: 20 }} /> Incoming!</>
      default: return <><img src={cannonLogo} alt="" style={{ width: 20, height: 20 }} /> Launch!</>
    }
  }

  return (
    <motion.div
      className={styles.screen}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Ambience Background Orbs */}
      <div className={styles.orb} style={{ width: 600, height: 600, top: -200, right: -200, background: 'radial-gradient(circle, rgba(255,215,0,1) 0%, transparent 70%)' }} />
      <div className={styles.orb} style={{ width: 500, height: 500, bottom: -150, left: -150, background: 'radial-gradient(circle, rgba(108,92,231,1) 0%, transparent 70%)' }} />

      <HistoryList history={pickedHistory} />

      {/* Global Status Indicator */}
      <div className={styles.statusBar}>
        Balls remaining: <span>{remainingBalls.length}</span>{' / '}<span>{totalN}</span>
      </div>

      <div className={styles.main}>
        {/* The Physics Simulator */}
        <LottoMachine balls={remainingBalls} isMixing={isMixing} />

        {/* The Firing Component */}
        <Cannon droppedBall={droppedBall} isFiring={phase === 'firing'} showBang={showBang} />

        {/* Dynamic Launch Controls */}
        {isAllDone ? (
          <div className={styles.allDoneBanner}>🎉 All {totalN} numbers selected!</div>
        ) : (
          <motion.button
            className={styles.btnLaunch}
            onClick={launchSequence}
            disabled={isLaunching || phase === 'result' || remainingBalls.length === 0}
            animate={phase === 'mixing' ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            {getLaunchLabel()}
          </motion.button>
        )}
      </div>

      {/* Footer Navigation */}
      <div className={styles.actions}>
        <motion.button className={`${styles.btnAction} ${styles.btnExit}`} onClick={onExit} disabled={isLaunching} whileTap={{ scale: 0.96 }}>← Exit</motion.button>
        <motion.button className={`${styles.btnAction} ${styles.btnRetry}`} onClick={retryGame} disabled={isLaunching} whileTap={{ scale: 0.96 }}>🔄 Retry</motion.button>
      </div>

      {/* Phase 4: Projectile Animation */}
      <AnimatePresence>
        {phase === 'flying' && flyingBall !== null && (
          <FlyingBall key={flyingBall} ball={flyingBall} onFinish={handleFlyComplete} />
        )}
      </AnimatePresence>

      {/* Phase 5: Results UI Overlay */}
      <AnimatePresence>
        {phase === 'result' && lastPicked !== null && (
          <ResultCard 
            lastPicked={lastPicked} 
            remainingCount={remainingBalls.length}
            onNext={nextRound} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
