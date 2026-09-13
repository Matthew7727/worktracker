import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  IconButton,
  Switch,
  Tooltip,
} from '@mui/material'
import { Add, Delete, RocketLaunch } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { RULE, OFFSET, hardShadow } from '../../styles/tokens'
import {
  STREAM_PALETTE,
  MAX_STREAMS,
  MIN_STREAMS,
  createStream,
  createConfig,
  slugify,
} from '../../utils/streamConfig'

const ColorDot = ({ color, selected, onClick, size = 28 }) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      width: size,
      height: size,
      appearance: 'none',
      borderRadius: 0,
      bgcolor: color,
      border: `${RULE.base}px solid`,
      borderColor: selected ? 'text.primary' : 'transparent',
      outline: `${RULE.hair}px solid`,
      outlineColor: selected ? color : 'transparent',
      cursor: 'pointer',
      transition:
        'border-color 120ms linear, box-shadow 120ms linear, transform 120ms linear',
      '&:hover': {
        boxShadow: (theme) =>
          hardShadow(OFFSET.press, theme.palette.text.primary),
        transform: `translate(${OFFSET.press}px, ${OFFSET.press}px)`,
      },
    }}
  />
)

const ColorPicker = ({ value, onChange }) => (
  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
    {STREAM_PALETTE.map((c) => (
      <ColorDot
        key={c}
        color={c}
        selected={value === c}
        onClick={() => onChange(c)}
      />
    ))}
  </Stack>
)

const ToggleRow = ({ title, description, checked, onChange }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 2.5,
      bgcolor: 'action.hover',
      border: `${RULE.hair}px solid`,
      borderColor: 'text.primary',
      '& + &': {
        borderTop: 0,
      },
    }}
  >
    <Box sx={{ pr: 2 }}>
      <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.7 }}>
        {description}
      </Typography>
    </Box>
    <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
  </Box>
)

/**
 * First-run wizard for a brand-new workspace: name your main focus,
 * add the other streams, pick colours, toggle optional features.
 */
const StreamSetup = () => {
  const { updateStreamConfig, showNotification } = useAppContext()

  const [mainName, setMainName] = useState('')
  const [mainColor, setMainColor] = useState(STREAM_PALETTE[0])
  const [others, setOthers] = useState([
    { name: '', color: STREAM_PALETTE[1] },
    { name: '', color: STREAM_PALETTE[2] },
  ])
  const [utilisation, setUtilisation] = useState(false)
  const [projectHierarchy, setProjectHierarchy] = useState(true)
  const [saving, setSaving] = useState(false)

  const filledOthers = others.filter((o) => o.name.trim())
  const totalStreams = (mainName.trim() ? 1 : 0) + filledOthers.length
  const canCreate = mainName.trim() && totalStreams >= MIN_STREAMS

  const addOther = () => {
    if (1 + others.length >= MAX_STREAMS) return
    const used = new Set([mainColor, ...others.map((o) => o.color)])
    const nextColor =
      STREAM_PALETTE.find((c) => !used.has(c)) || STREAM_PALETTE[0]
    setOthers([...others, { name: '', color: nextColor }])
  }

  const updateOther = (index, patch) =>
    setOthers(others.map((o, i) => (i === index ? { ...o, ...patch } : o)))

  const removeOther = (index) => setOthers(others.filter((_, i) => i !== index))

  const handleCreate = async () => {
    if (!canCreate) return
    setSaving(true)
    try {
      const streams = [
        createStream(mainName, mainColor, { mainFocus: true }),
        ...filledOthers.map((o) => createStream(o.name, o.color)),
      ]
      // Guarantee unique ids if two streams share a slug
      const seen = new Set()
      streams.forEach((s) => {
        let id = s.id
        let n = 2
        while (seen.has(id)) id = `${slugify(s.name)}-${n++}`
        s.id = id
        seen.add(id)
      })
      await updateStreamConfig(
        createConfig(streams, { utilisation, projectHierarchy })
      )
      showNotification('Workspace ready — let’s go!', 'success')
    } catch (e) {
      console.error('Failed to create stream config:', e)
      showNotification('Failed to save workspace setup', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 4,
      }}
    >
      <Paper
        sx={{
          p: { xs: 4, md: 6 },
          maxWidth: '720px',
          width: '100%',
          border: `${RULE.base}px solid`,
          borderColor: 'text.primary',
          boxShadow: (theme) =>
            hardShadow(OFFSET.lift, theme.palette.text.primary),
        }}
      >
        <Typography
          variant="h2"
          sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.04em' }}
        >
          Shape your day
        </Typography>
        <Typography sx={{ mb: 5, opacity: 0.7, fontWeight: 700 }}>
          How do you want to separate the work you do? Name your main focus,
          then add the other streams you want to track. You can rename, recolour
          and archive these later in Settings.
        </Typography>

        {/* Main focus */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 1.5,
          }}
        >
          Your main focus
        </Typography>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="e.g. Client Work, Studying, Deep Work…"
            value={mainName}
            onChange={(e) => setMainName(e.target.value)}
            inputProps={{ maxLength: 40 }}
          />
          <ColorPicker value={mainColor} onChange={setMainColor} />
        </Stack>

        {/* Other streams */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 1.5,
          }}
        >
          Other streams
        </Typography>
        <Stack spacing={2.5} sx={{ mb: 3 }}>
          {others.map((o, i) => (
            <Stack key={i} spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Stream ${i + 2} — e.g. Learning, Admin, Health…`}
                  value={o.name}
                  onChange={(e) => updateOther(i, { name: e.target.value })}
                  inputProps={{ maxLength: 40 }}
                />
                <Tooltip title="Remove">
                  <span>
                    <IconButton
                      onClick={() => removeOther(i)}
                      disabled={others.length <= 1}
                    >
                      <Delete />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <ColorPicker
                value={o.color}
                onChange={(c) => updateOther(i, { color: c })}
              />
            </Stack>
          ))}
        </Stack>
        <Button
          startIcon={<Add />}
          onClick={addOther}
          disabled={1 + others.length >= MAX_STREAMS}
          sx={{ mb: 5, fontWeight: 800 }}
        >
          Add another stream
        </Button>

        {/* Optional features */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 1.5,
          }}
        >
          Optional features
        </Typography>
        <Stack spacing={0} sx={{ mb: 5 }}>
          <ToggleRow
            title="Utilisation target"
            description="Track what % of your logged work goes to your main focus (great for billable work)."
            checked={utilisation}
            onChange={setUtilisation}
          />
          <ToggleRow
            title="Project pipeline"
            description="Group your main focus into projects/engagements with their own task lists."
            checked={projectHierarchy}
            onChange={setProjectHierarchy}
          />
        </Stack>

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<RocketLaunch />}
          disabled={!canCreate || saving}
          onClick={handleCreate}
          sx={{
            py: 2,
            fontSize: '1.15rem',
            fontWeight: 800,
            backgroundImage: 'none',
            border: `${RULE.hair}px solid`,
            borderColor: 'text.primary',
            boxShadow: (theme) =>
              hardShadow(OFFSET.base, theme.palette.text.primary),
            '&:hover': {
              transform: `translate(${OFFSET.press}px, ${OFFSET.press}px)`,
              boxShadow: (theme) =>
                hardShadow(OFFSET.press, theme.palette.text.primary),
            },
          }}
        >
          {saving ? 'SETTING UP…' : 'CREATE WORKSPACE'}
        </Button>
        {!canCreate && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 2,
              textAlign: 'center',
              fontWeight: 700,
              opacity: 0.6,
            }}
          >
            Name your main focus and at least one other stream to continue.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default StreamSetup
