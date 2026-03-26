// =============================================================================
// Confetti Effect — Fires a celebratory confetti burst from both screen edges.
// Triggered when the cannon fires a ball.
// =============================================================================

import confetti from 'canvas-confetti'

/**
 * Fire a multi-stage confetti burst.
 * - Continuous stream from left and right edges for 2.2 seconds
 * - Single large center burst on start
 */
export function fireConfetti() {
  const duration = 2200
  const end = Date.now() + duration

  // Continuous side streams
  const frame = () => {
    confetti({
      particleCount: 7, angle: 55, spread: 60,
      origin: { x: 0, y: 0.55 },
      colors: ['#FFD700', '#FF6B6B', '#A29BFE', '#55EFC4', '#FDCB6E'],
      zIndex: 9999,
    })
    confetti({
      particleCount: 7, angle: 125, spread: 60,
      origin: { x: 1, y: 0.55 },
      colors: ['#FFD700', '#FF8C42', '#74B9FF', '#FD79A8', '#00CEC9'],
      zIndex: 9999,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()

  // Initial center burst
  confetti({
    particleCount: 140, spread: 110,
    origin: { y: 0.5 },
    colors: ['#FFD700', '#FF6B6B', '#A29BFE', '#55EFC4', '#FF8C42'],
    zIndex: 9999,
  })
}
