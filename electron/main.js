import { app, BrowserWindow, ipcMain, dialog, shell, Notification, Tray, nativeImage } from 'electron';
import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;
import log from 'electron-log';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Settings Management
const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');

async function loadSettings() {
    try {
        const data = await fs.readFile(SETTINGS_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {
            notificationsEnabled: false,
            notificationTime: '17:00', // Default to 5 PM
            selectedDirectory: null
        };
    }
}

async function saveSettings(settings) {
    try {
        await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Notification Engine
let notificationInterval = null;

function triggerNotification() {
    if (Notification.isSupported()) {
        const notif = new Notification({
            title: 'Work Tracker',
            body: 'Time to log your day! What did you achieve in Client Work, PD, and BD today?',
            icon: path.join(__dirname, '../build/icon.png'),
            silent: false
        });

        notif.show();
        
        notif.on('click', () => {
            performStartFlow();
        });
    }
}

async function updateNotificationSchedule() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }

    const settings = await loadSettings();
    if (!settings.notificationsEnabled) return;

    const [hours, minutes] = settings.notificationTime.split(':').map(Number);
    log.info(`Scheduling notification for ${hours}:${minutes}`);

    // Check every minute
    notificationInterval = setInterval(() => {
        const now = new Date();
        if (now.getHours() === hours && now.getMinutes() === minutes) {
            triggerNotification();
        }
    }, 60000); // 1 minute
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) mainWindow.webContents.send('update:checking');
});
autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) mainWindow.webContents.send('update:available', info);
});
autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) mainWindow.webContents.send('update:not-available', info);
});
autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater:', err);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) mainWindow.webContents.send('update:error', err.message);
});
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    log.info(log_message);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) mainWindow.webContents.send('update:progress', progressObj.percent);
});
autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) mainWindow.webContents.send('update:downloaded', info);
});

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled) {
        return;
    } else {
        return filePaths[0];
    }
}

async function handleSaveDialog(event, options) {
    const { canceled, filePath } = await dialog.showSaveDialog(options);
    if (canceled) {
        return { canceled: true };
    } else {
        return { canceled: false, filePath };
    }
}

async function handleReadFile(event, filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function handleWriteFile(event, filePath, content) {
    try {
        // Ensure directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function handleDeleteFile(event, filePath) {
    try {
        await fs.unlink(filePath);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function handleListFiles(event, dirPath) {
    try {
        const files = await fs.readdir(dirPath, { withFileTypes: true });
        // Return structured file info
        return {
            success: true,
            files: files.map(dirent => ({
                name: dirent.name,
                isDirectory: dirent.isDirectory(),
                path: path.join(dirPath, dirent.name)
            }))
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Recursive function to get all markdown files
async function getMarkdownFiles(dir) {
    let results = [];
    try {
        const list = await fs.readdir(dir, { withFileTypes: true });
        for (const dirent of list) {
            const res = path.join(dir, dirent.name);
            if (dirent.isDirectory()) {
                results = results.concat(await getMarkdownFiles(res));
            } else if (res.endsWith('.md')) {
                results.push(res);
            }
        }
    } catch (err) {
        // Ignore errors for now or log them
    }
    return results;
}

async function handleListAllFiles(event, dirPath) {
    try {
        const files = await getMarkdownFiles(dirPath);
        return { success: true, files };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

let watcher = null;

async function handleWatchWorkspace(event, rootDir) {
    if (watcher) {
        await watcher.close();
    }

    if (!rootDir) return;

    watcher = chokidar.watch(rootDir, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true
    });

    watcher.on('all', (event, path) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('workspace:changed', { event, path });
        }
    });

    return { success: true };
}

async function handleSearchEntries(event, { rootDir, query }) {
    if (!rootDir || !query) return { success: false, results: [] };

    try {
        const files = await getMarkdownFiles(rootDir);
        const results = [];
        const lowerQuery = query.toLowerCase();

        for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.toLowerCase().includes(lowerQuery)) {
                // Extract a snippet
                const lines = content.split('\n');
                const matchedLine = lines.find(l => l.toLowerCase().includes(lowerQuery));
                const fileName = path.basename(file, '.md');

                results.push({
                    file,
                    fileName,
                    snippet: matchedLine ? matchedLine.trim() : 'Match in frontmatter or content',
                    date: fileName.split('_')[0] // Correctly extract YYYY-MM-DD
                });
            }
        }
        return { success: true, results };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

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

    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

let tray = null;
let widgetWindow = null;

function createWidgetWindow() {
    widgetWindow = new BrowserWindow({
        width: 380,
        height: 86,
        show: false,
        frame: false,
        resizable: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    const isDev = !app.isPackaged;
    if (isDev) {
        widgetWindow.loadURL('http://localhost:5173/#/widget');
    } else {
        widgetWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'widget' });
    }

    widgetWindow.on('blur', () => {
        widgetWindow.hide();
    });
}

function createTray() {
    // Use an empty image to satisfy the Tray constructor, and rely on the emoji for the visual!
    const icon = nativeImage.createEmpty();

    tray = new Tray(icon);
    tray.setTitle('✅');
    tray.setToolTip('Work Tracker Widget');

    tray.on('click', (event, bounds) => {
        const { x, y } = bounds;
        const { height, width } = widgetWindow.getBounds();
        
        if (widgetWindow.isVisible()) {
            widgetWindow.hide();
        } else {
            // Position it exactly underneath the menu bar (bounds.y + bounds.height gives the bottom of the tray icon)
            const yPosition = process.platform === 'darwin' ? bounds.y + bounds.height + 2 : bounds.y - height;
            const xPosition = Math.round(x - (width / 2) + (bounds.width / 2));
            widgetWindow.setPosition(xPosition, yPosition, false);
            widgetWindow.show();
            widgetWindow.focus();
        }
    });
}

// Shared Start Flow functionality
function performStartFlow() {
    if (widgetWindow) widgetWindow.hide();
    const mainWins = BrowserWindow.getAllWindows().filter(w => w !== widgetWindow);
    if (mainWins.length > 0) {
        const mainWin = mainWins[0];
        if (mainWin.isMinimized()) mainWin.restore();
        mainWin.show();
        mainWin.focus();
        mainWin.webContents.send('app:start-flow');
    } else {
        createWindow();
        setTimeout(() => {
            const wins = BrowserWindow.getAllWindows().filter(w => w !== widgetWindow);
            if (wins.length > 0) wins[0].webContents.send('app:start-flow');
        }, 1500);
    }
}

app.whenReady().then(async () => {
    ipcMain.handle('app:getVersion', () => app.getVersion());
    ipcMain.handle('dialog:openDirectory', handleFileOpen);
    ipcMain.handle('dialog:saveFile', handleSaveDialog);
    ipcMain.handle('fs:readFile', handleReadFile);
    ipcMain.handle('fs:writeFile', handleWriteFile);
    ipcMain.handle('fs:deleteFile', handleDeleteFile);
    ipcMain.handle('fs:listFiles', handleListFiles);
    ipcMain.handle('fs:listAllFiles', handleListAllFiles);
    ipcMain.handle('fs:searchEntries', handleSearchEntries);
    ipcMain.handle('fs:watchWorkspace', handleWatchWorkspace);
    ipcMain.handle('shell:openExternal', (event, url) => shell.openExternal(url));

    // Settings & Notifications IPC
    ipcMain.handle('settings:load', () => loadSettings());
    ipcMain.handle('settings:save', async (event, settings) => {
        const result = await saveSettings(settings);
        if (result.success) {
            updateNotificationSchedule();
        }
        return result;
    });
    ipcMain.handle('notifications:test', () => {
        triggerNotification();
        return { success: true };
    });

    // Auto-update IPC
    ipcMain.handle('update:check', () => {
        if (!app.isPackaged) return { status: 'dev' };
        autoUpdater.checkForUpdatesAndNotify();
        return { status: 'checking' };
    });

    ipcMain.handle('update:quitAndInstall', () => {
        autoUpdater.quitAndInstall();
    });

    // Widget IPC
    ipcMain.handle('widget:triggerStartFlow', () => {
        performStartFlow();
    });

    createWindow();
    createWidgetWindow();
    createTray();
    updateNotificationSchedule();

    if (app.isPackaged) {
        autoUpdater.checkForUpdatesAndNotify();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
