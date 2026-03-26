// =============================================================================
// Custom Hook: useGameLogic
// Separates the state management and lifecycle of the Lotto Game from the UI.
// =============================================================================

import { useState, useCallback, useRef, useEffect } from 'react'
import { getBallColor, MIX_DURATION_MIN, MIX_DURATION_MAX, CANNON_LOAD_DELAY, FIRE_FLASH_DURATION } from '../constants/index.js'
import { fireConfetti } from '../utils/confettiEffect.js'

/**
 * Manages the core game phases, remaining balls, and selection history.
 * @param {number} totalBalls - Initial total number of balls
 * @returns {Object} Game state and action handlers
 */
export default function useGameLogic(totalBalls) {
  // Initialize an array of numbers [1, 2, ..., totalBalls]
  const initialBalls = Array.from({ length: totalBalls }, (_, i) => i + 1)
  
  // ----- State Definitions -----
  // phase: 'idle' | 'mixing' | 'dropping' | 'firing' | 'flying' | 'result'
  const [phase, setPhase] = useState('idle')
  const [remainingBalls, setRemainingBalls] = useState([...initialBalls])
  const [pickedHistory, setPickedHistory] = useState([])
  
  // Specific ball states during animation sequences
  const [droppedBall, setDroppedBall] = useState(null)
  const [showBang, setShowBang] = useState(false)
  const [isMixing, setIsMixing] = useState(false)
  const [flyingBall, setFlyingBall] = useState(null)

  // Timer reference to allow cleanup if unmounted or reset
  const timerRef = useRef(null)

  /**
   * Clear any active setTimeout to prevent memory leaks or overlapping events.
   */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  /**
   * Initiates the ball drawing sequence.
   * Progression: mixing -> dropping -> firing -> flying -> result
   */
  const launchSequence = useCallback(() => {
    if (phase !== 'idle' || remainingBalls.length === 0) return
    clearTimer()
    setPhase('mixing')
    setIsMixing(true)

    // 1. Mixing Phase (Random duration)
    const mixDuration = Math.floor(Math.random() * (MIX_DURATION_MAX - MIX_DURATION_MIN) + MIX_DURATION_MIN)
    
    timerRef.current = setTimeout(() => {
      // Pick a random ball from the pool
      const pickedIndex = Math.floor(Math.random() * remainingBalls.length)
      const picked = remainingBalls[pickedIndex]
      
      // 2. Dropping Phase (Ball goes from sphere to cannon)
      setIsMixing(false)
      setPhase('dropping')
      setDroppedBall({ id: picked, color: getBallColor(picked) })

      timerRef.current = setTimeout(() => {
        // 3. Firing Phase (Cannon fires)
        setPhase('firing')
        setShowBang(true)
        fireConfetti() // Trigger visual confetti effect

        timerRef.current = setTimeout(() => {
          // 4. Flying Phase (Ball flies toward screen)
          setShowBang(false)
          setDroppedBall(null)
          setPhase('flying')
          setFlyingBall(picked)
          
          // Update core state arrays
          setRemainingBalls(prev => prev.filter(b => b !== picked))
          setPickedHistory(prev => [...prev, picked])
        }, FIRE_FLASH_DURATION)
      }, CANNON_LOAD_DELAY)
    }, mixDuration)
  }, [phase, remainingBalls, clearTimer])

  /**
   * Callback for when the flying animation finishes.
   */
  const handleFlyComplete = useCallback(() => {
    setPhase('result')
  }, [])

  /**
   * Acknowledge the result and reset back to idle state for the next draw.
   */
  const nextRound = useCallback(() => {
    if (phase !== 'result') return
    setFlyingBall(null)
    setPhase('idle')
    setIsMixing(false)
  }, [phase])

  /**
   * Hard reset the entire game back to initial settings.
   */
  const retryGame = useCallback(() => {
    clearTimer()
    setRemainingBalls([...initialBalls])
    setPickedHistory([])
    setDroppedBall(null)
    setShowBang(false)
    setFlyingBall(null)
    setPhase('idle')
    setIsMixing(false)
  }, [initialBalls, clearTimer])

  // ----- Derived State -----
  const lastPicked = pickedHistory.length > 0 ? pickedHistory[pickedHistory.length - 1] : null
  const isAllDone = remainingBalls.length === 0 && phase !== 'result' && phase !== 'flying'
  const isLaunching = phase === 'mixing' || phase === 'dropping' || phase === 'firing' || phase === 'flying'

  return {
    state: {
      phase,
      remainingBalls,
      pickedHistory,
      droppedBall,
      showBang,
      isMixing,
      flyingBall,
      lastPicked,
      isAllDone,
      isLaunching
    },
    actions: {
      launchSequence,
      handleFlyComplete,
      nextRound,
      retryGame
    }
  }
}
