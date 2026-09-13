import { Box } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { RULE } from '../../../styles/tokens'

/** Tinted stream tag: colour block + abbrev. The single stream signal on a card. */
const StreamTag = ({ stream, label, muted = false, size = 'small' }) => {
  const color = stream?.color || '#9e9e9e'
  const text = label || stream?.abbrev || '—'

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.25,
        border: `${RULE.hair}px solid`,
        borderColor: muted ? 'divider' : color,
        bgcolor: alpha(color, muted ? 0.08 : 0.14),
        color: muted ? 'text.disabled' : color,
        fontSize: size === 'small' ? '0.64rem' : '0.72rem',
        fontWeight: 800,
        flexShrink: 0,
        opacity: muted ? 0.7 : 1,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          bgcolor: color,
          opacity: muted ? 0.5 : 1,
        }}
      />
      {text}
    </Box>
  )
}

export default StreamTag
