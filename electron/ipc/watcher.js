import chokidar from 'chokidar';
import { BrowserWindow } from 'electron';

let watcher = null;

export async function handleWatchWorkspace(event, rootDir) {
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
