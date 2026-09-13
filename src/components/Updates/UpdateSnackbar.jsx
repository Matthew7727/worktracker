import {
  Button,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { SystemUpdateAlt } from '@mui/icons-material'
import { useUpdate } from '../../context/UpdateContext'
import { RULE, OFFSET, hardShadow, SIGNAL } from '../../styles/tokens'

const actionButtonSx = {
  fontWeight: 800,
  backgroundImage: 'none',
  border: `${RULE.hair}px solid`,
  borderColor: 'text.primary',
  boxShadow: (theme) => hardShadow(OFFSET.base, theme.palette.text.primary),
  '&:hover': {
    boxShadow: (theme) => hardShadow(OFFSET.press, theme.palette.text.primary),
    transform: `translate(${OFFSET.press}px, ${OFFSET.press}px)`,
  },
}

const UpdateSnackbar = () => {
  const {
    status,
    info,
    progress,
    dismissed,
    downloadUpdate,
    installUpdate,
    dismiss,
  } = useUpdate()

  const open =
    !dismissed &&
    (status === 'available' ||
      status === 'downloading' ||
      status === 'downloaded')

  if (!open) return null

  const version = info?.version ? `v${info.version}` : 'A new version'

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ zIndex: (theme) => theme.zIndex.snackbar }}
    >
      <Paper
        sx={{
          p: 3,
          minWidth: 320,
          maxWidth: 420,
          border: `${RULE.base}px solid`,
          borderColor: 'text.primary',
          boxShadow: (theme) =>
            hardShadow(OFFSET.lift, theme.palette.text.primary),
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <SystemUpdateAlt />
          <Typography sx={{ fontWeight: 800 }}>
            {status === 'available' && `${version} is available`}
            {status === 'downloading' &&
              `Downloading ${version}… ${Math.floor(progress?.percent || 0)}%`}
            {status === 'downloaded' && `${version} is ready to install`}
          </Typography>
        </Stack>

        {status === 'downloading' ? (
          <LinearProgress
            variant="determinate"
            value={progress?.percent || 0}
            sx={{
              height: 12,
              border: `${RULE.hair}px solid`,
              borderColor: 'text.primary',
              bgcolor: 'background.paper',
              '& .MuiLinearProgress-bar': { bgcolor: SIGNAL.go },
            }}
          />
        ) : (
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={dismiss}
              sx={{ fontWeight: 800, color: 'text.primary' }}
            >
              LATER
            </Button>
            {status === 'available' && (
              <Button
                variant="contained"
                onClick={downloadUpdate}
                sx={{
                  ...actionButtonSx,
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  '&:hover': {
                    ...actionButtonSx['&:hover'],
                    bgcolor: 'action.hover',
                  },
                }}
              >
                DOWNLOAD
              </Button>
            )}
            {status === 'downloaded' && (
              <Button
                variant="contained"
                onClick={installUpdate}
                sx={{
                  ...actionButtonSx,
                  bgcolor: SIGNAL.go,
                  color: '#fff',
                  '&:hover': {
                    ...actionButtonSx['&:hover'],
                    bgcolor: SIGNAL.goDark,
                  },
                }}
              >
                RESTART & INSTALL
              </Button>
            )}
          </Stack>
        )}
      </Paper>
    </Snackbar>
  )
}

export default UpdateSnackbar
