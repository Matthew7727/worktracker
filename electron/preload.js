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

  // Auto-update
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdateEvent: (callback) =>
    ipcRenderer.on('update:event', (event, payload) => callback(payload)),
  removeUpdateListeners: () => ipcRenderer.removeAllListeners('update:event'),
})
