import React, { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Switch,
  Tooltip,
  Menu,
  InputBase,
} from '@mui/material'
import {
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
import { SettingsSection, SettingRow } from './SettingsSection'
import { InkButton } from '../shared/ui'

const ColorSwatch = ({ stream, onPick }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  return (
    <>
      <Tooltip title="Change colour">
        <Box
          component="button"
          type="button"
          aria-label={`Change colour for ${stream.name}`}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            width: 36,
            height: 36,
            bgcolor: stream.color,
            border: '3px solid',
            borderColor: 'text.primary',
            cursor: 'pointer',
            flexShrink: 0,
            '&:focus-visible': {
              outline: '3px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        />
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 32px)',
            gap: 0.75,
            px: 1.5,
            py: 1,
          }}
        >
          {STREAM_PALETTE.map((c) => (
            <Box
              key={c}
              component="button"
              type="button"
              aria-label={`Use ${c}`}
              onClick={() => {
                onPick(c)
                setAnchorEl(null)
              }}
              sx={{
                width: 32,
                height: 32,
                bgcolor: c,
                border: stream.color === c ? '4px solid' : '2px solid',
                borderColor: 'text.primary',
                cursor: 'pointer',
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
        px: 3,
        py: 1.5,
        borderTop: '2px solid',
        borderColor: 'divider',
        '&:first-of-type': { borderTop: 'none' },
      }}
    >
      <ColorSwatch
        stream={stream}
        onPick={(c) =>
          onUpdate((config) => setStreamColor(config, stream.id, c))
        }
      />

      {editing ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
          <InputBase
            fullWidth
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveRename()
              if (e.key === 'Escape') {
                setName(stream.name)
                setEditing(false)
              }
            }}
            inputProps={{ maxLength: 40, 'aria-label': 'Stream name' }}
            sx={{
              fontWeight: 800,
              fontSize: '1.05rem',
              borderBottom: '3px solid',
              borderColor: 'text.primary',
            }}
          />
          <IconButton size="small" aria-label="Save name" onClick={saveRename}>
            <Check fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Cancel rename"
            onClick={() => {
              setName(stream.name)
              setEditing(false)
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.05rem',
              wordBreak: 'break-word',
            }}
          >
            {stream.name}
          </Typography>
          {stream.mainFocus && (
            <Box
              sx={{
                px: 0.75,
                py: 0.1,
                fontSize: '0.75rem',
                fontWeight: 800,
                bgcolor: stream.color,
                color: '#000',
                border: '2px solid',
                borderColor: 'text.primary',
                whiteSpace: 'nowrap',
              }}
            >
              Main goal
            </Box>
          )}
          <IconButton
            size="small"
            aria-label={`Rename ${stream.name}`}
            onClick={() => setEditing(true)}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Tooltip
        title={stream.mainFocus ? 'This is your main goal' : 'Make main goal'}
      >
        <span>
          <IconButton
            aria-label="Make main goal"
            onClick={() =>
              onUpdate((config) => setMainFocus(config, stream.id))
            }
            disabled={stream.mainFocus}
            sx={{
              color: stream.mainFocus ? '#f59e0b !important' : 'text.secondary',
            }}
          >
            {stream.mainFocus ? <Star /> : <StarBorder />}
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip
        title={
          canArchive
            ? 'Archive stream (history is kept)'
            : 'To archive, keep at least two active streams and pick a different main goal first'
        }
      >
        <span>
          <IconButton
            aria-label="Archive stream"
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

/**
 * Settings sections for managing the workspace's streams (rename, recolour,
 * archive, main goal) and the optional features they unlock.
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
  const atMax = active.length >= MAX_STREAMS

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
    <>
      <SettingsSection
        id="streams"
        title="Work streams"
        description="The streams your days are split into. Rename or recolour them any time and your history follows. Star one as your main goal and the dashboard leads with it."
        action={
          !adding && (
            <InkButton
              tone="outline"
              size="sm"
              startIcon={<Add />}
              onClick={() => setAdding(true)}
              disabled={atMax}
            >
              {atMax ? `Maximum ${MAX_STREAMS}` : 'Add stream'}
            </InkButton>
          )
        }
      >
        <Box>
          {active.map((s) => (
            <StreamRow
              key={s.id}
              stream={s}
              canArchive={active.length > MIN_STREAMS && !s.mainFocus}
              onUpdate={applyUpdate}
            />
          ))}
        </Box>

        {adding && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 3,
              py: 1.5,
              borderTop: '3px solid',
              borderColor: 'text.primary',
              bgcolor: 'background.subtle',
            }}
          >
            <InputBase
              fullWidth
              autoFocus
              placeholder="New stream name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') setAdding(false)
              }}
              inputProps={{ maxLength: 40, 'aria-label': 'New stream name' }}
              sx={{ fontWeight: 800 }}
            />
            <InkButton tone="ghost" size="sm" onClick={() => setAdding(false)}>
              Cancel
            </InkButton>
            <InkButton size="sm" onClick={handleAdd} disabled={!newName.trim()}>
              Add stream
            </InkButton>
          </Box>
        )}

        {archived.length > 0 && (
          <Box sx={{ borderTop: '3px solid', borderColor: 'text.primary' }}>
            <Typography
              sx={{ px: 3, pt: 1.5, fontWeight: 800, color: 'text.secondary' }}
            >
              Archived
            </Typography>
            {archived.map((s) => (
              <Box
                key={s.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 3,
                  py: 0.75,
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: s.color,
                    border: '2px solid',
                    borderColor: 'text.primary',
                    opacity: 0.5,
                  }}
                />
                <Typography
                  sx={{ flex: 1, fontWeight: 700, color: 'text.secondary' }}
                >
                  {s.name}
                </Typography>
                <Tooltip
                  title={
                    atMax ? 'Archive another stream first' : 'Restore stream'
                  }
                >
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Restore ${s.name}`}
                      onClick={() =>
                        applyUpdate((config) =>
                          setStreamArchived(config, s.id, false)
                        )
                      }
                      disabled={atMax}
                    >
                      <Unarchive fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            ))}
          </Box>
        )}
      </SettingsSection>

      <SettingsSection
        id="features"
        title="Features"
        description="Optional tools that change what Entries, Activities and the Dashboard show."
      >
        <SettingRow
          label="Utilisation target"
          hint={`Predict what share of a standard week goes to ${mainFocusStream?.name || 'your main goal'}.`}
        >
          <Switch
            checked={!!streamConfig.features?.utilisation}
            onChange={(e) =>
              applyUpdate((config) =>
                setFeature(config, 'utilisation', e.target.checked)
              )
            }
            inputProps={{ 'aria-label': 'Utilisation target' }}
          />
        </SettingRow>
        <SettingRow
          label="Project pipeline"
          hint={`Group ${mainFocusStream?.name || 'your main goal'} into dated projects with their own todos.`}
        >
          <Switch
            checked={!!streamConfig.features?.projectHierarchy}
            onChange={(e) =>
              applyUpdate((config) =>
                setFeature(config, 'projectHierarchy', e.target.checked)
              )
            }
            inputProps={{ 'aria-label': 'Project pipeline' }}
          />
        </SettingRow>
      </SettingsSection>
    </>
  )
}

export default StreamSettings
