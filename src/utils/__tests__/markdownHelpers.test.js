import { describe, it, expect } from 'vitest';
import { injectMarkdown } from '../markdownHelpers';

describe('markdownHelpers', () => {
    describe('injectMarkdown', () => {
        it('should inject bold text', () => {
            const { newText } = injectMarkdown('Hello world', 0, 5, 'bold');
            expect(newText).toBe('**Hello** world');
        });

        it('should inject italic text', () => {
            const { newText } = injectMarkdown('Hello world', 6, 11, 'italic');
            expect(newText).toBe('Hello _world_');
        });

        it('should inject strikethrough text', () => {
            const { newText } = injectMarkdown('Hello', 0, 5, 'strikethrough');
            expect(newText).toBe('~~Hello~~');
        });

        it('should inject list item', () => {
            const { newText } = injectMarkdown('Item', 0, 4, 'list');
            expect(newText).toBe('- Item');
        });

        it('should inject blockquote', () => {
            const { newText } = injectMarkdown('Quote', 0, 5, 'blockquote');
            expect(newText).toBe('> Quote');
        });

        it('should inject link', () => {
            const { newText } = injectMarkdown('Link', 0, 4, 'link');
            expect(newText).toBe('[Link](https://example.com)');
        });

        it('should inject left align', () => {
            const { newText } = injectMarkdown('Text', 0, 4, 'align-left');
            expect(newText).toBe('<div style="text-align: left">\nText\n</div>');
        });

        it('should inject center align', () => {
            const { newText } = injectMarkdown('Text', 0, 4, 'align-center');
            expect(newText).toBe('<div style="text-align: center">\nText\n</div>');
        });

        it('should inject right align', () => {
            const { newText } = injectMarkdown('Text', 0, 4, 'align-right');
            expect(newText).toBe('<div style="text-align: right">\nText\n</div>');
        });

        it('should handle headers at start of line', () => {
            const { newText } = injectMarkdown('Title', 0, 5, 'heading');
            expect(newText).toBe('## Title');
        });

        it('should handle headers not at start of line', () => {
            const { newText } = injectMarkdown('Prefix Title', 7, 12, 'heading');
            expect(newText).toBe('Prefix \n## Title');
        });

        it('should inject code block for multi-line selection', () => {
            const text = 'line1\nline2';
            const { newText } = injectMarkdown(text, 0, 11, 'code');
            expect(newText).toBe('```\nline1\nline2\n```');
        });

        it('should inject inline code for single line', () => {
            const { newText } = injectMarkdown('const x = 1', 6, 7, 'code');
            expect(newText).toBe('const `x` = 1');
        });

        it('should default to empty template if no selection', () => {
            const { newText, newCursor } = injectMarkdown('', 0, 0, 'bold');
            expect(newText).toBe('**bold text**');
        });
    });
});
