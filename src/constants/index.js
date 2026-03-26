// =============================================================================
// Constants — Central configuration for the Lotto Cannon application.
// All magic numbers and configuration values live here for easy tuning.
// =============================================================================

// ----- Physics Engine (LottoMachine sphere simulation) -----
export const SPHERE_RADIUS = 150      // Radius of the glass sphere (px)
export const CENTER_X = 160           // Sphere center X coordinate
export const CENTER_Y = 160           // Sphere center Y coordinate
export const GRAVITY = 0.25           // Gravity acceleration per frame
export const DAMPING = 0.82           // Velocity damping on sphere wall bounce
export const CANVAS_SIZE = 320        // Canvas width & height (px)

// ----- Ball Sizes -----
export const BALL_SIZE_THRESHOLD = 50 // Ball count above which balls shrink
export const BALL_RADIUS_LARGE = 18   // Default ball radius
export const BALL_RADIUS_SMALL = 9    // Smaller radius for 50+ balls

// ----- Mixing Speeds -----
export const SPEED_MIXING = 5.5       // Ball velocity multiplier during mixing
export const SPEED_IDLE = 0.35        // Ball velocity multiplier when idle
export const MAX_SPEED_MIXING = 14    // Speed clamp during mixing
export const MAX_SPEED_IDLE = 1.5     // Speed clamp when idle

// ----- Game Timing (ms) -----
export const MIX_DURATION_MIN = 3000  // Minimum mixing phase duration
export const MIX_DURATION_MAX = 5000  // Maximum mixing phase duration
export const CANNON_LOAD_DELAY = 900  // Delay before cannon fires after drop
export const FIRE_FLASH_DURATION = 350 // Duration of cannon firing flash

// ----- Ball Color Palette -----
export const BALL_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC107', '#4CAF50', '#00BCD4',
  '#2196F3', '#9C27B0', '#E91E63', '#FF5722', '#009688',
  '#3F51B5', '#795548', '#607D8B', '#F44336', '#8BC34A',
]

/**
 * Get the display color for a ball by its number.
 * Colors cycle through the palette.
 */
export function getBallColor(n) {
  return BALL_COLORS[(n - 1) % BALL_COLORS.length]
}
