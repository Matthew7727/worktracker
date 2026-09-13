import { Box } from '@mui/material'

/** Square colour swatch + stream label. The single stream signal in dense rows. */
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
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
        fontWeight: 800,
        color: muted ? 'text.disabled' : 'text.primary',
        flexShrink: 0,
      }}
    >
      <Box
        component="span"
        sx={{
          width: size === 'small' ? 10 : 12,
          height: size === 'small' ? 10 : 12,
          bgcolor: color,
          border: '1.5px solid',
          borderColor: 'text.primary',
          opacity: muted ? 0.45 : 1,
        }}
      />
      {text}
    </Box>
  )
}

export default StreamTag
