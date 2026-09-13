import React, { useMemo, useRef, useState } from 'react'
import {
  Box,
  TextField,
  Autocomplete,
  InputBase,
  IconButton,
  Tooltip,
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
import { InkButton, Segmented, MONO } from '../../shared/ui'

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

const writingSurface = {
  minHeight: 160,
  px: 2.25,
  py: 1.5,
  fontSize: '0.95rem',
  lineHeight: 1.6,
}

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
      aria-label="Note"
      aria-multiline="true"
      onInput={(event) => onChange(richHtmlToMarkdown(event.currentTarget))}
      sx={{
        ...writingSurface,
        cursor: 'text',
        outline: 'none',
        '&:focus-visible': { bgcolor: 'action.hover' },
        '&:empty::before': {
          content: '"Write the note"',
          color: 'text.disabled',
        },
        '& p': { mt: 0, mb: 1, '&:last-child': { mb: 0 } },
        '& ul, & ol': { mt: 0.5, mb: 1, pl: 3 },
        '& li': { mb: 0.35 },
        '& strong': { fontWeight: 850 },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {initialValue}
      </ReactMarkdown>
    </Box>
  )
}

const FORMAT_ACTIONS = [
  { type: 'bold', label: 'Bold', icon: <FormatBold /> },
  { type: 'italic', label: 'Italic', icon: <FormatItalic /> },
  { type: 'list', label: 'Bulleted list', icon: <FormatListBulleted /> },
]

const RICH_COMMANDS = {
  bold: 'bold',
  italic: 'italic',
  list: 'insertUnorderedList',
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

  const bandColor = linkedItem
    ? linkedItem.linkType === 'activity'
      ? streamById[getActivityStreamId(linkedItem)]?.color
      : null
    : null
  const isEmpty = !title.trim() && !content.trim()

  const applyFormat = (type) => {
    if (viewMode === 'rich') {
      richEditorRef.current?.focus()
      document.execCommand(RICH_COMMANDS[type], false)
      setContent(richHtmlToMarkdown(richEditorRef.current))
      return
    }
    const input = contentRef.current
    const start = input?.selectionStart ?? content.length
    const end = input?.selectionEnd ?? content.length
    const { newText, newCursor } = injectMarkdown(content, start, end, type)
    setContent(newText)
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(newCursor, newCursor)
    })
  }

  const handleSubmit = () => {
    if (isEmpty) return
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
      component="form"
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose?.()
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
      }}
      sx={{
        mb: 3,
        breakInside: 'avoid',
        bgcolor: 'background.paper',
        border: '3px solid',
        borderColor: 'text.primary',
        borderTop: '10px solid',
        borderTopColor: bandColor || 'text.primary',
        boxShadow: (t) => `8px 8px 0 ${t.palette.text.primary}`,
      }}
    >
      <Box sx={{ px: 2.25, pt: 1.75, pb: 1 }}>
        <InputBase
          autoFocus
          fullWidth
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em' }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          px: 1,
          py: 0.75,
          borderTop: '2px solid',
          borderBottom: '2px solid',
          borderColor: 'divider',
          bgcolor: 'background.subtle',
        }}
      >
        {FORMAT_ACTIONS.map((action) => (
          <Tooltip title={action.label} key={action.type}>
            <IconButton
              size="small"
              aria-label={action.label}
              onMouseDown={(event) => {
                if (viewMode === 'rich') event.preventDefault()
              }}
              onClick={() => applyFormat(action.type)}
              sx={{
                p: 0.6,
                color: 'text.secondary',
                '& svg': { fontSize: '1.1rem' },
                '&:hover': {
                  bgcolor: 'text.primary',
                  color: 'background.paper',
                },
              }}
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        ))}
        <Box sx={{ ml: 'auto' }}>
          <Segmented
            size="sm"
            ariaLabel="Note view"
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'rich', label: 'Rich' },
              { value: 'markdown', label: 'Markdown' },
            ]}
            sx={{ borderWidth: '2px' }}
          />
        </Box>
      </Box>

      {viewMode === 'markdown' ? (
        <InputBase
          inputRef={contentRef}
          fullWidth
          multiline
          minRows={6}
          placeholder="Write the note in Markdown"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{
            ...writingSurface,
            alignItems: 'flex-start',
            fontFamily: MONO,
            fontSize: '0.85rem',
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
        <Box
          sx={{
            px: 2.25,
            py: 1,
            borderTop: '2px solid',
            borderColor: 'divider',
          }}
        >
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
                placeholder="Link to a project or activity (optional)"
                size="small"
                InputProps={{ ...params.InputProps, disableUnderline: true }}
                sx={{ '& input': { fontWeight: 700, fontSize: '0.88rem' } }}
              />
            )}
          />
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1.25,
          borderTop: '3px solid',
          borderColor: 'text.primary',
          bgcolor: 'background.subtle',
        }}
      >
        {note && onDelete && (
          <InkButton
            tone="ghost"
            size="sm"
            onClick={onDelete}
            sx={{ color: 'error.main', mr: 'auto' }}
          >
            Delete
          </InkButton>
        )}
        <InkButton
          tone="ghost"
          size="sm"
          onClick={onClose}
          sx={{ ml: note && onDelete ? 0 : 'auto' }}
        >
          Cancel
        </InkButton>
        <InkButton type="submit" size="sm" disabled={isEmpty}>
          Save note
        </InkButton>
      </Box>
    </Box>
  )
}

export default NoteEditorInline
