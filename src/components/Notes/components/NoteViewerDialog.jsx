import React from 'react'
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material'
import { Edit, UnfoldLess } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { MONO } from '../../shared/ui'
import { useIsFilofax, useFilofaxTokens } from '../../../styles/useUiStyle'
import { inkMarkdown, ruled } from '../../../filofax/paperStyles'

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** A distraction-free reader for a note, shared by every notes surface. */
const NoteViewerDialog = ({
  note,
  stream,
  onClose,
  onEdit,
  onOpenLinkedItem,
}) => {
  const isFx = useIsFilofax()
  const ff = useFilofaxTokens()
  const linked = note?.activityId || note?.projectId

  return (
    <Dialog
      open={Boolean(note)}
      onClose={onClose}
      fullScreen
      aria-labelledby="note-viewer-title"
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          backgroundImage: isFx
            ? `linear-gradient(90deg, transparent 0, transparent 47px, ${ff.rule} 48px, transparent 49px)`
            : 'none',
        },
      }}
    >
      {note && (
        <>
          <Box
            component="header"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: { xs: 2, sm: 4 },
              py: 1.5,
              borderBottom: isFx ? `1px solid ${ff.ruleStrong}` : '3px solid',
              borderColor: isFx ? ff.ruleStrong : 'text.primary',
              bgcolor: 'background.paper',
            }}
          >
            <Button startIcon={<UnfoldLess />} onClick={onClose}>
              Minimise
            </Button>
            <Button startIcon={<Edit />} onClick={onEdit} sx={{ ml: 'auto' }}>
              Edit note
            </Button>
          </Box>
          <DialogContent sx={{ px: { xs: 2.5, sm: 6, md: 10 }, py: 5 }}>
            <Box sx={{ maxWidth: 860, mx: 'auto' }}>
              <Typography
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: isFx ? 400 : 800,
                  fontStyle: isFx ? 'italic' : 'normal',
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                {stream?.name || (linked ? 'Filed with work' : 'Unfiled')}
                {note.updatedAt && ` · Updated ${formatDate(note.updatedAt)}`}
              </Typography>
              <Typography
                id="note-viewer-title"
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.6rem' },
                  lineHeight: 1.1,
                  fontWeight: isFx ? 400 : 900,
                  letterSpacing: isFx ? 0 : '-0.035em',
                  mb: 3,
                }}
              >
                {note.title || 'Untitled note'}
              </Typography>
              <Box
                sx={
                  isFx
                    ? {
                        ...ruled(ff),
                        ...inkMarkdown(ff),
                        fontSize: '1.05rem',
                        minHeight: 180,
                      }
                    : {
                        fontSize: '1.05rem',
                        lineHeight: 1.7,
                        minHeight: 180,
                        '& p': { mt: 0, mb: 1.5 },
                        '& h1, & h2, & h3': {
                          lineHeight: 1.2,
                          mt: 3,
                          mb: 1,
                        },
                        '& ul, & ol': { my: 1.25, pl: 3 },
                        '& li': { mb: 0.45 },
                        '& code': { fontFamily: MONO, fontSize: '0.9em' },
                      }
                }
              >
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {note.content || '*No content yet.*'}
                </ReactMarkdown>
              </Box>
              {linked && onOpenLinkedItem && (
                <Button
                  onClick={() =>
                    onOpenLinkedItem?.(
                      note.projectId ? 'project' : 'activity',
                      note.projectId || note.activityId
                    )
                  }
                  sx={{ mt: 4 }}
                >
                  Open{' '}
                  {note.projectTitle || note.activityTitle || 'linked item'}
                </Button>
              )}
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  )
}

export default NoteViewerDialog
