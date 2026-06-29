import React, { useState } from 'react'
import { Box, Typography, Stack, Collapse } from '@mui/material'
import {
  CheckCircle,
  RadioButtonUnchecked,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material'

const TodoReminder = ({ lanes }) => {
  const allItems = lanes.flatMap((l) => l.items)
  const completedCount = allItems.filter((i) => i.completed).length
  const [open, setOpen] = useState(completedCount > 0)

  if (allItems.length === 0) return null

  return (
    <Box
      sx={{
        mb: 3,
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Box
        component="button"
        onClick={() => setOpen((v) => !v)}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          bgcolor: 'action.hover',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography
            sx={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px' }}
          >
            TODAY&apos;S TODOS
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            {completedCount} of {allItems.length} done
          </Typography>
        </Stack>
        {open ? (
          <KeyboardArrowUp
            sx={{ fontSize: '1.2rem', color: 'text.secondary' }}
          />
        ) : (
          <KeyboardArrowDown
            sx={{ fontSize: '1.2rem', color: 'text.secondary' }}
          />
        )}
      </Box>

      <Collapse in={open}>
        <Stack spacing={0}>
          {lanes.map((lane) =>
            lane.items.length === 0 ? null : (
              <Box key={lane.title}>
                {lanes.filter((l) => l.items.length > 0).length > 1 && (
                  <Typography
                    sx={{
                      px: 2,
                      pt: 1.5,
                      pb: 0.5,
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      letterSpacing: '1px',
                      color: 'text.disabled',
                    }}
                  >
                    {lane.title.toUpperCase()}
                  </Typography>
                )}
                {lane.items.map((item, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      px: 2,
                      py: 0.75,
                      borderTop:
                        i === 0 &&
                        !lanes.filter((l) => l.items.length > 0).length > 1
                          ? '1px solid'
                          : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    {item.completed ? (
                      <CheckCircle
                        sx={{
                          fontSize: '1rem',
                          color: 'success.main',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <RadioButtonUnchecked
                        sx={{
                          fontSize: '1rem',
                          color: 'text.disabled',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: item.completed
                          ? 'text.secondary'
                          : 'text.primary',
                        textDecoration: item.completed
                          ? 'line-through'
                          : 'none',
                        opacity: item.completed ? 0.7 : 1,
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            )
          )}
        </Stack>
      </Collapse>
    </Box>
  )
}

export default TodoReminder
