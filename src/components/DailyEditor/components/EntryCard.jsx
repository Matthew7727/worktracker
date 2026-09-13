import React, { useRef, useState } from 'react'
import { Paper, Box, IconButton, TextField, Tooltip } from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Title,
  List as ListIcon,
  FormatQuote,
  Code as CodeIcon,
  Link as LinkIcon,
} from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import {
  cardStyles,
  entryBodyStyles,
  markdownToolbarStyles,
  toolbarBtnStyles,
} from '../DailyEditor.styles'
import { injectMarkdown } from '../../../utils/markdownHelpers'
import { Segmented } from '../../shared/ui'

const TOOL_GROUPS = [
  [
    ['bold', 'Bold', FormatBold],
    ['italic', 'Italic', FormatItalic],
    ['strikethrough', 'Strikethrough', FormatStrikethrough],
  ],
  [
    ['heading', 'Heading', Title],
    ['list', 'List', ListIcon],
    ['blockquote', 'Quote', FormatQuote],
    ['code', 'Code', CodeIcon],
    ['link', 'Link', LinkIcon],
  ],
  [
    ['align-left', 'Align left', FormatAlignLeft],
    ['align-center', 'Align center', FormatAlignCenter],
    ['align-right', 'Align right', FormatAlignRight],
  ],
]

const openLink = (e, url) => {
  e.preventDefault()
  if (window.electronAPI?.openExternal) window.electronAPI.openExternal(url)
  else window.open(url, '_blank')
}

const EntryCard = ({ content, onChange, accentColor = 'primary.main' }) => {
  const [mode, setMode] = useState('write')
  const fieldRef = useRef(null)

  const applyTool = (type) => {
    const textarea = fieldRef.current?.querySelector('textarea')
    if (!textarea) return
    const { newText, newCursor } = injectMarkdown(
      content,
      textarea.selectionStart,
      textarea.selectionEnd,
      type
    )
    onChange(newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursor, newCursor)
    }, 0)
  }

  return (
    <Paper
      sx={{
        ...cardStyles,
        borderTop: '10px solid',
        borderTopColor: accentColor,
      }}
    >
      <Box sx={markdownToolbarStyles}>
        {mode === 'write' &&
          TOOL_GROUPS.map((group, gi) => (
            <React.Fragment key={gi}>
              {gi > 0 && (
                <Box
                  sx={{
                    width: '2px',
                    height: 20,
                    bgcolor: 'divider',
                    mx: 0.75,
                  }}
                />
              )}
              {group.map(([type, label, icon]) => (
                <Tooltip key={type} title={label}>
                  <IconButton
                    size="small"
                    aria-label={label}
                    sx={toolbarBtnStyles}
                    onClick={() => applyTool(type)}
                  >
                    {React.createElement(icon)}
                  </IconButton>
                </Tooltip>
              ))}
            </React.Fragment>
          ))}
        <Box sx={{ ml: 'auto' }}>
          <Segmented
            size="sm"
            ariaLabel="Editor mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'write', label: 'Write' },
              { value: 'preview', label: 'Preview' },
            ]}
            sx={{ borderWidth: '2px' }}
          />
        </Box>
      </Box>

      {mode === 'write' ? (
        <TextField
          ref={fieldRef}
          autoFocus
          multiline
          minRows={10}
          fullWidth
          placeholder="What moved forward? Decisions, blockers, who you worked with…"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          variant="filled"
          InputProps={entryBodyStyles}
        />
      ) : (
        <Box
          onClick={() => setMode('write')}
          sx={{
            ...entryBodyStyles.sx,
            minHeight: 280,
            cursor: 'text',
            '& p': { mt: 0, mb: 1 },
            '& ul, & ol': { pl: 3, my: 1 },
            '& a': { color: 'text.primary', textDecorationThickness: '2px' },
            '& blockquote': {
              m: 0,
              pl: 2,
              borderLeft: '4px solid',
              borderColor: accentColor,
              color: 'text.secondary',
            },
            '& code': {
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.9em',
              bgcolor: 'action.hover',
              px: 0.5,
            },
          }}
        >
          {content.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: (props) => (
                  <a {...props} onClick={(e) => openLink(e, props.href)} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <Box sx={{ color: 'text.disabled' }}>Nothing written yet.</Box>
          )}
        </Box>
      )}
    </Paper>
  )
}

export default EntryCard
