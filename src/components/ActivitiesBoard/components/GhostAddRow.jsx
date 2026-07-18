import { useState } from 'react'
import { Box, InputBase } from '@mui/material'
import { Add } from '@mui/icons-material'

/**
 * A quiet "+ Add todo" row that becomes an input on click and reverts on
 * blur/escape — replaces the always-visible boxed TextField + button.
 */
const GhostAddRow = ({ label = 'Add todo', onAdd, sx = {} }) => {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')

  const submit = () => {
    const value = text.trim()
    if (value) onAdd(value)
    setText('')
  }

  const close = () => {
    submit()
    setEditing(false)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: 34,
        ...sx,
      }}
    >
      {editing ? (
        <InputBase
          autoFocus
          fullWidth
          placeholder={`${label}…`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={close}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') {
              setText('')
              setEditing(false)
            }
          }}
          sx={{ fontSize: '0.86rem', fontWeight: 600 }}
        />
      ) : (
        <Box
          component="button"
          onClick={() => setEditing(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            border: 'none',
            background: 'none',
            p: 0,
            fontFamily: 'inherit',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'text.secondary',
            cursor: 'text',
            textAlign: 'left',
            '&:hover': { color: 'text.primary' },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
              borderRadius: '6px',
            },
          }}
        >
          <Box
            component="span"
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: '1.5px solid',
              borderColor: 'text.secondary',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Add sx={{ fontSize: '0.8rem' }} />
          </Box>
          {label}
        </Box>
      )}
    </Box>
  )
}

export default GhostAddRow
