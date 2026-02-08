import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        // console.error("Error reading dir:", dir, err);
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

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
