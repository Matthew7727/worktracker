import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  IconButton,
  Button,
  Switch,
  Tooltip,
  Menu,
  Chip,
} from '@mui/material'
import {
  Tune,
  Star,
  StarBorder,
  Archive,
  Unarchive,
  Add,
  Check,
  Close,
  Edit,
} from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import {
  STREAM_PALETTE,
  MAX_STREAMS,
  MIN_STREAMS,
  renameStream,
  setStreamColor,
  setMainFocus,
  setStreamArchived,
  addStream,
  setFeature,
  getActiveStreams,
  getArchivedStreams,
  nextPaletteColor,
} from '../../utils/streamConfig'

const ColorSwatch = ({ stream, onPick }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  return (
    <>
      <Tooltip title="Change colour">
        <Box
          component="button"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: stream.color,
            border: '3px solid',
            borderColor: 'text.primary',
            cursor: 'pointer',
            flexShrink: 0,
            '&:hover': { transform: 'scale(1.15)' },
            transition: 'all 0.15s',
          }}
        />
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <Box sx={{ display: 'flex', gap: 1, px: 2, py: 1 }}>
          {STREAM_PALETTE.map((c) => (
            <Box
              key={c}
              component="button"
              onClick={() => {
                onPick(c)
                setAnchorEl(null)
              }}
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                bgcolor: c,
                border: '3px solid',
                borderColor:
                  stream.color === c ? 'text.primary' : 'transparent',
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.15)' },
                transition: 'all 0.15s',
              }}
            />
          ))}
        </Box>
      </Menu>
    </>
  )
}

const StreamRow = ({ stream, canArchive, onUpdate }) => {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(stream.name)

  const saveRename = () => {
    if (name.trim() && name.trim() !== stream.name) {
      onUpdate((config) => renameStream(config, stream.id, name))
    } else {
      setName(stream.name)
    }
    setEditing(false)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2.5,
        bgcolor: 'action.hover',
        borderRadius: '16px',
        border: '3px solid',
        borderColor: 'text.primary',
      }}
    >
      <ColorSwatch
        stream={stream}
        onPick={(c) =>
          onUpdate((config) => setStreamColor(config, stream.id, c))
        }
      />

      {editing ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <TextField
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveRename()
              if (e.key === 'Escape') {
                setName(stream.name)
                setEditing(false)
              }
            }}
            autoFocus
            inputProps={{ maxLength: 40 }}
          />
          <IconButton size="small" onClick={saveRename}>
            <Check fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setName(stream.name)
              setEditing(false)
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      ) : (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Typography sx={{ fontWeight: 900, wordBreak: 'break-word' }}>
            {stream.name}
          </Typography>
          {stream.mainFocus && (
            <Chip
              label="MAIN GOAL"
              size="small"
              sx={{
                height: 20,
                fontWeight: 900,
                fontSize: '0.6rem',
                bgcolor: stream.color,
                color: '#000',
              }}
            />
          )}
          <IconButton size="small" onClick={() => setEditing(true)}>
            <Edit fontSize="small" />
          </IconButton>
        </Stack>
      )}

      <Tooltip
        title={stream.mainFocus ? 'This is your main goal' : 'Make main goal'}
      >
        <span>
          <IconButton
            onClick={() =>
              onUpdate((config) => setMainFocus(config, stream.id))
            }
            disabled={stream.mainFocus}
            sx={{ color: stream.mainFocus ? '#f59e0b' : 'text.disabled' }}
          >
            {stream.mainFocus ? <Star /> : <StarBorder />}
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip
        title={
          canArchive
            ? 'Archive stream (history is kept)'
            : 'Cannot archive — keep at least two active streams, and pick a different main goal first'
        }
      >
        <span>
          <IconButton
            onClick={() =>
              onUpdate((config) => setStreamArchived(config, stream.id, true))
            }
            disabled={!canArchive}
          >
            <Archive />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

const FeatureToggle = ({ title, description, checked, onChange }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 2.5,
      bgcolor: 'action.hover',
      borderRadius: '16px',
      border: '3px solid',
      borderColor: 'text.primary',
    }}
  >
    <Box sx={{ pr: 2 }}>
      <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.7 }}>
        {description}
      </Typography>
    </Box>
    <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
  </Box>
)

/**
 * Settings card for managing the workspace's streams: rename, recolour,
 * archive (never delete), switch the main goal, and toggle optional features.
 */
const StreamSettings = () => {
  const {
    streamConfig,
    updateStreamConfig,
    mainFocusStream,
    showNotification,
  } = useAppContext()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  if (!streamConfig) return null

  const active = getActiveStreams(streamConfig)
  const archived = getArchivedStreams(streamConfig)

  const applyUpdate = async (fn) => {
    try {
      await updateStreamConfig(fn(streamConfig))
    } catch (e) {
      console.error('Failed to update stream config:', e)
      showNotification('Failed to save stream settings', 'error')
    }
  }

  const handleAdd = () => {
    if (!newName.trim()) return
    applyUpdate((config) =>
      addStream(config, newName, nextPaletteColor(config))
    )
    setNewName('')
    setAdding(false)
  }

  return (
    <Paper
      sx={{
        p: 6,
        borderRadius: '40px',
        border: '4px solid',
        borderColor: 'text.primary',
        boxShadow: (theme) => `10px 10px 0px ${theme.palette.text.primary}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Tune sx={{ fontSize: '2.5rem' }} />
        <Typography variant="h3" sx={{ fontWeight: 950 }}>
          Work Streams
        </Typography>
      </Stack>

      <Typography variant="body1" sx={{ mb: 4, fontWeight: 700, opacity: 0.8 }}>
        The streams your days are split into. Rename or recolour them any time —
        your history is remapped automatically. Star one as your main goal and
        the dashboard follows your priorities.
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {active.map((s) => (
          <StreamRow
            key={s.id}
            stream={s}
            canArchive={active.length > MIN_STREAMS && !s.mainFocus}
            onUpdate={applyUpdate}
          />
        ))}
      </Stack>

      {adding ? (
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="New stream name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
            inputProps={{ maxLength: 40 }}
          />
          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{ fontWeight: 900 }}
          >
            Add
          </Button>
          <Button onClick={() => setAdding(false)} sx={{ fontWeight: 900 }}>
            Cancel
          </Button>
        </Stack>
      ) : (
        <Button
          startIcon={<Add />}
          onClick={() => setAdding(true)}
          disabled={active.length >= MAX_STREAMS}
          sx={{ mb: 3, fontWeight: 900 }}
        >
          Add Stream{active.length >= MAX_STREAMS ? ' (max reached)' : ''}
        </Button>
      )}

      {archived.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 900, opacity: 0.6, mb: 1.5, letterSpacing: 1 }}
          >
            ARCHIVED
          </Typography>
          <Stack spacing={1}>
            {archived.map((s) => (
              <Box
                key={s.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: '12px',
                  border: '2px dashed',
                  borderColor: 'divider',
                  opacity: 0.7,
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: s.color,
                    flexShrink: 0,
                  }}
                />
                <Typography sx={{ flex: 1, fontWeight: 700 }}>
                  {s.name}
                </Typography>
                <Tooltip title="Restore stream">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() =>
                        applyUpdate((config) =>
                          setStreamArchived(config, s.id, false)
                        )
                      }
                      disabled={active.length >= MAX_STREAMS}
                    >
                      <Unarchive fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Typography
        variant="body2"
        sx={{ fontWeight: 900, opacity: 0.6, mb: 1.5, letterSpacing: 1 }}
      >
        OPTIONAL FEATURES
      </Typography>
      <Stack spacing={2}>
        <FeatureToggle
          title="Utilisation target"
          description={`Track what % of your logged work goes to ${mainFocusStream?.name || 'your main goal'}.`}
          checked={!!streamConfig.features?.utilisation}
          onChange={(v) =>
            applyUpdate((config) => setFeature(config, 'utilisation', v))
          }
        />
        <FeatureToggle
          title="Project pipeline"
          description={`Group ${mainFocusStream?.name || 'main goal'} into projects/engagements with their own tasks.`}
          checked={!!streamConfig.features?.projectHierarchy}
          onChange={(v) =>
            applyUpdate((config) => setFeature(config, 'projectHierarchy', v))
          }
        />
      </Stack>
    </Paper>
  )
}

export default StreamSettings
