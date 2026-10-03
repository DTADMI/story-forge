/**
 * Canonical plain-text extraction for narration.
 *
 * Narration is storage-free (browser speech synthesis): the article text is
 * converted to plain text on the server and handed to the client player, which
 * reads it aloud. There is no generation script and no stored audio file.
 */
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

/**
 * Split narration text into sentence-sized chunks. The Web Speech API can
 * truncate very long utterances in some browsers, and chunking also gives a
 * usable progress indicator and per-chunk navigation.
 */
export function splitIntoSpeechChunks(text: string, maxLength = 240): string[] {
  const normalized = text.trim();
  if (!normalized) return [];
  const sentences = normalized.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [normalized];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    const piece = sentence.trim();
    if (!piece) continue;
    if (current && current.length + piece.length + 1 > maxLength) {
      chunks.push(current);
      current = piece;
    } else {
      current = current ? `${current} ${piece}` : piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
