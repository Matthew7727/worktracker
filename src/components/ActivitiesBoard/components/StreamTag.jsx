import { Box } from '@mui/material'
import { alpha } from '@mui/material/styles'

/** Tinted stream pill: colour dot + abbrev. The single stream signal on a card. */
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
        borderRadius: '999px',
        bgcolor: alpha(color, muted ? 0.08 : 0.14),
        color: muted ? 'text.disabled' : color,
        fontSize: size === 'small' ? '0.64rem' : '0.72rem',
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        flexShrink: 0,
        filter: muted ? 'grayscale(0.6)' : 'none',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: color,
          opacity: muted ? 0.5 : 1,
        }}
      />
      {text}
    </Box>
  )
}

export default StreamTag
