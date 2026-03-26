// =============================================================================
// Color Utilities — Shared color manipulation functions.
// Used by LottoMachine, Cannon, FlyingBall, and ResultCard.
// =============================================================================

/**
 * Lighten a hex color by adding `amount` to each RGB channel.
 * @param {string} hex - Hex color string (e.g. "#FF6B6B")
 * @param {number} amount - Amount to lighten (default: 70)
 * @returns {string} CSS rgb() color string
 */
export function lightenHex(hex, amount = 70) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount)
  return `rgb(${r},${g},${b})`
}

/**
 * Darken a hex color by subtracting `amount` from each RGB channel.
 * @param {string} hex - Hex color string (e.g. "#FF6B6B")
 * @param {number} amount - Amount to darken (default: 50)
 * @returns {string} CSS rgb() color string
 */
export function darkenHex(hex, amount = 50) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount)
  return `rgb(${r},${g},${b})`
}

/**
 * Adjust color brightness by a signed amount.
 * Positive values lighten, negative values darken.
 * @param {string} hex - Hex color string
 * @param {number} amount - Signed adjustment value
 * @returns {string} CSS rgb() color string
 */
export function adjustColor(hex, amount) {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount))
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount))
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount))
  return `rgb(${r},${g},${b})`
}

/**
 * Generate a random float between min and max.
 * Used for ball physics randomization.
 */
export function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}
