import React, { useRef, useState } from 'react'
import { Box, IconButton, InputBase, Tooltip } from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
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
import { injectMarkdown } from '../../utils/markdownHelpers'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import { Segmented } from '../../components/shared/ui'
import { LINE, ruled, inkMarkdown, openLink } from '../paperStyles'

const TOOLS = [
  ['bold', 'Bold', FormatBold],
  ['italic', 'Italic', FormatItalic],
  ['strikethrough', 'Strikethrough', FormatStrikethrough],
  ['heading', 'Heading', Title],
  ['list', 'List', ListIcon],
  ['blockquote', 'Quote', FormatQuote],
  ['code', 'Code', CodeIcon],
  ['link', 'Link', LinkIcon],
]

/** Markdown written straight onto ruled lines, with a small pen toolbar. */
const EntryField = ({
  value,
  onChange,
  placeholder,
  minRows = 5,
  autoFocus = false,
  label,
}) => {
  const ff = useFilofaxTokens()
  const [mode, setMode] = useState('write')
  const inputRef = useRef(null)

  const applyTool = (type) => {
    const textarea = inputRef.current
    if (!textarea) return
    const { newText, newCursor } = injectMarkdown(
      value,
      textarea.selectionStart,
      textarea.selectionEnd,
      type
    )
    onChange(newText)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursor, newCursor)
    })
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          mb: 0.5,
          flexWrap: 'wrap',
        }}
      >
        {mode === 'write' &&
          TOOLS.map(([type, name, icon]) => (
            <Tooltip key={type} title={name}>
              <IconButton
                size="small"
                aria-label={name}
                onClick={() => applyTool(type)}
                sx={{
                  p: 0.4,
                  color: ff.inkSoft,
                  '& svg': { fontSize: '1rem' },
                  '&:hover': { color: ff.print },
                }}
              >
                {React.createElement(icon)}
              </IconButton>
            </Tooltip>
          ))}
        <Box sx={{ ml: 'auto' }}>
          <Segmented
            size="sm"
            ariaLabel="Writing mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'write', label: 'Write' },
              { value: 'read', label: 'Read back' },
            ]}
          />
        </Box>
      </Box>

      {mode === 'write' ? (
        <InputBase
          inputRef={inputRef}
          autoFocus={autoFocus}
          fullWidth
          multiline
          minRows={minRows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputProps={{ 'aria-label': label }}
          sx={{
            p: 0,
            alignItems: 'flex-start',
            '& textarea': {
              ...ruled(ff),
              backgroundAttachment: 'local',
              color: ff.ink,
              fontSize: '0.98rem',
              lineHeight: `${LINE}px`,
              p: 0,
              pl: 0.5,
            },
            '& textarea::placeholder': {
              fontStyle: 'italic',
              color: ff.inkSoft,
              opacity: 0.8,
            },
          }}
        />
      ) : (
        <Box
          onClick={() => setMode('write')}
          sx={{
            ...ruled(ff),
            ...inkMarkdown(ff),
            minHeight: minRows * LINE,
            pl: 0.5,
            cursor: 'text',
          }}
        >
          {value.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: (props) => (
                  <a {...props} onClick={(e) => openLink(e, props.href)} />
                ),
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <Box sx={{ fontStyle: 'italic', color: ff.inkSoft }}>
              Nothing written yet.
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default EntryField
