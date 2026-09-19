export const SECTIONS = [
  { id: 'diary', label: 'Diary', path: '/', match: ['/', '/editor'] },
  { id: 'todo', label: 'To do', path: '/todos', match: ['/todos'] },
  { id: 'notes', label: 'Notes', path: '/notes', match: ['/notes'] },
  { id: 'goals', label: 'Goals', path: '/goals', match: ['/goals'] },
  { id: 'planner', label: 'Planner', path: '/planner', match: ['/planner'] },
  {
    id: 'contacts',
    label: 'Contacts',
    path: '/contacts',
    match: ['/contacts'],
  },
  { id: 'index', label: 'Index', path: '/index', match: ['/index'] },
  { id: 'info', label: 'Info', path: '/info', match: ['/info'] },
]

export const sectionFor = (pathname) =>
  SECTIONS.find((s) =>
    s.match.some((m) =>
      m === '/' ? pathname === '/' : pathname === m || pathname.startsWith(m)
    )
  ) || SECTIONS[0]
