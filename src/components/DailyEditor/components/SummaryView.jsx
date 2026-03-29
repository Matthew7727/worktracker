import React from 'react'
import { Box, Typography, Fade, Button, Stack, Paper } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { STEPS } from '../constants'

const SummaryView = ({ streams, onEdit }) => (
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
          <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-2px' }}>
            JOURNAL SUMMARY
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onEdit}
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
)

export default SummaryView
