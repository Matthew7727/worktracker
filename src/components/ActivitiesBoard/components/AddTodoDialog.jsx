import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import GoalLinkPicker from '../../Goals/GoalLinkPicker'

const AddTodoDialog = ({ open, onClose, onAdd, activities = [] }) => {
  const [text, setText] = useState('')
  const [activityId, setActivityId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [important, setImportant] = useState(false)
  const [subtasksText, setSubtasksText] = useState('')
  const [goalIds, setGoalIds] = useState([])

  const activeActivities = useMemo(
    () => activities.filter((activity) => activity.status === 'active'),
    [activities]
  )

  const reset = () => {
    setText('')
    setActivityId('')
    setDueDate('')
    setImportant(false)
    setSubtasksText('')
    setGoalIds([])
  }
  const close = () => {
    reset()
    onClose()
  }
  const submit = () => {
    const subtasks = subtasksText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    if (!text.trim() || !activityId) return
    onAdd(activityId, text.trim(), { dueDate, important, subtasks, goalIds })
    close()
  }

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>New to-do</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="What needs doing?"
          value={text}
          onChange={(event) => setText(event.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          select
          required
          fullWidth
          label="Activity"
          value={activityId}
          onChange={(event) => setActivityId(event.target.value)}
          helperText="This to-do will live on the selected activity."
          sx={{ mb: 1.5 }}
        >
          {activeActivities.map((activity) => (
            <MenuItem key={activity.id} value={activity.id}>
              {activity.title}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
          <TextField
            fullWidth
            type="date"
            label="Due date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={important}
                onChange={(event) => setImportant(event.target.checked)}
              />
            }
            label="Important"
            sx={{ whiteSpace: 'nowrap', mr: 0 }}
          />
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Subtasks (one per line)"
          value={subtasksText}
          onChange={(event) => setSubtasksText(event.target.value)}
          sx={{ mb: 2 }}
        />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.75 }}>
            Goals (optional)
          </Typography>
          <GoalLinkPicker value={goalIds} onChange={setGoalIds} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={close}>Cancel</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!text.trim() || !activityId}
        >
          Add to-do
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddTodoDialog
