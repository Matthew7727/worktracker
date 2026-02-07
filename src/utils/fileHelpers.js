/**
 * src/utils/fileHelpers.js
 *
 * Utility functions for handling file paths and structures for the Work Tracker.
 */

/**
 * Constructs the file path for a daily entry based on the root directory, date, and optional time.
 * Enforces the structure: [Root]/YYYY/MM/YYYY-MM-DD[_HHMMSS].md
 *
 * @param {string} rootDir - The base directory selected by the user.
 * @param {Date} date - The date for the entry.
 * @param {string} [timeStr] - Optional time string in HHMMSS format for unique entries.
 * @returns {string} The full absolute path to the daily markdown file.
 */
export const getDailyFilePath = (rootDir, date, timeStr) => {
    if (!rootDir) {
        console.error('getDailyFilePath: rootDir is required');
        return '';
    }

    // Ensure we are working with a valid Date object
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        console.error('getDailyFilePath: Invalid date provided');
        return '';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    const suffix = timeStr ? `_${timeStr}` : '';

    // Use forward slashes for consistency in JS; Node.js handles them fine on Windows
    return `${rootDir}/${year}/${month}/${year}-${month}-${day}${suffix}.md`;
};
