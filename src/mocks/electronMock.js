
/**
 * Mock Electron API for Browser Development
 * simulates the IPC bridge exposed by preload.js
 */

export const setupElectronMock = () => {
    if (window.electronAPI) return; // Don't overwrite if actual Electron is present

    console.log("🔧 Initializing Electron Mock for Browser Development");

    // Use forward slashes for cross-platform consistency in JS
    const MOCK_ROOT = "C:/Mock/WorkTracker";

    // Helper to format date parts
    const formatDatePath = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return { year, month, dateStr };
    };

    // Generate some fake file data
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);

    const todayParts = formatDatePath(today);
    const yesterdayParts = formatDatePath(yesterday);

    const mockFiles = {
        // Journal Entry - Today
        [`${MOCK_ROOT}/${todayParts.year}/${todayParts.month}/${todayParts.dateStr}.md`]: `---
tags: [dev, planning]
---
# Daily Log ${todayParts.dateStr}

Starting work on the **dashboard refactor**. 
Things are looking good.

## Tasks
- [x] Create mock
- [ ] Test in browser
`,
        // Journal Entry - Yesterday
        [`${MOCK_ROOT}/${yesterdayParts.year}/${yesterdayParts.month}/${yesterdayParts.dateStr}.md`]: `---
tags: [meeting]
---
# Daily Log ${yesterdayParts.dateStr}

Had a sync with the team.
`,
        // Todos - Today
        [`${MOCK_ROOT}/${todayParts.year}/${todayParts.month}/${todayParts.dateStr}-todos.md`]: `# To Do
- [ ] Finish the mock implementation
- [ ] Verify browser load

# In Progress
- [x] Analyze requirements

# Done
- [x] Create plan
`,
        // Todos - Yesterday
        [`${MOCK_ROOT}/${yesterdayParts.year}/${yesterdayParts.month}/${yesterdayParts.dateStr}-todos.md`]: `# To Do
- [x] Create plan
`
    };

    window.electronAPI = {
        selectDirectory: async () => {
            console.log("[Mock] selectDirectory called");
            return MOCK_ROOT;
        },

        listAllFiles: async (path) => {
            console.log(`[Mock] listAllFiles called for ${path}`);
            return {
                success: true,
                files: Object.keys(mockFiles)
            };
        },

        readFile: async (path) => {
            console.log(`[Mock] readFile called for ${path}`);
            // Normalize path for comparison (handle mixing of backslashes from potential OS interactions)
            const normalizedPath = path.replace(/\\/g, '/');

            // Try explicit match first
            if (mockFiles[normalizedPath]) {
                return { success: true, data: mockFiles[normalizedPath] };
            }

            // Loose match (case insensitive or slight variation)
            const key = Object.keys(mockFiles).find(k => k.toLowerCase() === normalizedPath.toLowerCase());
            if (key) {
                return { success: true, data: mockFiles[key] };
            }

            console.warn(`[Mock] File not found: ${path}`);
            return { success: false, error: "File not found in mock" };
        },

        writeFile: async (path, content) => {
            console.log(`[Mock] writeFile called for ${path}`);
            const normalizedPath = path.replace(/\\/g, '/');
            mockFiles[normalizedPath] = content;
            return { success: true };
        },

        watchWorkspace: async (path) => {
            console.log(`[Mock] watchWorkspace called for ${path}`);
            return { success: true };
        },

        onWorkspaceChanged: (callback) => {
            console.log(`[Mock] onWorkspaceChanged listener registered`);
            // We could simulate changes here if needed, e.g. with setTimeout
        },

        openExternal: async (url) => {
            console.log(`[Mock] openExternal called for ${url}`);
            window.open(url, '_blank');
        }
    };
};
