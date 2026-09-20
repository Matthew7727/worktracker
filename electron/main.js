import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  Notification,
  Tray,
  nativeImage,
} from 'electron'
import electronUpdater from 'electron-updater'
const { autoUpdater } = electronUpdater
import log from 'electron-log'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import chokidar from 'chokidar'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure logging
log.transports.file.level = 'info'
autoUpdater.logger = log

// Settings Management
const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json')
const approvedExportPaths = new Set()

const isInside = (root, target) => {
  if (!root || !target) return false
  const relative = path.relative(path.resolve(root), path.resolve(target))
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  )
}

async function isWorkspacePath(target) {
  const settings = await loadSettings()
  return isInside(settings.selectedDirectory, target)
}

async function loadSettings() {
  try {
    const data = await fs.readFile(SETTINGS_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (_error) {
    console.log(_error)
    return {
      notificationsEnabled: false,
      notificationTime: '17:00', // Default to 5 PM
      selectedDirectory: null,
    }
  }
}

async function saveSettings(settings) {
  try {
    await fs.writeFile(
      SETTINGS_PATH,
      JSON.stringify(settings, null, 2),
      'utf-8'
    )
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Notification Engine
let notificationInterval = null

function triggerNotification() {
  if (Notification.isSupported()) {
    const notif = new Notification({
      title: 'Work Tracker',
      body: 'Time to log your day! What did you achieve in Client Work, PD, and BD today?',
      icon: path.join(__dirname, '../build/icon.png'),
      silent: false,
    })

    notif.show()

    notif.on('click', () => {
      performStartFlow()
    })
  }
}

async function updateNotificationSchedule() {
  if (notificationInterval) {
    clearInterval(notificationInterval)
    notificationInterval = null
  }

  const settings = await loadSettings()
  if (!settings.notificationsEnabled) return

  const [hours, minutes] = settings.notificationTime.split(':').map(Number)
  log.info(`Scheduling notification for ${hours}:${minutes}`)

  // Check every minute
  notificationInterval = setInterval(() => {
    const now = new Date()
    if (now.getHours() === hours && now.getMinutes() === minutes) {
      triggerNotification()
    }
  }, 60000) // 1 minute
}

// Auto-updater
// Updates are user-driven: check, tell the renderer, and only download or
// install when the user asks. All events flow over the single 'update:event'
// channel to the main window only (never the tray widget window).
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

let mainWindow = null

function sendUpdateEvent(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:event', payload)
  }
}

autoUpdater.on('checking-for-update', () => {
  sendUpdateEvent({ status: 'checking' })
})
autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version)
  sendUpdateEvent({
    status: 'available',
    version: info.version,
    releaseDate: info.releaseDate,
    releaseNotes:
      typeof info.releaseNotes === 'string' ? info.releaseNotes : null,
  })
})
autoUpdater.on('update-not-available', () => {
  sendUpdateEvent({ status: 'not-available' })
})
autoUpdater.on('download-progress', (progress) => {
  sendUpdateEvent({
    status: 'downloading',
    percent: progress.percent,
    bytesPerSecond: progress.bytesPerSecond,
    transferred: progress.transferred,
    total: progress.total,
  })
})
autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info.version)
  sendUpdateEvent({ status: 'downloaded', version: info.version })
})
autoUpdater.on('error', (err) => {
  log.error('Auto-updater error:', err)
  sendUpdateEvent({
    status: 'error',
    message: err?.message || 'Unknown update error',
  })
})

const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000 // 4 hours

function scheduleUpdateChecks() {
  if (!app.isPackaged) return
  // Rejections also surface via the 'error' event; the renderer decides
  // whether a failed background check is worth showing.
  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 10000)
  setInterval(
    () => autoUpdater.checkForUpdates().catch(() => {}),
    UPDATE_CHECK_INTERVAL
  )
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  if (canceled) {
    return
  } else {
    const settings = await loadSettings()
    await saveSettings({ ...settings, selectedDirectory: filePaths[0] })
    return filePaths[0]
  }
}

async function handleSaveDialog(event, options) {
  const { canceled, filePath } = await dialog.showSaveDialog(options)
  if (canceled) {
    return { canceled: true }
  } else {
    approvedExportPaths.add(path.resolve(filePath))
    return { canceled: false, filePath }
  }
}

async function handleReadFile(event, filePath) {
  try {
    if (!(await isWorkspacePath(filePath))) {
      return { success: false, error: 'Path is outside the active workspace' }
    }
    const data = await fs.readFile(filePath, 'utf-8')
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function handleWriteFile(event, filePath, content) {
  try {
    const resolved = path.resolve(filePath)
    if (
      !(await isWorkspacePath(resolved)) &&
      !approvedExportPaths.has(resolved)
    ) {
      return { success: false, error: 'Path is outside the active workspace' }
    }
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function handleDeleteFile(event, filePath) {
  try {
    if (!(await isWorkspacePath(filePath))) {
      return { success: false, error: 'Path is outside the active workspace' }
    }
    await fs.unlink(filePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function handleListFiles(event, dirPath) {
  try {
    if (!(await isWorkspacePath(dirPath))) {
      return { success: false, error: 'Path is outside the active workspace' }
    }
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    // Return structured file info
    return {
      success: true,
      files: files.map((dirent) => ({
        name: dirent.name,
        isDirectory: dirent.isDirectory(),
        path: path.join(dirPath, dirent.name),
      })),
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Recursive function to get all markdown files
async function getMarkdownFiles(dir) {
  let results = []
  try {
    const list = await fs.readdir(dir, { withFileTypes: true })
    for (const dirent of list) {
      const res = path.join(dir, dirent.name)
      if (dirent.isDirectory()) {
        results = results.concat(await getMarkdownFiles(res))
      } else if (res.endsWith('.md')) {
        results.push(res)
      }
    }
  } catch (err) {
    console.log(err)
  }
  return results
}

async function handleListAllFiles(event, dirPath) {
  try {
    if (!(await isWorkspacePath(dirPath))) {
      return { success: false, error: 'Path is outside the active workspace' }
    }
    const files = await getMarkdownFiles(dirPath)
    return { success: true, files }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

let watcher = null

async function handleWatchWorkspace(event, rootDir) {
  if (watcher) {
    await watcher.close()
  }

  if (!rootDir || !(await isWorkspacePath(rootDir))) return

  watcher = chokidar.watch(rootDir, {
    ignored: /(^|[/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  })

  watcher.on('all', (event, path) => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      mainWindow.webContents.send('workspace:changed', { event, path })
    }
  })

  return { success: true }
}

async function handleSearchEntries(event, { rootDir, query }) {
  if (!rootDir || !query) return { success: false, results: [] }
  if (!(await isWorkspacePath(rootDir))) {
    return { success: false, results: [] }
  }

  try {
    const files = await getMarkdownFiles(rootDir)
    const results = []
    const lowerQuery = query.toLowerCase()

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8')
      if (content.toLowerCase().includes(lowerQuery)) {
        // Extract a snippet
        const lines = content.split('\n')
        const matchedLine = lines.find((l) =>
          l.toLowerCase().includes(lowerQuery)
        )
        const fileName = path.basename(file, '.md')
        const dailyMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})(?:_\d{6})?$/)
        const normalized = file.split(path.sep).join('/')
        // Search can legitimately find notes as well as daily logs. Return a
        // resource-aware target rather than pretending every Markdown filename
        // is a date.
        const kind = dailyMatch
          ? fileName.includes('_')
            ? 'timed-entry'
            : 'entry'
          : normalized.includes('/notes/')
            ? 'note'
            : 'file'

        // Only surface resources the UI can open directly. Other workspace
        // Markdown is deliberately left to the file system, not a dead-end
        // search result.
        if (kind === 'file') continue

        results.push({
          file,
          fileName,
          snippet: matchedLine
            ? matchedLine.trim()
            : 'Match in frontmatter or content',
          kind,
          date: dailyMatch?.[1] || null,
        })
      }
    }
    return { success: true, results }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    title: 'Work-Tracker',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const isDev = !app.isPackaged

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

let tray = null
let widgetWindow = null

function createWidgetWindow() {
  widgetWindow = new BrowserWindow({
    width: 372,
    height: 432,
    show: false,
    frame: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const isDev = !app.isPackaged
  if (isDev) {
    widgetWindow.loadURL('http://localhost:5173/#/widget')
  } else {
    widgetWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'widget',
    })
  }

  widgetWindow.on('blur', () => {
    widgetWindow.hide()
  })
}

function createTray() {
  // A small template image lets macOS apply the correct menu-bar colour in
  // both light and dark appearances. Keep it deliberately simple: a tick in
  // a capture tray reads at 18px without looking like an app logo.
  const traySvg = `
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#000" d="M3 2.25h12A.75.75 0 0 1 15.75 3v12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75V3A.75.75 0 0 1 3 2.25Zm.75 1.5v10.5h10.5V3.75H3.75Z"/>
      <path fill="#000" d="m5.3 8.85 2.05 2.05 5.35-5.35 1.06 1.06-6.41 6.41-3.11-3.11L5.3 8.85Z"/>
    </svg>`
  const icon = nativeImage.createFromDataURL(
    `data:image/svg+xml;base64,${Buffer.from(traySvg).toString('base64')}`
  )
  icon.setTemplateImage(true)

  tray = new Tray(icon)
  tray.setToolTip('Work Tracker — quick capture')

  tray.on('click', (event, bounds) => {
    const { x } = bounds
    const { height, width } = widgetWindow.getBounds()

    if (widgetWindow.isVisible()) {
      widgetWindow.hide()
    } else {
      // Position it exactly underneath the menu bar (bounds.y + bounds.height gives the bottom of the tray icon)
      const yPosition =
        process.platform === 'darwin'
          ? bounds.y + bounds.height + 2
          : bounds.y - height
      const xPosition = Math.round(x - width / 2 + bounds.width / 2)
      widgetWindow.setPosition(xPosition, yPosition, false)
      widgetWindow.show()
      widgetWindow.focus()
    }
  })
}

// Shared Start Flow functionality
function performStartFlow() {
  if (widgetWindow) widgetWindow.hide()
  const mainWins = BrowserWindow.getAllWindows().filter(
    (w) => w !== widgetWindow
  )
  if (mainWins.length > 0) {
    const mainWin = mainWins[0]
    if (mainWin.isMinimized()) mainWin.restore()
    mainWin.show()
    mainWin.focus()
    mainWin.webContents.send('app:start-flow')
  } else {
    createWindow()
    setTimeout(() => {
      const wins = BrowserWindow.getAllWindows().filter(
        (w) => w !== widgetWindow
      )
      if (wins.length > 0) wins[0].webContents.send('app:start-flow')
    }, 1500)
  }
}

app.whenReady().then(async () => {
  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('dialog:openDirectory', handleFileOpen)
  ipcMain.handle('dialog:saveFile', handleSaveDialog)
  ipcMain.handle('fs:readFile', handleReadFile)
  ipcMain.handle('fs:writeFile', handleWriteFile)
  ipcMain.handle('fs:deleteFile', handleDeleteFile)
  ipcMain.handle('fs:listFiles', handleListFiles)
  ipcMain.handle('fs:listAllFiles', handleListAllFiles)
  ipcMain.handle('fs:searchEntries', handleSearchEntries)
  ipcMain.handle('fs:watchWorkspace', handleWatchWorkspace)
  ipcMain.handle('shell:openExternal', (event, url) => {
    try {
      const parsed = new URL(url)
      if (!['https:', 'http:', 'mailto:'].includes(parsed.protocol)) {
        return { success: false, error: 'Unsupported URL protocol' }
      }
      shell.openExternal(parsed.toString())
      return { success: true }
    } catch {
      return { success: false, error: 'Invalid URL' }
    }
  })

  // Settings & Notifications IPC
  ipcMain.handle('settings:load', () => loadSettings())
  ipcMain.handle('settings:save', async (event, settings) => {
    const result = await saveSettings(settings)
    if (result.success) {
      updateNotificationSchedule()
    }
    return result
  })
  ipcMain.handle('notifications:test', () => {
    triggerNotification()
    return { success: true }
  })

  // Auto-update IPC
  ipcMain.handle('update:check', async () => {
    if (!app.isPackaged) return { status: 'dev' }
    try {
      await autoUpdater.checkForUpdates()
      return { status: 'ok' }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  })

  ipcMain.handle('update:download', async () => {
    try {
      await autoUpdater.downloadUpdate()
      return { status: 'ok' }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  })

  ipcMain.handle('update:install', () => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })

  // Widget IPC
  ipcMain.handle('widget:triggerStartFlow', () => {
    performStartFlow()
  })
  ipcMain.handle('widget:openRoute', (event, route) => {
    if (widgetWindow) widgetWindow.hide()
    const mainWins = BrowserWindow.getAllWindows().filter(
      (window) => window !== widgetWindow
    )
    if (mainWins.length > 0) {
      const mainWin = mainWins[0]
      if (mainWin.isMinimized()) mainWin.restore()
      mainWin.show()
      mainWin.focus()
      mainWin.webContents.send('app:navigate', route)
    } else {
      createWindow()
      setTimeout(() => {
        mainWindow?.webContents.send('app:navigate', route)
      }, 1500)
    }
  })

  createWindow()
  createWidgetWindow()
  createTray()
  updateNotificationSchedule()
  scheduleUpdateChecks()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
