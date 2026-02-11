
import { getDailyFilePath } from './fileHelpers';

/**
 * Parsed Todo Item structure
 * @typedef {Object} TodoItem
 * @property {string} id - Unique ID (timestamp + random)
 * @property {string} text - Task content
 * @property {boolean} completed - Is checked
 * @property {string} originalLine - Original markdown line for preservation (optional)
 */

/**
 * Parsed Lane structure
 * @typedef {Object} TodoLane
 * @property {string} title - Lane header (e.g. "To Do")
 * @property {TodoItem[]} items - List of tasks
 */

/**
 * Generates the specific path for todo files: YYYY-MM-DD-todos.md
 */
export const getTodoFilePath = (rootDir, date) => {
    const dailyPath = getDailyFilePath(rootDir, date);
    if (!dailyPath) return '';
    return dailyPath.replace('.md', '-todos.md');
};

/**
 * Generates the path for the persistent lane structure file
 */
export const getLaneStructureFilePath = (rootDir) => {
    if (!rootDir) return '';
    return `${rootDir}/todo-lanes.md`;
};

/**
 * Loads persistent lane structure (categories only, no tasks)
 * @returns {Promise<string[]>} Array of lane titles
 */
export const loadLaneStructure = async (rootDir) => {
    if (!window.electronAPI) return getDefaultLanes().map(l => l.title);

    const filePath = getLaneStructureFilePath(rootDir);
    const result = await window.electronAPI.readFile(filePath);

    if (result.success) {
        // Parse lane titles from markdown headers
        const lines = result.data.split('\n');
        const titles = lines
            .filter(line => line.trim().startsWith('# '))
            .map(line => line.substring(2).trim());
        return titles.length > 0 ? titles : getDefaultLanes().map(l => l.title);
    }

    // If file doesn't exist, return defaults
    return getDefaultLanes().map(l => l.title);
};

/**
 * Saves lane structure (categories only)
 * @param {string[]} lanesTitles - Array of lane titles
 */
export const saveLaneStructure = async (rootDir, laneTitles) => {
    if (!window.electronAPI) return;

    const filePath = getLaneStructureFilePath(rootDir);
    const content = laneTitles.map(title => `# ${title}\n`).join('\n');

    await window.electronAPI.writeFile(filePath, content);
};

/**
 * Loads todos with persistent lane structure but day-specific tasks
 * @returns {Promise<TodoLane[]>}
 */
export const loadDailyTodosWithPersistentLanes = async (rootDir, date) => {
    if (!window.electronAPI) return getDefaultLanes();

    // 1. Load persistent lane structure
    const laneTitles = await loadLaneStructure(rootDir);

    // 2. Load day-specific tasks
    const filePath = getTodoFilePath(rootDir, date);
    const result = await window.electronAPI.readFile(filePath);

    if (result.success) {
        const dayLanes = parseTodoMarkdown(result.data);
        // Merge: ensure all persistent lanes exist, populate with day's tasks
        return laneTitles.map(title => {
            const existingLane = dayLanes.find(l => l.title === title);
            return existingLane || { title, items: [] };
        });
    }

    // If no file for this day, check for rollover
    const rolledOver = await checkForRollover(rootDir, date);
    // Merge rollover with persistent lanes
    const merged = laneTitles.map(title => {
        const existingLane = rolledOver.find(l => l.title === title);
        return existingLane || { title, items: [] };
    });
    return merged;
};

/**
 * Saves todos and updates lane structure
 */
export const saveDailyTodosWithPersistentLanes = async (rootDir, date, lanes) => {
    if (!window.electronAPI) return;

    // 1. Save lane structure
    const laneTitles = lanes.map(l => l.title);
    await saveLaneStructure(rootDir, laneTitles);

    // 2. Save day-specific tasks
    const filePath = getTodoFilePath(rootDir, date);
    const content = serializeTodoMarkdown(lanes);
    await window.electronAPI.writeFile(filePath, content);
};

/**
 * Loads todos for a specific date
 * @returns {Promise<TodoLane[]>}
 */
export const loadDailyTodos = async (rootDir, date) => {
    if (!window.electronAPI) return getDefaultLanes();

    const filePath = getTodoFilePath(rootDir, date);
    const result = await window.electronAPI.readFile(filePath);

    if (result.success) {
        return parseTodoMarkdown(result.data);
    }

    // If file doesn't exist, check for rollover from previous days
    return await checkForRollover(rootDir, date);
};

const checkForRollover = async (rootDir, date) => {
    // 1. List all todo files
    const result = await window.electronAPI.listAllFiles(rootDir);
    if (!result.success) return getDefaultLanes();

    // 2. Filter for *-todos.md files
    const todoFiles = result.files.filter(f => f.endsWith('-todos.md'));

    if (todoFiles.length === 0) return getDefaultLanes();

    // 3. Find the most recent file before today
    const todayPath = getTodoFilePath(rootDir, date);
    // Sort descending
    todoFiles.sort().reverse();

    // Find the first file that is "less than" today's path (lexicographical sort works for YYYY-MM-DD)
    // Note: We need to be careful with paths. Let's simplify and just look for the first file that isn't today.
    // Since we filtered for *-todos.md and sorted desc, the first one that isn't today is likely the most recent previous.
    // Ideally we parse dates, but string comparison is robust for ISO dates.

    const previousFile = todoFiles.find(f => f < todayPath);

    if (!previousFile) return getDefaultLanes();

    // 4. Load that file
    const prevResult = await window.electronAPI.readFile(previousFile);
    if (!prevResult.success) return getDefaultLanes();

    const prevLanes = parseTodoMarkdown(prevResult.data);

    // 5. Migrate incomplete tasks
    // We want to preserve the lane titles.
    // If a lane exists in the previous file and has incomplete tasks, we create it in the new file.

    // Start with default "General" or empty?
    // Let's start empty to only carry over relevant lanes, but if nothing carries over we want at least "General".
    let newLanesMap = new Map(); // title -> items array

    // Initialize with default lanes if we want to ensure "General" always exists?
    // Let's just use the default lanes as a base, then merge.
    const defaults = getDefaultLanes();
    defaults.forEach(l => newLanesMap.set(l.title, [...l.items]));

    let rolloverCount = 0;
    prevLanes.forEach(lane => {
        const incompleteItems = lane.items.filter(i => !i.completed);
        if (incompleteItems.length > 0) {
            // Get or create lane in new map
            if (!newLanesMap.has(lane.title)) {
                newLanesMap.set(lane.title, []);
            }
            const existingItems = newLanesMap.get(lane.title);

            incompleteItems.forEach(item => {
                existingItems.push({
                    ...item,
                    text: `(Rollover) ${item.text}`
                });
                rolloverCount++;
            });
        }
    });

    // Convert map back to array
    const finalListLanes = Array.from(newLanesMap.entries()).map(([title, items]) => ({ title, items }));

    if (rolloverCount > 0) {
        saveDailyTodos(rootDir, date, finalListLanes);
    }

    return finalListLanes;
};

/**
 * Saves todos to markdown
 * @param {TodoLane[]} lanes
 */
export const saveDailyTodos = async (rootDir, date, lanes) => {
    if (!window.electronAPI) return;

    const filePath = getTodoFilePath(rootDir, date);
    const content = serializeTodoMarkdown(lanes);

    await window.electronAPI.writeFile(filePath, content);
};

const getDefaultLanes = () => [
    { title: 'General', items: [] }
];

/**
 * Parses markdown into lanes.
 * Format:
 * # Lane Title
 * - [ ] Task
 * - [x] Completed Task
 */
const parseTodoMarkdown = (content) => {
    const lines = content.split('\n');
    const lanes = [];
    let currentLane = null;

    lines.forEach(line => {
        const trimmed = line.trim();

        if (trimmed.startsWith('# ')) {
            // New Lane
            if (currentLane) lanes.push(currentLane);
            currentLane = {
                title: trimmed.substring(2).trim(),
                items: []
            };
        } else if (trimmed.startsWith('- [') && currentLane) {
            // Task Item
            const isCompleted = trimmed.startsWith('- [x]');
            const text = trimmed.substring(5).trim();
            currentLane.items.push({
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                text,
                completed: isCompleted
            });
        }
    });

    if (currentLane) lanes.push(currentLane);

    // If empty or malformed, return defaults
    return lanes.length > 0 ? lanes : getDefaultLanes();
};

/**
 * Aggregates todo statistics
 * @returns {Promise<{ today: { total: number, completed: number, byCategory: Object }, month: { completed: number }, year: { completed: number } }>}
 */
export const getTodoStats = async (rootDir) => {
    if (!window.electronAPI) return { today: {}, month: {}, year: {} };

    // 1. List all todo files
    const result = await window.electronAPI.listAllFiles(rootDir);
    if (!result.success) return { today: {}, month: {}, year: {} };

    const todoFiles = result.files.filter(f => f.endsWith('-todos.md'));

    const stats = {
        today: { total: 0, completed: 0, byCategory: [] },
        month: { completed: 0 },
        year: { completed: 0 }
    };

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const todayStr = new Date().toISOString().split('T')[0];

    // Helper to parse filename YYYY-MM-DD
    const getDateFromPath = (path) => {
        const basename = path.split(/[\\/]/).pop();
        const datePart = basename.replace('-todos.md', '');
        return new Date(datePart);
    };

    // Parallel-ish loading (limited by electron bridge, but we can try Promise.all)
    // For performance, we might want to limit this or only read recent files.
    // For now, let's read all. If it gets slow, we optimize.
    const filePromises = todoFiles.map(async (filePath) => {
        const fileRes = await window.electronAPI.readFile(filePath);
        if (!fileRes.success) return null;

        const date = getDateFromPath(filePath);
        const lanes = parseTodoMarkdown(fileRes.data);

        let fileCompleted = 0;
        lanes.forEach(lane => {
            lane.items.forEach(item => {
                if (item.completed) fileCompleted++;
            });
        });

        const isToday = filePath.includes(todayStr);

        if (isToday) {
            lanes.forEach(lane => {
                const laneTotal = lane.items.length;
                const laneCompleted = lane.items.filter(i => i.completed).length;
                stats.today.total += laneTotal;
                stats.today.completed += laneCompleted;
                stats.today.byCategory.push({
                    title: lane.title,
                    total: laneTotal,
                    completed: laneCompleted
                });
            });
        }

        if (date.getFullYear() === currentYear) {
            stats.year.completed += fileCompleted;
            if (date.getMonth() === currentMonth) {
                stats.month.completed += fileCompleted;
            }
        }
    });

    await Promise.all(filePromises);

    return stats;
};

const serializeTodoMarkdown = (lanes) => {
    return lanes.map(lane => {
        const header = `# ${lane.title}`;
        const items = lane.items.map(item => {
            return `- [${item.completed ? 'x' : ' '}] ${item.text}`;
        }).join('\n');
        return `${header}\n${items}`;
    }).join('\n\n');
};
