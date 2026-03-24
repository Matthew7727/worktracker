const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
  writeFile: (path, content) =>
    ipcRenderer.invoke('fs:writeFile', path, content),
  deleteFile: (path) => ipcRenderer.invoke('fs:deleteFile', path),
  listFiles: (path) => ipcRenderer.invoke('fs:listFiles', path),
  listAllFiles: (path) => ipcRenderer.invoke('fs:listAllFiles', path),
  searchEntries: (options) => ipcRenderer.invoke('fs:searchEntries', options),
  watchWorkspace: (path) => ipcRenderer.invoke('fs:watchWorkspace', path),
  onWorkspaceChanged: (callback) =>
    ipcRenderer.on('workspace:changed', (event, data) => callback(data)),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  // Settings & Notifications
  loadSettings: () => ipcRenderer.invoke('settings:load'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  testNotification: () => ipcRenderer.invoke('notifications:test'),

  // App Data
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // Widget & Global Flow
  triggerGlobalStartFlow: () => ipcRenderer.invoke('widget:triggerStartFlow'),
  onStartFlowGlobal: (callback) => ipcRenderer.on('app:start-flow', callback),
  removeStartFlowGlobalListeners: () =>
    ipcRenderer.removeAllListeners('app:start-flow'),

  // Auto-Updater actions
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  quitAndInstall: () => ipcRenderer.invoke('update:quitAndInstall'),

  // Auto-Updater event listeners
  onUpdateChecking: (callback) => ipcRenderer.on('update:checking', callback),
  onUpdateAvailable: (callback) =>
    ipcRenderer.on('update:available', (event, info) => callback(info)),
  onUpdateNotAvailable: (callback) =>
    ipcRenderer.on('update:not-available', (event, info) => callback(info)),
  onUpdateDownloaded: (callback) =>
    ipcRenderer.on('update:downloaded', (event, info) => callback(info)),
  onUpdateError: (callback) =>
    ipcRenderer.on('update:error', (event, error) => callback(error)),
  onUpdateProgress: (callback) =>
    ipcRenderer.on('update:progress', (event, progress) => callback(progress)),

  // Cleanup listeners (critical for preventing duplicates on component re-mounts)
  removeAllUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update:checking')
    ipcRenderer.removeAllListeners('update:available')
    ipcRenderer.removeAllListeners('update:not-available')
    ipcRenderer.removeAllListeners('update:downloaded')
    ipcRenderer.removeAllListeners('update:error')
    ipcRenderer.removeAllListeners('update:progress')
  },
})
