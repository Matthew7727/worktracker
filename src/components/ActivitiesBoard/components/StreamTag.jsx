import { Box } from '@mui/material'
import { useIsFilofax } from '../../../styles/useUiStyle'

/** Square colour swatch + stream label. The single stream signal in dense rows. */
const StreamTag = ({ stream, label, muted = false, size = 'small' }) => {
  const isFx = useIsFilofax()
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
        fontWeight: isFx ? 400 : 800,
        fontStyle: isFx ? 'italic' : 'normal',
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
          border: isFx ? 'none' : '1.5px solid',
          borderRadius: isFx ? '50%' : 0,
          borderColor: 'text.primary',
          opacity: muted ? 0.45 : 1,
        }}
      />
      {text}
    </Box>
  )
}

export default StreamTag
