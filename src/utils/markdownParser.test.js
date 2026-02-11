import { describe, it, expect } from 'vitest';
import { parseMarkdown, stringifyMarkdown } from './markdownParser';

describe('markdownParser', () => {
    describe('parseMarkdown', () => {
        it('should correctly parse frontmatter and body', () => {
            // Use quotes in YAML to ensure it's a string, or expect 600 if unquoted
            const content = '---\ntags: [tag1, tag2]\ntime: "10:00"\n---\nThis is the body.';
            const { frontmatter, body } = parseMarkdown(content);
            expect(frontmatter.tags).toEqual(['tag1', 'tag2']);
            expect(frontmatter.time).toBe('10:00');
            expect(body.trim()).toBe('This is the body.');
        });

        it('should handle unquoted time as sexagesimal (YAML behavior)', () => {
            const content = '---\ntime: 10:00\n---\nBody.';
            const { frontmatter } = parseMarkdown(content);
            // 10:00 in YAML is 10 * 60 = 600
            expect(frontmatter.time).toBe(600);
        });

        it('should handle missing frontmatter', () => {
            const content = 'Just plain text body.';
            const { frontmatter, body } = parseMarkdown(content);
            expect(frontmatter).toEqual({});
            expect(body.trim()).toBe('Just plain text body.');
        });

        it('should handle malformed frontmatter gracefully', () => {
            const content = '---\ntags: [unclosed\n---\nBody text.';
            const { frontmatter } = parseMarkdown(content);
            expect(typeof frontmatter).toBe('object');
        });
    });

    describe('stringifyMarkdown', () => {
        it('should correctly stringify frontmatter and body', () => {
            const body = 'My content';
            const metadata = { tags: ['test'], time: '12:00' };
            const result = stringifyMarkdown(body, metadata);
            // expect result to contain metadata and body
            expect(result).toContain('tags');
            expect(result).toContain('test');
            // gray-matter might quote '12:00'
            expect(result).toMatch(/time: ("|')?12:00("|')?/);
            expect(result.trim()).toContain('My content');
        });

        it('should handle body and metadata correctly', () => {
            const body = 'Plain body';
            const result = stringifyMarkdown(body, { key: 'val' });
            expect(result).toContain('---');
            expect(result).toContain('key: val');
            expect(result.trim()).toContain('Plain body');
        });
    });
});
