import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { BrowserWindow, app, ipcMain } from 'electron';

export function setupUpdater() {
    // Configure logging
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    // Auto-updater events
    autoUpdater.on('checking-for-update', () => {
        log.info('Checking for update...');
    });
    autoUpdater.on('update-available', (info) => {
        log.info('Update available:', info);
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) mainWindow.webContents.send('update:available', info);
    });
    autoUpdater.on('update-not-available', (info) => {
        log.info('Update not available:', info);
    });
    autoUpdater.on('error', (err) => {
        log.error('Error in auto-updater:', err);
    });
    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        log.info(log_message);
    });
    autoUpdater.on('update-downloaded', (info) => {
        log.info('Update downloaded:', info);
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) mainWindow.webContents.send('update:downloaded', info);
    });

    // Register IPC handlers
    ipcMain.handle('update:check', () => {
        if (!app.isPackaged) return { status: 'dev' };
        autoUpdater.checkForUpdatesAndNotify();
        return { status: 'checking' };
    });

    ipcMain.handle('update:quitAndInstall', () => {
        autoUpdater.quitAndInstall();
    });

    // Check for updates if packaged
    if (app.isPackaged) {
        autoUpdater.checkForUpdatesAndNotify();
    }
}
