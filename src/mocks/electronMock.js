/**
 * Mock Electron API for Browser Development
 * simulates the IPC bridge exposed by preload.js
 */

export const setupElectronMock = () => {
  if (window.electronAPI) return // Don't overwrite if actual Electron is present

  console.log('🔧 Initializing Electron Mock for Browser Development')

  const MOCK_ROOT = 'C:/Mock/WorkTracker'

  const fmt = (dateObj) => {
    const y = dateObj.getFullYear()
    const m = String(dateObj.getMonth() + 1).padStart(2, '0')
    const d = String(dateObj.getDate()).padStart(2, '0')
    return { year: y, month: m, dateStr: `${y}-${m}-${d}` }
  }

  // ─── Entry content bank ───────────────────────────────────────────────────

  const CW_ENTRIES = [
    `Kicked off discovery phase for the Hartwell rebranding project. Reviewed brand guidelines and held a 90-minute stakeholder workshop. Key themes: trustworthiness, modernity, accessibility. Action items captured and distributed.

## Notes
- Client wants refresh of the logo and full collateral set
- Timeline: 8 weeks to final delivery
- Budget approved for illustration work`,

    `Delivered phase-one wireframes to Acme Corp. Two rounds of feedback consolidated. Homepage hero, about section, and services page are locked. Moving into high-fidelity next sprint.

## Tasks
- [x] Wireframe review session
- [x] Consolidate feedback doc
- [ ] Begin hi-fi mockups`,

    `Deep work day on Globex dashboard redesign. Rebuilt the data table component to support sorting, filtering, and column pinning. Reviewed with lead dev — approved for build.

## Notes
- Used the new design system tokens throughout
- Accessibility audit passed for table component`,

    `Client call with Meridian Health at 10am. Presented three route options for the patient portal onboarding flow. Route B preferred — minimal steps, progressive disclosure. Will prototype this week.

## Tasks
- [x] Prepare three route options
- [x] Present to client
- [ ] Prototype Route B in Figma`,

    `Finalised the component library handoff for Bluerock SaaS. Documented 42 components with usage notes, accessibility annotations, and responsive behaviour. Sent via Zeroheight.

## Notes
- Includes dark mode variants for all components
- Dev team confirmed token import working`,

    `Strategy workshop with Nova Retail. Mapped full customer journey from ad click to post-purchase. Identified three major friction points in checkout. Recommended targeted UX improvements.

## Tasks
- [x] Journey mapping session
- [x] Friction point analysis
- [ ] Draft UX recommendations report`,

    `Completed responsive build review for Hartwell site. Tested across 12 breakpoints, 4 browsers. Fixed nav collapse bug on tablet. Handed off staging URL and review checklist to QA.`,

    `Working on illustration assets for Acme annual report. Completed 6 of 12 spot illustrations. Style is consistent with brand — clean line work, two-colour palette.

## Tasks
- [x] Spot illustrations 1–6
- [ ] Spot illustrations 7–12
- [ ] Export and package assets`,

    `Content audit for Meridian Health site. Reviewed 80 pages, flagged 23 for rewrite, 14 for removal. Produced prioritised content plan aligned with SEO goals.`,

    `Globex Q3 retrospective design review. Presented metrics on conversion improvements since redesign: +18% CTA click-through, -22% bounce on pricing page. Client very happy.`,

    `Ran a UX audit on the Bluerock onboarding flow. Heuristic evaluation across 10 Nielsen principles. Top issues: unclear error messaging, no progress indicator, inconsistent CTA labelling.

## Notes
- Severity 1: progress indicator missing
- Severity 2: error messages not actionable`,

    `Nova Retail email campaign assets delivered. 6 template variants, fully responsive, tested in Litmus across 28 clients. Assets packaged and uploaded to Dropbox.`,
  ]

  const PD_ENTRIES = [
    `Completed Module 4 of the AWS Solutions Architect course — IAM, VPCs, and security groups. Took detailed notes. Feeling more confident about the networking section.

## Progress
- IAM policies and roles ✓
- VPC architecture ✓
- Security groups vs NACLs ✓`,

    `Spent the morning on a TypeScript deep dive — conditional types and mapped types. These were clicking more slowly than generics did. Worked through four exercises on the TypeScript playground.

## Notes
- Conditional types: great for utility types
- Template literal types are surprisingly powerful`,

    `Read through "Shape Up" by Basecamp in one sitting. Really compelling framing of appetite vs estimate. Going to trial the six-week cycle concept with my own project planning.

## Takeaways
- Appetite > estimate framing
- Betting table concept is elegant
- Fat marker sketches for pitching ideas`,

    `Motion design practice session. Rebuilt a UI transition in After Effects — card flip, staggered list reveal, and a progress ring. Exported as Lottie for web use.`,

    `Finished the Figma Advanced course. Variables, component properties, and auto layout deep dive. Rebuilt the mock design system using variables — much cleaner token management.

## Tasks
- [x] Variables module
- [x] Component properties module
- [x] Rebuild design system with variables`,

    `Two hours on accessibility fundamentals. Read WCAG 2.2 criterion for focus management and keyboard navigation. Audited the Bluerock component library against these. Found 3 gaps.

## Notes
- Focus traps in modal components need work
- Skip links missing from main nav
- Colour contrast on disabled states borderline`,

    `Worked through Josh Comeau's CSS course — specifically the flexbox and grid modules. Rebuilt a responsive layout from scratch without any utility classes. Clean and satisfying.`,

    `System design practice. Drew out architecture for a hypothetical analytics dashboard — event ingestion, time-series storage, query layer, caching. Good mental workout.

## Diagram notes
- Kafka for ingestion
- ClickHouse for time-series
- Redis for query cache`,

    `Portfolio review and update session. Swapped out two older case studies, rewrote three project descriptions to focus on outcomes not outputs. Added the Nova Retail work.`,

    `Read "Obviously Awesome" by April Dunford. Strong framework for positioning. The competitive alternative and unique attributes sections were most useful. Will apply to BD materials.`,

    `JavaScript fundamentals refresher. Worked through closures, prototype chain, and the event loop. Drew diagrams for each. These are concepts I know but rarely articulate clearly.`,

    `Started learning basic data visualisation with D3.js. Got through scales, axes, and a simple bar chart. The mental model is different from React but starting to click.`,
  ]

  const BD_ENTRIES = [
    `Drafted the new service offering one-pager for UX audit engagements. Positioned around risk reduction and time-to-launch. Three tiers: Lite, Standard, Comprehensive.

## Tasks
- [x] Draft one-pager
- [ ] Design layout
- [ ] Get feedback from two trusted contacts`,

    `Wrote a LinkedIn article on the ROI of design systems. Hit publish. Engagement in the first few hours is solid — 3 reposts from well-connected contacts.

## Notes
- Article: "Why your design system is your best hire"
- 400 words, practical angle, no fluff`,

    `Exploratory call with a referred prospect — a Series A fintech startup needing a design partner for their investor-facing dashboard. Good fit. Sent a follow-up with credentials and a process overview.

## Next steps
- [ ] Send proposal by Friday
- [ ] Include relevant fintech case study`,

    `Worked on the pitch deck for the Meridian Health expansion proposal. Slides 1–8 complete. Focusing on outcomes, case studies, and investment ROI rather than deliverables.`,

    `Reviewed and updated pricing. Raised day rate by 8% in line with market research. Updated the proposal template and the website services page accordingly.`,

    `Attended a local design + tech meetup. Good conversations with two founders. Exchanged details with a product lead at a mid-size e-commerce company — potential fit for a retainer.`,

    `Wrote three cold outreach messages for warm referral follow-ups. Personalised, concise, clear CTA. Scheduled to send Tuesday morning when open rates are highest.`,

    `Quarterly business review. Revenue on track vs target. Pipeline has three active opportunities worth ~£42k. Conversion rate holding at 35%. Identified gap in mid-market outreach.

## Numbers
- Invoiced: on target
- Pipeline value: ~£42k
- Conversion rate: 35%`,

    `Worked on a case study writeup for the Globex project. Structured around problem, process, outcome. Added metrics section — conversion uplift, bounce reduction data.`,

    `Referral thank-you process. Sent handwritten notes and small gifts to two clients who referred work this quarter. Relationship maintenance is worth the time.`,

    `Researched two potential conference speaking opportunities. Submitted a talk abstract on "Designing for trust in healthcare UX" — topic aligned to recent client work.`,

    `Brand voice and positioning review. Refined the one-line descriptor and elevator pitch. Tested three versions on five trusted contacts. "Clarity-first design" resonated best.`,
  ]

  // ─── Generate entries for ~3 months back ──────────────────────────────────

  const today = new Date()
  const mockFiles = {}

  // Pick roughly every 2-3 days over 90 days, skipping some weekends
  const entryOffsets = [
    0, 1, 3, 5, 7, 8, 10, 12, 14, 16, 17, 19, 21, 23, 24, 26, 28, 30, 32, 33,
    35, 37, 39, 41, 42, 44, 46, 48, 50, 51, 53, 55, 57, 59, 60, 62, 64, 66, 68,
    69, 71, 73, 75, 77, 78, 80, 82, 84, 86, 87, 89,
  ]

  const tags = [
    ['client', 'design'],
    ['client', 'strategy'],
    ['dev', 'learning'],
    ['learning', 'reading'],
    ['bd', 'outreach'],
    ['client', 'delivery'],
    ['pd', 'practice'],
    ['bd', 'planning'],
  ]

  entryOffsets.forEach((offset, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const { year, month, dateStr } = fmt(date)

    const cw = CW_ENTRIES[i % CW_ENTRIES.length]
    const pd = PD_ENTRIES[i % PD_ENTRIES.length]
    const bd = BD_ENTRIES[i % BD_ENTRIES.length]
    const tag = tags[i % tags.length]

    const content = `---
tags: [${tag.join(', ')}]
---
# Client Work

${cw}

# Practice Development

${pd}

# Business Development

${bd}
`
    mockFiles[`${MOCK_ROOT}/${year}/${month}/${dateStr}.md`] = content
  })

  // ─── Projects & Activities ────────────────────────────────────────────────

  const todayParts = fmt(today)

  mockFiles[`${MOCK_ROOT}/projects.json`] = JSON.stringify(
    {
      activities: [
        {
          id: 'mock-activity-1',
          type: 'PD',
          title: 'Get AWS Solutions Architect Certified',
          tasks: [
            {
              id: 'task-1',
              text: 'Complete Cloud Practitioner course',
              completed: true,
            },
            { id: 'task-2', text: 'Purchase exam voucher', completed: false },
            { id: 'task-3', text: 'Book exam date', completed: false },
          ],
          status: 'active',
          completedAt: null,
          createdAt: todayParts.dateStr,
        },
        {
          id: 'mock-activity-2',
          type: 'BD',
          title: 'Build standard pitch deck',
          tasks: [
            { id: 'task-4', text: 'Gather case studies', completed: true },
            { id: 'task-5', text: 'Draft slides 1-5', completed: false },
          ],
          status: 'active',
          completedAt: null,
          createdAt: todayParts.dateStr,
        },
        {
          id: 'mock-activity-3',
          type: 'PD',
          title: 'Complete TypeScript deep dive',
          tasks: [
            { id: 'task-6', text: 'Finish generics module', completed: true },
            { id: 'task-7', text: 'Build capstone project', completed: true },
          ],
          status: 'archived',
          completedAt: todayParts.dateStr,
          createdAt: todayParts.dateStr,
        },
      ],
      clientProjects: [
        {
          id: 'mock-project-1',
          title: 'Acme Corp Audit',
          status: 'active',
          createdAt: todayParts.dateStr,
          completedAt: null,
        },
        {
          id: 'mock-project-2',
          title: 'Globex Strategy Review',
          status: 'done',
          createdAt: todayParts.dateStr,
          completedAt: todayParts.dateStr,
        },
      ],
    },
    null,
    2
  )

  // ─── In-memory settings store ─────────────────────────────────────────────

  let mockSettings = {
    notificationsEnabled: false,
    notificationTime: '17:00',
    utilisationTarget: 70,
    selectedDirectory: MOCK_ROOT,
  }

  // ─── Electron API ─────────────────────────────────────────────────────────

  window.electronAPI = {
    isMock: true,

    _listeners: {},
    _on: (event, callback) => {
      if (!window.electronAPI._listeners[event])
        window.electronAPI._listeners[event] = []
      window.electronAPI._listeners[event].push(callback)
    },
    _emit: (event, ...args) => {
      if (window.electronAPI._listeners[event]) {
        window.electronAPI._listeners[event].forEach((cb) => cb(...args))
      }
    },

    onUpdateChecking: (cb) => window.electronAPI._on('checking', cb),
    onUpdateAvailable: (cb) => window.electronAPI._on('available', cb),
    onUpdateNotAvailable: (cb) => window.electronAPI._on('not-available', cb),
    onUpdateProgress: (cb) => window.electronAPI._on('progress', cb),
    onUpdateDownloaded: (cb) => window.electronAPI._on('downloaded', cb),
    onUpdateError: (cb) => window.electronAPI._on('error', cb),
    removeAllUpdateListeners: () => {
      window.electronAPI._listeners = {}
    },
    checkForUpdates: async () => ({ status: 'dev' }),
    quitAndInstall: () => console.log('[Mock] quitAndInstall called'),
    getVersion: async () => __APP_VERSION__,

    testNotification: async () => {
      console.log('[Mock] testNotification called')
      if (Notification.permission === 'granted') {
        new Notification('Work Tracker (Mock)', {
          body: 'This is a test notification from dev mode!',
        })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('Work Tracker (Mock)', {
              body: 'This is a test notification from dev mode!',
            })
          }
        })
      } else {
        alert('Test Notification: Permissions denied. Check console.')
      }
    },

    devSimulateUpdate: () => {
      console.log('[Mock] Simulating App Update...')
      window.electronAPI._emit('checking')
      setTimeout(() => {
        window.electronAPI._emit('available')
        let progress = 0
        const interval = setInterval(() => {
          progress += 10
          window.electronAPI._emit('progress', progress)
          if (progress >= 100) {
            clearInterval(interval)
            setTimeout(() => window.electronAPI._emit('downloaded'), 500)
          }
        }, 300)
      }, 1000)
    },

    loadSettings: async () => {
      console.log('[Mock] loadSettings called')
      return { ...mockSettings }
    },

    saveSettings: async (settings) => {
      console.log('[Mock] saveSettings called', settings)
      mockSettings = { ...mockSettings, ...settings }
      return { success: true }
    },

    selectDirectory: async () => {
      console.log('[Mock] selectDirectory called')
      return MOCK_ROOT
    },

    listAllFiles: async (path) => {
      console.log(`[Mock] listAllFiles called for ${path}`)
      return { success: true, files: Object.keys(mockFiles) }
    },

    readFile: async (path) => {
      console.log(`[Mock] readFile called for ${path}`)
      const normalizedPath = path.replace(/\\/g, '/')
      if (mockFiles[normalizedPath]) {
        return { success: true, data: mockFiles[normalizedPath] }
      }
      const key = Object.keys(mockFiles).find(
        (k) => k.toLowerCase() === normalizedPath.toLowerCase()
      )
      if (key) return { success: true, data: mockFiles[key] }
      console.warn(`[Mock] File not found: ${path}`)
      return { success: false, error: 'File not found in mock' }
    },

    writeFile: async (path, content) => {
      console.log(`[Mock] writeFile called for ${path}`)
      const normalizedPath = path.replace(/\\/g, '/')
      mockFiles[normalizedPath] = content
      return { success: true }
    },

    watchWorkspace: async (path) => {
      console.log(`[Mock] watchWorkspace called for ${path}`)
      return { success: true }
    },

    onWorkspaceChanged: () => {
      console.log(`[Mock] onWorkspaceChanged listener registered`)
    },

    openExternal: async (url) => {
      console.log(`[Mock] openExternal called for ${url}`)
      window.open(url, '_blank')
    },
  }
}
