/**
 * Wrapper for Electron IPC file system calls.
 */

const getAPI = () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
        return window.electronAPI;
    }
    console.error('Electron API not found. Make sure you are running in Electron.');
    return null;
};

export const selectProjectDirectory = async () => {
    const api = getAPI();
    if (!api) return null;
    return await api.selectDirectory();
};

export const readFile = async (filePath) => {
    const api = getAPI();
    if (!api) return { success: false, error: 'API not available' };
    return await api.readFile(filePath);
};

export const writeFile = async (filePath, content) => {
    const api = getAPI();
    if (!api) return { success: false, error: 'API not available' };
    return await api.writeFile(filePath, content);
};

export const listFiles = async (dirPath) => {
    const api = getAPI();
    if (!api) return { success: false, error: 'API not available' };
    return await api.listFiles(dirPath);
};
