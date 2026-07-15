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

const actionButtonSx = {
  fontWeight: 900,
  backgroundImage: 'none',
  border: '2px solid',
  borderColor: 'text.primary',
  boxShadow: (theme) => `3px 3px 0px ${theme.palette.text.primary}`,
  '&:hover': {
    boxShadow: (theme) => `1px 1px 0px ${theme.palette.text.primary}`,
    transform: 'translate(2px, 2px)',
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
          borderRadius: '20px',
          border: '3px solid',
          borderColor: 'text.primary',
          boxShadow: (theme) => `6px 6px 0px ${theme.palette.text.primary}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <SystemUpdateAlt />
          <Typography sx={{ fontWeight: 900 }}>
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
              borderRadius: 6,
              border: '2px solid',
              borderColor: 'text.primary',
              bgcolor: 'background.paper',
              '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' },
            }}
          />
        ) : (
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={dismiss}
              sx={{ fontWeight: 900, color: 'text.primary' }}
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
                  bgcolor: '#4caf50',
                  color: '#fff',
                  '&:hover': {
                    ...actionButtonSx['&:hover'],
                    bgcolor: '#388e3c',
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
