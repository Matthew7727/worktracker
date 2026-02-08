import { dialog } from 'electron';
import fs from 'fs/promises';
import path from 'path';

// Helper: Recursive function to get all markdown files
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

export async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled) {
        return;
    } else {
        return filePaths[0];
    }
}

export async function handleSaveDialog(event, options) {
    const { canceled, filePath } = await dialog.showSaveDialog(options);
    if (canceled) {
        return { canceled: true };
    } else {
        return { canceled: false, filePath };
    }
}

export async function handleReadFile(event, filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function handleWriteFile(event, filePath, content) {
    try {
        // Ensure directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function handleDeleteFile(event, filePath) {
    try {
        await fs.unlink(filePath);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function handleListFiles(event, dirPath) {
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

export async function handleListAllFiles(event, dirPath) {
    try {
        const files = await getMarkdownFiles(dirPath);
        return { success: true, files };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function handleSearchEntries(event, { rootDir, query }) {
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
