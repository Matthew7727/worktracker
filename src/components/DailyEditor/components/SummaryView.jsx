import React from 'react'
import { Box, Typography, Fade, Button, Stack, Paper } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { STEPS, PROJECT_TYPE_LABELS } from '../constants'

const SummaryView = ({ streams, projectEntries, onEdit }) => {
  const hasProjectEntries = projectEntries?.some((p) => p.content?.trim())

  return (
    <Fade in={true}>
      <Box sx={{ maxWidth: '1000px', mx: 'auto', width: '100%', mt: 4 }}>
        <Paper
          sx={{
            p: 6,
            borderRadius: '40px',
            border: '5px solid',
            borderColor: 'text.primary',
            boxShadow: (theme) =>
              `15px 15px 0px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
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
              onClick={onEdit}
              sx={{
                bgcolor: 'text.primary',
                color: 'background.paper',
                fontWeight: 900,
                px: 4,
                '&:hover': { bgcolor: '#333' },
              }}
            >
              EDIT DAY
            </Button>
          </Stack>

          {hasProjectEntries ? (
            // New format: per-project entries grouped by type
            <Stack spacing={4}>
              {['client', 'pd', 'bd'].map((type) => {
                const entries = projectEntries.filter(
                  (p) => p.type === type && p.content?.trim()
                )
                if (entries.length === 0) return null
                const typeColor =
                  type === 'client'
                    ? 'primary.main'
                    : type === 'pd'
                      ? '#ffd166'
                      : '#eb8449'
                return (
                  <Box key={type}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 950,
                        color: typeColor,
                        mb: 2,
                        letterSpacing: '1px',
                      }}
                    >
                      {PROJECT_TYPE_LABELS[type]}
                    </Typography>
                    <Stack spacing={3}>
                      {entries.map((project) => (
                        <Box key={project.title}>
                          <Typography
                            sx={{
                              fontWeight: 900,
                              fontSize: '1rem',
                              mb: 1,
                              pl: 3,
                              borderLeft: `4px solid`,
                              borderColor: typeColor,
                            }}
                          >
                            {project.title}
                          </Typography>
                          <Box
                            sx={{
                              pl: 4,
                              fontSize: '1.1rem',
                              lineHeight: 1.6,
                              color: 'text.secondary',
                              '& p': { m: 0 },
                            }}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkBreaks]}
                              rehypePlugins={[rehypeRaw]}
                            >
                              {project.content}
                            </ReactMarkdown>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )
              })}
            </Stack>
          ) : (
            // Legacy format: stream blobs
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
          )}
        </Paper>
      </Box>
    </Fade>
  )
}

export default SummaryView
