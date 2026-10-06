/**
 * Types for the framework-agnostic narration engine (NF-AUDIO-001).
 * The implementation is plain ESM in `narration-core.js`, shared by the React
 * public player and the vanilla authoring CMS.
 */

export interface SpeechChunk {
  text: string;
  /** Index of this chunk's first token in the whole text (same `\S+` rule). */
  firstWordIndex: number;
}

export interface AudioWord {
  text: string;
  range: Range;
}

export interface AudioWordMap {
  words: AudioWord[];
  text: string;
}

export function countSpeechWords(text: string): number;
export function splitIntoSpeechChunksWithWordIndex(text: string, maxLength?: number): SpeechChunk[];
export function splitIntoSpeechChunks(text: string, maxLength?: number): string[];
export function sliceFromWord(text: string, skip: number): string;
export function collectAudioWords(root: Element): AudioWordMap;
export function wordIndexAtCaret(words: AudioWord[], node: Node | null, offset: number): number;
export function wordIndexAtPoint(words: AudioWord[], x: number, y: number): number;

export type NarrationMode = 'idle' | 'playing' | 'paused';

export interface NarrationEngineOptions {
  getRoot: () => Element | null;
  getFallbackText?: () => string;
  getLang?: () => string;
  getVoice?: () => SpeechSynthesisVoice | null;
  getRate?: () => number;
  getPitch?: () => number;
  getVolume?: () => number;
  isFollow?: () => boolean;
  isLineFocus?: () => boolean;
  shouldStopAfterChunk?: () => boolean;
  getPositionKey?: () => string;
  onMode?: (mode: NarrationMode) => void;
  onProgress?: (index: number, total: number) => void;
  highlightName?: string;
}

export class NarrationEngine {
  constructor(options: NarrationEngineOptions);
  readonly mode: NarrationMode;
  readonly index: number;
  readonly wordOffset: number;
  readonly finished: boolean;
  readonly words: AudioWord[];
  readonly chunks: SpeechChunk[];
  readonly paragraphStarts: number[];
  readonly supported: boolean;
  get total(): number;
  build(): number;
  persist(): void;
  restore(): void;
  play(index?: number, skip?: number): void;
  toggle(): void;
  pause(): void;
  skip(delta: number): void;
  restart(): void;
  seek(index: number): void;
  jumpParagraph(direction: number): void;
  chunkForWord(wordIndex: number): number;
  playFromWord(wordIndex: number): void;
  speakText(text: string): void;
  wordIndexAtPoint(x: number, y: number): number;
  destroy(): void;
}
