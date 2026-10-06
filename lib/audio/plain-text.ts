/**
 * Canonical plain-text extraction for narration, plus the speech helpers
 * re-exported from the shared engine (`narration-core.js`).
 *
 * Narration is storage-free (browser speech synthesis): the article text is
 * converted to plain text on the server and handed to the client player, which
 * reads it aloud. There is no generation script and no stored audio file.
 */
export { countSpeechWords, splitIntoSpeechChunks, splitIntoSpeechChunksWithWordIndex } from './narration-core';
export type { SpeechChunk } from './narration-core';

export function markdownToPlainText(markdown: string | null | undefined): string {
  if (typeof markdown !== 'string' || !markdown.trim()) return '';
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/^\s*\|.*\|\s*$/gm, ' ')
    .replace(/^\s*[-*_]{3,}\s*$/gm, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
