import { describe, it, expect } from 'vitest';

const calculateStreaks = (uniqueDates) => {
    // If empty, return a function that returns zeros
    if (uniqueDates.length === 0) return () => ({ current: 0, longest: 0 });

    const sortedDates = [...uniqueDates].sort().reverse();

    const getStreak = (todayStr) => {
        let currentS = 0;
        const yesterdayStr = new Date(new Date(todayStr).getTime() - 86400000).toISOString().split('T')[0];

        if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
            currentS = 1;
            for (let i = 0; i < sortedDates.length - 1; i++) {
                const d1 = new Date(sortedDates[i]);
                const d2 = new Date(sortedDates[i + 1]);
                const diff = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
                if (diff === 1) currentS++;
                else break;
            }
        }

        let tempS = 1;
        let longestS = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const d1 = new Date(sortedDates[i]);
            const d2 = new Date(sortedDates[i + 1]);
            const diff = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                tempS++;
                longestS = Math.max(longestS, tempS);
            } else {
                tempS = 1;
            }
        }
        return { current: currentS, longest: longestS };
    };

    return getStreak;
};

describe('Streak Calculation Logic', () => {
    it('should return 0 for no entries', () => {
        const getStreak = calculateStreaks([]);
        const result = getStreak('2024-01-10');
        expect(result.current).toBe(0);
        expect(result.longest).toBe(0);
    });

    it('should calculate current streak correctly if logged today', () => {
        const dates = ['2024-01-10', '2024-01-09', '2024-01-08'];
        const getStreak = calculateStreaks(dates);
        const result = getStreak('2024-01-10');
        expect(result.current).toBe(3);
    });

    it('should calculate current streak correctly if logged yesterday', () => {
        const dates = ['2024-01-09', '2024-01-08', '2024-01-07'];
        const getStreak = calculateStreaks(dates);
        const result = getStreak('2024-01-10');
        expect(result.current).toBe(3);
    });

    it('should reset current streak if gap is more than 1 day', () => {
        const dates = ['2024-01-08', '2024-01-07', '2024-01-06'];
        const getStreak = calculateStreaks(dates);
        const result = getStreak('2024-01-10');
        expect(result.current).toBe(0);
        expect(result.longest).toBe(3);
    });

    it('should calculate longest streak correctly with multiple gaps', () => {
        const dates = [
            '2024-01-10', '2024-01-09', // 2 day streak
            '2024-01-05', '2024-01-04', '2024-01-03', '2024-01-02' // 4 day streak
        ];
        const getStreak = calculateStreaks(dates);
        const result = getStreak('2024-01-10');
        expect(result.current).toBe(2);
        expect(result.longest).toBe(4);
    });

    it('should handle single entry as 1 day streak', () => {
        const dates = ['2024-01-10'];
        const getStreak = calculateStreaks(dates);
        const result = getStreak('2024-01-10');
        expect(result.current).toBe(1);
        expect(result.longest).toBe(1);
    });
});
