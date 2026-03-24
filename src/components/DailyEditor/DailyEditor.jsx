import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Fade,
  Button,
  Stack,
  IconButton,
  LinearProgress,
  Paper,
} from '@mui/material'
import {
  Save,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit as EditIcon,
} from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { getDailyFilePath } from '../../utils/fileHelpers'
import {
  stringifyMarkdown,
  parseMarkdown,
  parseStreams,
  stringifyStreams,
} from '../../utils/markdownParser'
import { useLocation } from 'react-router-dom'
import { flowStyles } from './DailyEditor.styles'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'

// Sub-components
import EntryCard from './components/EntryCard'

const STEPS = [
  {
    id: 'clientWork',
    label: 'CLIENT WORK',
    question: 'What Client Work have you done today?',
    color: 'primary.main',
  },
  {
    id: 'practiceDevelopment',
    label: 'PRACTICE DEVELOPMENT',
    question: 'What PD have you done today?',
    color: 'secondary.main',
  },
  {
    id: 'businessDevelopment',
    label: 'BUSINESS DEVELOPMENT',
    question: 'What BD have you done today?',
    color: '#eb8449',
  },
]

const DailyEditor = () => {
  const { selectedDirectory, showNotification } = useAppContext()
  const location = useLocation()

  // State
  const [currentDate, setCurrentDate] = useState(() => {
    if (location.state && location.state.initialDate) {
      return new Date(location.state.initialDate)
    }
    return new Date()
  })

  const [streams, setStreams] = useState({
    clientWork: '',
    practiceDevelopment: '',
    businessDevelopment: '',
  })

  const [viewMode, setViewMode] = useState(() =>
    location.state?.autoStartFlow ? 'flow' : 'start'
  ) // 'start', 'flow', 'summary'
  const [currentStep, setCurrentStep] = useState(0)

  // Watch for location state changes if already mounted
  useEffect(() => {
    if (location.state?.autoStartFlow) {
      setViewMode('flow')
      setCurrentStep(0)
    }
  }, [location.state])
  const [isLoading, setIsLoading] = useState(false)
  const [_isSaving, setIsSaving] = useState(false)

  // Helpers
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Data Loading
  useEffect(() => {
    const loadDailyData = async () => {
      if (!selectedDirectory) return
      setIsLoading(true)
      try {
        const filePath = getDailyFilePath(selectedDirectory, currentDate)
        const fileResult = await window.electronAPI.readFile(filePath)

        if (fileResult.success) {
          const { body } = parseMarkdown(fileResult.data)
          const parsedStreams = parseStreams(body)
          setStreams(parsedStreams)

          // Only show summary if there's actually some content
          const hasData = Object.values(parsedStreams).some(
            (val) => val && val.trim().length > 0
          )
          if (!location.state?.autoStartFlow) {
            setViewMode(hasData ? 'summary' : 'start')
          }
        } else {
          setStreams({
            clientWork: '',
            practiceDevelopment: '',
            businessDevelopment: '',
          })
          if (!location.state?.autoStartFlow) {
            setViewMode('start')
          }
        }
      } catch (error) {
        console.error('Failed to load daily data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadDailyData()
  }, [currentDate, selectedDirectory, location.state?.autoStartFlow])

  const handleSaveDay = async () => {
    if (!selectedDirectory) return
    setIsSaving(true)
    try {
      const filePath = getDailyFilePath(selectedDirectory, currentDate)
      const body = stringifyStreams(streams)
      const frontmatter = {
        date: currentDate.toISOString().split('T')[0],
        lastModified: new Date().toISOString(),
      }

      const fileContent = stringifyMarkdown(body, frontmatter)
      const result = await window.electronAPI.writeFile(filePath, fileContent)

      if (result.success) {
        showNotification('Day archived successfully', 'success')
        setViewMode('summary')
      } else {
        showNotification(`Save Error: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Failed to save day:', error)
      showNotification('Failed to save to system', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const updateStream = (streamId, content) => {
    setStreams((prev) => ({ ...prev, [streamId]: content }))
  }

  const handlePrevDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} thickness={5} />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Unified Header with Navigation */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={4}
        sx={{ mt: 2, mb: 4 }}
      >
        <IconButton
          onClick={handlePrevDay}
          sx={{
            border: '4px solid black',
            p: 1.5,
            '&:hover': { bgcolor: 'black', color: 'white' },
          }}
        >
          <ChevronLeft sx={{ fontSize: '2.5rem' }} />
        </IconButton>

        <Typography variant="h2" sx={{ fontWeight: 950, textAlign: 'center' }}>
          {formatDate(currentDate)}
        </Typography>

        <IconButton
          onClick={handleNextDay}
          sx={{
            border: '4px solid black',
            p: 1.5,
            '&:hover': { bgcolor: 'black', color: 'white' },
          }}
        >
          <ChevronRight sx={{ fontSize: '2.5rem' }} />
        </IconButton>
      </Stack>

      {viewMode === 'start' && (
        <Box sx={flowStyles.container}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
            Ready to log your achievements?
          </Typography>
          <Box
            component="button"
            onClick={() => {
              setCurrentStep(0)
              setViewMode('flow')
            }}
            sx={flowStyles.startButton}
          >
            START FLOW
            <Box className="shine-layer" sx={flowStyles.shineLayer} />
          </Box>
        </Box>
      )}

      {viewMode === 'flow' && (
        <Box sx={{ maxWidth: '900px', mx: 'auto', width: '100%', mt: 4 }}>
          <Box sx={{ mb: 4 }}>
            <LinearProgress
              variant="determinate"
              value={((currentStep + 1) / STEPS.length) * 100}
              sx={{
                height: 16,
                borderRadius: 8,
                border: '4px solid black',
                bgcolor: 'white',
                '& .MuiLinearProgress-bar': {
                  bgcolor: STEPS[currentStep].color,
                },
              }}
            />
            <Typography
              sx={{
                mt: 1,
                textAlign: 'right',
                fontWeight: 950,
                fontSize: '1.1rem',
              }}
            >
              STEP {currentStep + 1} OF {STEPS.length}
            </Typography>
          </Box>

          <Fade in={true} key={currentStep}>
            <Box>
              <Typography
                variant="h3"
                sx={{ mb: 4, fontWeight: 950, color: STEPS[currentStep].color }}
              >
                {STEPS[currentStep].question}
              </Typography>

              <EntryCard
                entry={{ content: streams[STEPS[currentStep].id], tags: [] }}
                onUpdateContent={(id, content) =>
                  updateStream(STEPS[currentStep].id, content)
                }
                isStreamMode
                borderColor={STEPS[currentStep].color}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mt: 6 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBack />}
                  onClick={() =>
                    currentStep === 0
                      ? setViewMode('start')
                      : setCurrentStep((prev) => prev - 1)
                  }
                  sx={{
                    px: 4,
                    py: 1.5,
                    border: '4px solid black',
                    borderWidth: '3px !important',
                    fontWeight: 900,
                    color: 'black',
                  }}
                >
                  {currentStep === 0 ? 'CANCEL' : 'BACK'}
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  endIcon={
                    currentStep === STEPS.length - 1 ? (
                      <CheckCircle />
                    ) : (
                      <ArrowForward />
                    )
                  }
                  onClick={() =>
                    currentStep < STEPS.length - 1
                      ? setCurrentStep((prev) => prev + 1)
                      : handleSaveDay()
                  }
                  sx={{
                    px: 6,
                    py: 1.5,
                    fontWeight: 900,
                    bgcolor: STEPS[currentStep].color,
                    border: '4px solid black',
                    boxShadow: '8px 8px 0px black',
                    '&:hover': {
                      bgcolor: STEPS[currentStep].color,
                      transform: 'translate(-2px, -2px)',
                      boxShadow: '10px 10px 0px black',
                    },
                  }}
                >
                  {currentStep === STEPS.length - 1 ? 'FINISH & SAVE' : 'NEXT'}
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Box>
      )}

      {viewMode === 'summary' && (
        <Fade in={true}>
          <Box sx={{ maxWidth: '1000px', mx: 'auto', width: '100%', mt: 4 }}>
            <Paper
              sx={{
                p: 6,
                borderRadius: '40px',
                border: '5px solid black',
                boxShadow: '15px 15px 0px rgba(0,0,0,0.1)',
                mb: 10,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 6 }}
              >
                <Typography
                  variant="h2"
                  sx={{ fontWeight: 950, letterSpacing: '-2px' }}
                >
                  JOURNAL SUMMARY
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setCurrentStep(0)
                    setViewMode('flow')
                  }}
                  sx={{
                    bgcolor: 'black',
                    color: 'white',
                    fontWeight: 900,
                    px: 4,
                    '&:hover': { bgcolor: '#333' },
                  }}
                >
                  EDIT DAY
                </Button>
              </Stack>

              <Stack spacing={6}>
                {STEPS.map((step) => (
                  <Box key={step.id}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 950, color: step.color, mb: 2 }}
                    >
                      {step.label}
                    </Typography>
                    <Box
                      sx={{
                        pl: 4,
                        borderLeft: `4px solid ${step.color}22`,
                        fontSize: '1.25rem',
                        lineHeight: 1.6,
                        color: 'text.secondary',
                        '& p': { m: 0 },
                      }}
                    >
                      {streams[step.id] ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {streams[step.id]}
                        </ReactMarkdown>
                      ) : (
                        <Typography sx={{ fontStyle: 'italic', opacity: 0.5 }}>
                          No entry for this stream.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
        </Fade>
      )}
    </Box>
  )
}

export default DailyEditor
