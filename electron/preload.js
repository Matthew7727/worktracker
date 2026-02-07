const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
    readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path, content) => ipcRenderer.invoke('fs:writeFile', path, content),
    deleteFile: (path) => ipcRenderer.invoke('fs:deleteFile', path),
    listFiles: (path) => ipcRenderer.invoke('fs:listFiles', path),
    listAllFiles: (path) => ipcRenderer.invoke('fs:listAllFiles', path),
    searchEntries: (options) => ipcRenderer.invoke('fs:searchEntries', options),
    watchWorkspace: (path) => ipcRenderer.invoke('fs:watchWorkspace', path),
    onWorkspaceChanged: (callback) => ipcRenderer.on('workspace:changed', (event, data) => callback(data))
});
