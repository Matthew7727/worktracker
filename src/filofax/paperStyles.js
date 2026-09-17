export { SERIF } from '../styles/filofaxTheme'

export const LINE = 30 // ruled line pitch in px

/** Faint horizontal rules, like a lined refill. */
export const ruled = (ff, pitch = LINE, offset = 0) => ({
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${pitch - 1}px, ${ff.rule} ${pitch - 1}px, ${ff.rule} ${pitch}px)`,
  backgroundPosition: `0 ${offset}px`,
})

/** Writing-ink markdown styles for rendered entries and notes. */
export const inkMarkdown = (ff) => ({
  color: ff.ink,
  fontSize: '0.98rem',
  lineHeight: `${LINE}px`,
  '& p': { m: 0 },
  '& p + p': { mt: `${LINE / 2}px` },
  '& ul, & ol': { my: 0, pl: 3 },
  '& h1, & h2, & h3, & h4': {
    fontSize: '1.02rem',
    fontWeight: 700,
    m: 0,
    lineHeight: `${LINE}px`,
  },
  '& strong': { fontWeight: 700 },
  '& a': { color: ff.print, textUnderlineOffset: '3px' },
  '& blockquote': {
    m: 0,
    pl: 1.5,
    borderLeft: `2px solid ${ff.ruleStrong}`,
    fontStyle: 'italic',
    color: ff.inkSoft,
  },
  '& code': {
    fontSize: '0.88em',
    bgcolor: ff.pageShade,
    px: 0.5,
    borderRadius: '2px',
  },
  '& pre': { whiteSpace: 'pre-wrap', m: 0 },
  '& hr': { border: 'none', borderTop: `1px solid ${ff.ruleStrong}`, my: 1 },
})

// Day-status colours read as coloured ink on paper rather than blocks.
export const statusInk = (ff, id) =>
  ({
    pto: '#3f7fb5',
    sick: '#b0463f',
    volunteering: '#7a55a8',
  })[id] || ff.print

export const openLink = (e, url) => {
  e.preventDefault()
  if (window.electronAPI?.openExternal) window.electronAPI.openExternal(url)
  else window.open(url, '_blank')
}
