import React, { useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
} from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { getActivityStreamId } from '../../../utils/projectsManager'
import { injectMarkdown } from '../../../utils/markdownHelpers'

const serializeRichNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || ''
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName.toLowerCase()
  const children = () => [...node.childNodes].map(serializeRichNode).join('')

  if (tag === 'br') return '\n'
  if (tag === 'strong' || tag === 'b') return `**${children()}**`
  if (tag === 'em' || tag === 'i') return `_${children()}_`
  if (tag === 'a') return `[${children()}](${node.getAttribute('href') || ''})`
  if (tag === 'code') return `\`${children()}\``
  if (tag === 'ul') {
    return `${[...node.children]
      .map((item) => `- ${serializeRichNode(item).trim()}`)
      .join('\n')}\n\n`
  }
  if (tag === 'ol') {
    return `${[...node.children]
      .map((item, index) => `${index + 1}. ${serializeRichNode(item).trim()}`)
      .join('\n')}\n\n`
  }
  if (tag === 'li') return children()
  if (/^h[1-6]$/.test(tag)) {
    return `${'#'.repeat(Number(tag[1]))} ${children().trim()}\n\n`
  }
  if (tag === 'blockquote') {
    return `${children()
      .trim()
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n')}\n\n`
  }
  if (tag === 'p' || tag === 'div') return `${children().trimEnd()}\n\n`
  return children()
}

const richHtmlToMarkdown = (element) =>
  [...element.childNodes]
    .map(serializeRichNode)
    .join('')
    .replaceAll('\u00a0', ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()

// The rendered Markdown is intentionally frozen while this editor is mounted.
// The browser owns the contentEditable DOM; changes are serialised back to
// Markdown and become the source for the next mode switch.
const RichNoteEditor = ({ value, onChange, editorRef }) => {
  const [initialValue] = useState(value)

  return (
    <Box
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Rich text note"
      aria-multiline="true"
      onInput={(event) => onChange(richHtmlToMarkdown(event.currentTarget))}
      sx={{
        minHeight: 152,
        mb: 1.5,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        cursor: 'text',
        fontSize: '0.92rem',
        lineHeight: 1.65,
        outline: 'none',
        '&:focus': { borderColor: 'text.primary' },
        '&:empty::before': {
          content: '"Write your note…"',
          color: 'text.disabled',
          fontStyle: 'italic',
        },
        '& p': { mt: 0, mb: 1, '&:last-child': { mb: 0 } },
        '& ul, & ol': { mt: 0.5, mb: 1, pl: 3 },
        '& li': { mb: 0.35 },
        '& strong': { fontWeight: 850, color: 'text.primary' },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {initialValue}
      </ReactMarkdown>
    </Box>
  )
}

// Inline note editor — renders in the flow of the page (no modal), right where
// the note will actually live. Keyed by the note identity in the parent, so
// switching between notes (or starting a blank one) just remounts with fresh
// initial state — no effect needed to resync form state with the `note` prop.
const NoteEditorInline = ({
  note,
  activities = [],
  projects = [],
  streamById = {},
  lockActivityId = null,
  lockProjectId = null,
  onSave,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [viewMode, setViewMode] = useState(note?.content ? 'rich' : 'markdown')
  const contentRef = useRef(null)
  const richEditorRef = useRef(null)
  const [linkedItem, setLinkedItem] = useState(() => {
    const projectId = lockProjectId || note?.projectId || null
    if (projectId) {
      const project = projects.find((p) => p.id === projectId)
      return project ? { ...project, linkType: 'project' } : null
    }
    const activityId = lockActivityId || note?.activityId || null
    const activity = activities.find((a) => a.id === activityId)
    return activity ? { ...activity, linkType: 'activity' } : null
  })

  // Autocomplete's `groupBy` requires same-group options to be contiguous.
  const linkOptions = useMemo(
    () => [
      ...projects.map((project) => ({ ...project, linkType: 'project' })),
      ...activities
        .map((activity) => ({ ...activity, linkType: 'activity' }))
        .sort((a, b) => {
          const streamA = streamById[getActivityStreamId(a)]?.name || ''
          const streamB = streamById[getActivityStreamId(b)]?.name || ''
          return streamA.localeCompare(streamB)
        }),
    ],
    [activities, projects, streamById]
  )

  const applyFormat = (type) => {
    const input = contentRef.current
    const start = input?.selectionStart ?? content.length
    const end = input?.selectionEnd ?? content.length
    const { newText, newCursorPosition } = injectMarkdown(
      content,
      start,
      end,
      type
    )
    setContent(newText)
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(newCursorPosition, newCursorPosition)
    })
  }

  const applyRichFormat = (type) => {
    const commands = {
      bold: 'bold',
      italic: 'italic',
      list: 'insertUnorderedList',
    }
    richEditorRef.current?.focus()
    document.execCommand(commands[type], false)
    setContent(richHtmlToMarkdown(richEditorRef.current))
  }

  const handleSubmit = () => {
    if (!title.trim() && !content.trim()) return
    onSave({
      title: title.trim(),
      content,
      activityId: linkedItem?.linkType === 'activity' ? linkedItem.id : null,
      activityTitle:
        linkedItem?.linkType === 'activity' ? linkedItem.title : null,
      projectId: linkedItem?.linkType === 'project' ? linkedItem.id : null,
      projectTitle:
        linkedItem?.linkType === 'project' ? linkedItem.title : null,
    })
  }

  return (
    <Box
      sx={{
        p: 2.5,
        mb: 2,
        maxWidth: 640,
        border: '1.5px solid',
        borderColor: 'divider',
        borderRadius: '18px',
        bgcolor: 'background.paper',
      }}
    >
      <TextField
        autoFocus
        placeholder="Name"
        fullWidth
        variant="standard"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        InputProps={{ disableUnderline: true }}
        sx={{
          mb: 1.5,
          '& .MuiInputBase-input': { fontWeight: 800, fontSize: '1rem' },
          '& .MuiInputBase-input::placeholder': {
            color: 'text.disabled',
            opacity: 1,
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1,
        }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={viewMode}
          onChange={(_, value) => value && setViewMode(value)}
          aria-label="Note view"
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.45,
              border: 0,
              borderRadius: '999px !important',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'none',
              '&.Mui-selected': {
                bgcolor: 'text.primary',
                color: 'background.paper',
              },
            },
          }}
        >
          <ToggleButton value="rich">Rich view</ToggleButton>
          <ToggleButton value="markdown">Markdown</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[
            { type: 'bold', label: 'Bold', icon: <FormatBold /> },
            { type: 'italic', label: 'Italic', icon: <FormatItalic /> },
            {
              type: 'list',
              label: 'Bulleted list',
              icon: <FormatListBulleted />,
            },
          ].map((action) => (
            <Tooltip title={action.label} key={action.type}>
              <IconButton
                size="small"
                aria-label={action.label}
                onMouseDown={(event) => {
                  if (viewMode === 'rich') event.preventDefault()
                }}
                onClick={() =>
                  viewMode === 'rich'
                    ? applyRichFormat(action.type)
                    : applyFormat(action.type)
                }
                sx={{
                  borderRadius: '8px',
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'text.primary',
                  },
                }}
              >
                {action.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>
      {viewMode === 'markdown' ? (
        <TextField
          inputRef={contentRef}
          placeholder="Write your note using Markdown…"
          fullWidth
          multiline
          minRows={6}
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              alignItems: 'flex-start',
              borderRadius: '12px',
              bgcolor: 'action.hover',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.84rem',
              lineHeight: 1.6,
            },
          }}
        />
      ) : (
        <RichNoteEditor
          value={content}
          onChange={setContent}
          editorRef={richEditorRef}
        />
      )}
      {!lockActivityId && !lockProjectId && (
        <Autocomplete
          options={linkOptions}
          value={linkedItem}
          onChange={(_, val) => setLinkedItem(val)}
          getOptionLabel={(a) => a.title || ''}
          groupBy={(item) =>
            item.linkType === 'project'
              ? 'Projects'
              : streamById[getActivityStreamId(item)]?.name || 'Activities'
          }
          isOptionEqualToValue={(a, b) =>
            a.id === b.id && a.linkType === b.linkType
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              placeholder="Project or activity"
              size="small"
              InputProps={{ ...params.InputProps, disableUnderline: true }}
              sx={{
                '& .MuiInputBase-input::placeholder': {
                  color: 'text.disabled',
                  opacity: 1,
                },
              }}
            />
          )}
          sx={{ mb: 1.5 }}
        />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {note && onDelete && (
          <Button
            onClick={onDelete}
            sx={{
              fontWeight: 900,
              color: 'error.main',
              mr: 'auto',
              '&:hover': { bgcolor: 'transparent', opacity: 0.7 },
            }}
          >
            Delete
          </Button>
        )}
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 900,
            color: 'text.secondary',
            ml: note && onDelete ? 0 : 'auto',
            '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim() && !content.trim()}
          sx={{
            fontWeight: 900,
            px: 3,
            py: 1,
            borderRadius: '16px',
            backgroundImage: 'none',
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: '3px solid',
            borderColor: 'text.primary',
            boxShadow: (theme) => `4px 4px 0px ${theme.palette.text.primary}`,
            '&:hover': {
              bgcolor: 'action.hover',
              boxShadow: (theme) => `2px 2px 0px ${theme.palette.text.primary}`,
              transform: 'translate(2px, 2px)',
            },
            '&.Mui-disabled': {
              opacity: 0.5,
              boxShadow: 'none',
              transform: 'none',
              border: '3px solid #ccc',
            },
          }}
        >
          Save Note
        </Button>
      </Box>
    </Box>
  )
}

export default NoteEditorInline
