import { useTheme } from '@mui/material/styles'

export const UI_STYLES = ['ledger', 'filofax']

/** True when the Filofax style is active. */
export const useIsFilofax = () => useTheme().custom?.style === 'filofax'

/** The Filofax paper/leather tokens (undefined in ledger style). */
export const useFilofaxTokens = () => useTheme().palette.filofax
