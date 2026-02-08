import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Handlers
import {
    handleFileOpen,
    handleSaveDialog,
    handleReadFile,
    handleWriteFile,
    handleDeleteFile,
    handleListFiles,
    handleListAllFiles,
    handleSearchEntries
} from './ipc/filesystem.js';
import { handleWatchWorkspace } from './ipc/watcher.js';
import { setupUpdater } from './ipc/updater.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1300,
        height: 900,
        title: "Work-Tracker",
        icon: path.join(__dirname, '../build/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // In development, load from Vite dev server
    // In production, load from the dist folder
    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    // Register File System Handlers
    ipcMain.handle('dialog:openDirectory', handleFileOpen);
    ipcMain.handle('dialog:saveFile', handleSaveDialog);
    ipcMain.handle('fs:readFile', handleReadFile);
    ipcMain.handle('fs:writeFile', handleWriteFile);
    ipcMain.handle('fs:deleteFile', handleDeleteFile);
    ipcMain.handle('fs:listFiles', handleListFiles);
    ipcMain.handle('fs:listAllFiles', handleListAllFiles);
    ipcMain.handle('fs:searchEntries', handleSearchEntries);

    // Register Watcher Handler
    ipcMain.handle('fs:watchWorkspace', handleWatchWorkspace);

    // Register Shell Handler
    ipcMain.handle('shell:openExternal', (event, url) => shell.openExternal(url));

    createWindow();

    // Setup Auto-Updater
    setupUpdater();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
