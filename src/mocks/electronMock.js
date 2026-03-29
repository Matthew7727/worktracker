/**
 * Mock Electron API for Browser Development
 * simulates the IPC bridge exposed by preload.js
 */

export const setupElectronMock = () => {
  if (window.electronAPI) return // Don't overwrite if actual Electron is present

  console.log('🔧 Initializing Electron Mock for Browser Development')

  // Use forward slashes for cross-platform consistency in JS
  const MOCK_ROOT = 'C:/Mock/WorkTracker'

  // Helper to format date parts
  const formatDatePath = (dateObj) => {
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    return { year, month, dateStr }
  }

  // Generate some fake file data
  const today = new Date()
  const yesterday = new Date(Date.now() - 86400000)

  const todayParts = formatDatePath(today)
  const yesterdayParts = formatDatePath(yesterday)

  const mockFiles = {
    // Journal Entry - Today
    [`${MOCK_ROOT}/${todayParts.year}/${todayParts.month}/${todayParts.dateStr}.md`]: `---
tags: [dev, planning]
---
# Daily Log ${todayParts.dateStr}

Starting work on the **dashboard refactor**. 
Things are looking good.

## Tasks
- [x] Create mock
- [ ] Test in browser
`,
    // Journal Entry - Yesterday
    [`${MOCK_ROOT}/${yesterdayParts.year}/${yesterdayParts.month}/${yesterdayParts.dateStr}.md`]: `---
tags: [meeting]
---
# Daily Log ${yesterdayParts.dateStr}

Had a sync with the team.
`,
    // Todos - Today
    [`${MOCK_ROOT}/${todayParts.year}/${todayParts.month}/${todayParts.dateStr}-todos.md`]: `# To Do
- [ ] Finish the mock implementation
- [ ] Verify browser load

# In Progress
- [x] Analyze requirements

# Done
- [x] Create plan
`,
    // Todos - Yesterday
    [`${MOCK_ROOT}/${yesterdayParts.year}/${yesterdayParts.month}/${yesterdayParts.dateStr}-todos.md`]: `# To Do
- [x] Create plan
`,
    // Projects & Activities
    [`${MOCK_ROOT}/projects.json`]: JSON.stringify(
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
            completedAt: yesterdayParts.dateStr,
            createdAt: yesterdayParts.dateStr,
          },
        ],
        clientProjects: [
          {
            id: 'mock-project-1',
            title: 'Acme Corp Audit',
            status: 'active',
            createdAt: yesterdayParts.dateStr,
            completedAt: null,
          },
          {
            id: 'mock-project-2',
            title: 'Globex Strategy Review',
            status: 'done',
            createdAt: yesterdayParts.dateStr,
            completedAt: todayParts.dateStr,
          },
        ],
      },
      null,
      2
    ),
  }

  window.electronAPI = {
    isMock: true,

    // Mock Event Emitter for Updates
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

    // Update Pub/Sub Mocks
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
    getVersion: async () => '1.0.0-mock',

    // Dev Tools Helpers
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

    selectDirectory: async () => {
      console.log('[Mock] selectDirectory called')
      return MOCK_ROOT
    },

    listAllFiles: async (path) => {
      console.log(`[Mock] listAllFiles called for ${path}`)
      return {
        success: true,
        files: Object.keys(mockFiles),
      }
    },

    readFile: async (path) => {
      console.log(`[Mock] readFile called for ${path}`)
      // Normalize path for comparison (handle mixing of backslashes from potential OS interactions)
      const normalizedPath = path.replace(/\\/g, '/')

      // Try explicit match first
      if (mockFiles[normalizedPath]) {
        return { success: true, data: mockFiles[normalizedPath] }
      }

      // Loose match (case insensitive or slight variation)
      const key = Object.keys(mockFiles).find(
        (k) => k.toLowerCase() === normalizedPath.toLowerCase()
      )
      if (key) {
        return { success: true, data: mockFiles[key] }
      }

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
      // We could simulate changes here if needed, e.g. with setTimeout
    },

    openExternal: async (url) => {
      console.log(`[Mock] openExternal called for ${url}`)
      window.open(url, '_blank')
    },
  }
}
