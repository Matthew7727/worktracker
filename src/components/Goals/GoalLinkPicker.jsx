import React, { useEffect, useState } from 'react'
import { Autocomplete, Box, TextField, Typography } from '@mui/material'
import { useAppContext } from '../../context/AppContext'
import { loadGoals } from '../../utils/goalsManager'

const GoalLinkPicker = ({ value = [], onChange, label = 'Supports goals' }) => {
  const { selectedDirectory } = useAppContext()
  const [goals, setGoals] = useState([])
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    loadGoals(selectedDirectory).then(setGoals)
  }, [selectedDirectory])
  const selected = goals.filter((goal) => value.includes(goal.id))
  if (selected.length && !editing) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          whiteSpace: 'nowrap',
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: '.78rem', color: 'text.secondary' }}
        >
          {label}:
        </Typography>
        <Typography
          component="span"
          sx={{ fontSize: '.82rem', fontWeight: 800 }}
        >
          {selected.map((goal) => goal.title).join(' · ')}
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={() => setEditing(true)}
          sx={{
            p: 0,
            border: 'none',
            bgcolor: 'transparent',
            color: 'text.secondary',
            fontFamily: 'inherit',
            fontSize: '.75rem',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Change
        </Box>
      </Box>
    )
  }
  return (
    <Autocomplete
      multiple
      size="small"
      sx={{ minWidth: 300, width: { xs: '100%', sm: 360 } }}
      options={goals}
      value={selected}
      getOptionLabel={(goal) => goal.title}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onChange={(_, next) => {
        onChange(next.map((goal) => goal.id))
        if (next.length) setEditing(false)
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Link a goal" />
      )}
    />
  )
}

export default GoalLinkPicker
