/**
 * Design tokens — "Instrument panel".
 *
 * The app is a working ledger for billable time, so the interface is built like
 * a measuring instrument: everything sits on a hard grid, surfaces are flat
 * planes divided by rules, and depth is a stamped offset rather than a blur.
 * There are no rounded corners anywhere in the product; RADIUS exists so the
 * rule is stated once and can be imported instead of re-typed as a literal.
 */

// Every corner in the app. Deliberately a constant, not a scale.
export const RADIUS = 0

// Rule weights. Panels are drawn with BASE, page-level structure with HEAVY,
// internal separators with HAIR.
export const RULE = {
  hair: 2,
  base: 3,
  heavy: 5,
}

// Stamped depth: a solid offset in ink, never a blur.
export const OFFSET = {
  press: 2,
  base: 4,
  lift: 6,
  hero: 10,
}

/** Solid drop, e.g. hardShadow(OFFSET.base, theme.palette.text.primary) */
export const hardShadow = (size, color) => `${size}px ${size}px 0 ${color}`

/** Same, but dropping straight down — used for bars pinned to the top. */
export const hardDrop = (size, color) => `0 ${size}px 0 ${color}`

export const FONT = {
  ui: '"Archivo", "Helvetica Neue", Arial, sans-serif',
  data: '"JetBrains Mono", ui-monospace, monospace',
}

// Signal colours. Green is the brand and carries "on track"; the rest are
// borrowed from the work streams so charts and tags stay legible.
export const SIGNAL = {
  go: '#6ba300',
  goDark: '#aedd4d',
  warn: '#f59e0b',
  stop: '#d92b1f',
}
