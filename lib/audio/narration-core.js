/**
 * Framework-agnostic narration engine (NF-AUDIO-001).
 *
 * Single source of truth for reading a text aloud with the browser speech
 * engine, shared by the React public player (`components/blog/blog-audio-player.tsx`)
 * and the vanilla authoring CMS (`scripts/authoring-editor.html`). No framework,
 * no storage, no network, no build step.
 *
 * Design (learned the hard way):
 *  - ONE chunk is spoken at a time; the next starts from `onend`. Queuing every
 *    chunk at once relies on `speechSynthesis.speaking`/`paused`, which do not
 *    clear reliably after `pause()`/`cancel()` in Chromium.
 *  - The mode (`idle | playing | paused`) is owned here, never read from the
 *    browser speech flags.
 *  - A restart calls `cancel()`, then `resume()` and `speak()` on the next
 *    macrotask, so a restart always produces sound.
 *  - The spoken word is painted with the CSS Custom Highlight API over a DOM
 *    `Range`; the article DOM is never mutated.
 */

/** Token rule used for both the DOM word map and the chunk word index. */
const WORD_PATTERN = /\S+/g;
const BLOCK_SELECTOR = 'p, li, blockquote, h1, h2, h3, h4, td, figcaption';
const DEFAULT_HIGHLIGHT_NAME = 'nf-audio-word';

/** Count tokens with the same rule the DOM map uses. */
export function countSpeechWords(text) {
  let count = 0;
  const re = new RegExp(WORD_PATTERN.source, 'g');
  while (re.exec(text) !== null) count += 1;
  return count;
}

/**
 * Split text into sentence-sized chunks and record each chunk's first word
 * index, so an `onboundary` character index maps to a global word index without
 * depending on whitespace.
 */
export function splitIntoSpeechChunksWithWordIndex(text, maxLength = 240) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const sentences = normalized.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [normalized];
  const chunks = [];
  let current = '';
  let currentFirst = 0;
  let wordCursor = 0;
  for (const sentence of sentences) {
    const piece = sentence.trim();
    if (!piece) continue;
    const words = countSpeechWords(piece);
    if (current && current.length + piece.length + 1 > maxLength) {
      chunks.push({ text: current, firstWordIndex: currentFirst });
      current = piece;
      currentFirst = wordCursor;
    } else if (current) {
      current = `${current} ${piece}`;
    } else {
      current = piece;
      currentFirst = wordCursor;
    }
    wordCursor += words;
  }
  if (current) chunks.push({ text: current, firstWordIndex: currentFirst });
  return chunks;
}

export function splitIntoSpeechChunks(text, maxLength = 240) {
  return splitIntoSpeechChunksWithWordIndex(text, maxLength).map((chunk) => chunk.text);
}

/** Slice a chunk's text so speech starts at its `skip`-th token. */
export function sliceFromWord(text, skip) {
  if (skip <= 0) return text;
  const re = new RegExp(WORD_PATTERN.source, 'g');
  let match;
  let seen = 0;
  while ((match = re.exec(text)) !== null) {
    if (seen === skip) return text.slice(match.index);
    seen += 1;
  }
  return text;
}

/**
 * Collect every spoken word in `root`, in document order, with the range that
 * covers it. Text inside script/style, `aria-hidden` or `[data-audio-skip]`
 * nodes is ignored.
 */
export function collectAudioWords(root) {
  const parts = [];
  const words = [];
  if (!root || typeof document === 'undefined') return { words, text: '' };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const value = node.nodeValue;
      if (!value || !value.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (
        parent &&
        parent.closest('script, style, [aria-hidden="true"], [data-audio-skip], [data-testid="blog-audio-player"]')
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node = walker.nextNode();
  while (node) {
    const value = node.nodeValue || '';
    parts.push(value);
    const re = new RegExp(WORD_PATTERN.source, 'g');
    let match;
    while ((match = re.exec(value)) !== null) {
      const range = document.createRange();
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      words.push({ text: match[0], range });
    }
    node = walker.nextNode();
  }
  return { words, text: parts.join(' ') };
}

/** Word index whose range contains the given caret (text node + offset), or -1. */
export function wordIndexAtCaret(words, node, offset) {
  if (!node) return -1;
  for (let i = 0; i < words.length; i += 1) {
    const { startContainer, startOffset, endContainer, endOffset } = words[i].range;
    if (startContainer === node && endContainer === node) {
      if (offset >= startOffset && offset <= endOffset) return i;
    } else if (startContainer === node && offset >= startOffset) {
      return i;
    }
  }
  return -1;
}

/** Word index under a viewport point, or -1. */
export function wordIndexAtPoint(words, x, y) {
  const doc = document;
  if (typeof doc.caretPositionFromPoint === 'function') {
    const position = doc.caretPositionFromPoint(x, y);
    if (position) {
      const caret = wordIndexAtCaret(words, position.offsetNode, position.offset);
      if (caret >= 0) return caret;
    }
  }
  if (typeof doc.caretRangeFromPoint === 'function') {
    const range = doc.caretRangeFromPoint(x, y);
    if (range) {
      const caret = wordIndexAtCaret(words, range.startContainer, range.startOffset);
      if (caret >= 0) return caret;
    }
  }
  for (let i = 0; i < words.length; i += 1) {
    const rect = words[i].range.getBoundingClientRect();
    if (rect.width > 0 && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return i;
    }
  }
  return -1;
}

function highlighter() {
  if (typeof window === 'undefined') return null;
  const css = window.CSS;
  const HighlightCtor = window.Highlight;
  return css && css.highlights && HighlightCtor ? { css, HighlightCtor } : null;
}

/**
 * Differently-typed inputs, one behaviour. The consumer supplies getters and
 * callbacks; the engine never touches the UI or storage on its own beyond the
 * optional position helpers.
 */
export class NarrationEngine {
  /**
   * @param {object} options
   * @param {() => (Element|null)} options.getRoot
   * @param {() => string} [options.getFallbackText]
   * @param {() => string} [options.getLang]
   * @param {() => (SpeechSynthesisVoice|null)} [options.getVoice]
   * @param {() => number} [options.getRate]
   * @param {() => number} [options.getPitch]
   * @param {() => number} [options.getVolume]
   * @param {() => boolean} [options.isFollow]
   * @param {() => boolean} [options.isLineFocus]
   * @param {() => boolean} [options.shouldStopAfterChunk]
   * @param {() => string} [options.getPositionKey]
   * @param {(mode: "idle"|"playing"|"paused") => void} [options.onMode]
   * @param {(index: number, total: number) => void} [options.onProgress]
   * @param {string} [options.highlightName]
   */
  constructor(options) {
    this.options = options || {};
    this.words = [];
    this.chunks = [];
    this.paragraphStarts = [];
    this.mode = 'idle';
    this.index = 0;
    this.wordOffset = 0;
    this.finished = false;
    this.currentBlock = null;
    this.highlightName = this.options.highlightName || DEFAULT_HIGHLIGHT_NAME;
    this.supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  get total() {
    return this.chunks.length;
  }

  _synth() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  }

  _setMode(mode) {
    this.mode = mode;
    if (this.options.onMode) this.options.onMode(mode);
  }

  _lang() {
    return this.options.getLang ? this.options.getLang() : 'fr';
  }

  _rate() {
    return this.options.getRate ? this.options.getRate() : 1;
  }

  _voice() {
    return this.options.getVoice ? this.options.getVoice() : null;
  }

  _clearHighlight() {
    const painter = highlighter();
    if (painter) painter.css.highlights.delete(this.highlightName);
  }

  _paint(from, to) {
    const painter = highlighter();
    if (!painter || !this.words.length || from < 0 || from >= this.words.length) {
      this._clearHighlight();
      return;
    }
    const last = Math.min(Math.max(to, from), this.words.length - 1);
    const range = document.createRange();
    range.setStart(this.words[from].range.startContainer, this.words[from].range.startOffset);
    range.setEnd(this.words[last].range.endContainer, this.words[last].range.endOffset);
    painter.css.highlights.set(this.highlightName, new painter.HighlightCtor(range));

    if (this.options.isLineFocus && this.options.isLineFocus()) {
      const anchor = this.words[from].range.startContainer.parentElement;
      const block = anchor ? anchor.closest(BLOCK_SELECTOR) : null;
      if (block !== this.currentBlock) {
        if (this.currentBlock) this.currentBlock.classList.remove('nf-audio-current');
        if (block) block.classList.add('nf-audio-current');
        this.currentBlock = block;
      }
    }

    if (this.options.isFollow && !this.options.isFollow()) return;
    if (typeof range.getBoundingClientRect !== 'function') return;
    const rect = range.getBoundingClientRect();
    const margin = window.innerHeight * 0.25;
    if (rect.top < margin || rect.bottom > window.innerHeight - margin) {
      const scrollAnchor = this.words[from].range.startContainer.parentElement;
      if (scrollAnchor && scrollAnchor.scrollIntoView) {
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        scrollAnchor.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
      }
    }
  }

  /** Rebuild words, chunks and paragraph starts from the current root. */
  build() {
    const root = this.options.getRoot ? this.options.getRoot() : null;
    if (root) {
      const map = collectAudioWords(root);
      this.words = map.words;
      this.chunks = splitIntoSpeechChunksWithWordIndex(map.text);
    } else {
      this.words = [];
      this.chunks = splitIntoSpeechChunksWithWordIndex(this.options.getFallbackText ? this.options.getFallbackText() : '');
    }
    if (!this.words.length || !this.chunks.length) {
      this.words = [];
      this.chunks = splitIntoSpeechChunksWithWordIndex(this.options.getFallbackText ? this.options.getFallbackText() : '');
    }
    const starts = [];
    let previous = null;
    for (let i = 0; i < this.chunks.length; i += 1) {
      const word = this.words[this.chunks[i].firstWordIndex];
      const block = word ? word.range.startContainer.parentElement?.closest(BLOCK_SELECTOR) || null : null;
      if (block && block !== previous) {
        starts.push(i);
        previous = block;
      }
    }
    this.paragraphStarts = starts.length ? starts : this.chunks.map((_, i) => i);
    if (this.options.onProgress) this.options.onProgress(this.index, this.chunks.length);
    return this.chunks.length;
  }

  /** Persist the current position when a key is configured. */
  persist() {
    const key = this.options.getPositionKey ? this.options.getPositionKey() : '';
    if (!key || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('nf-article-audio-positions');
      const map = raw ? JSON.parse(raw) : {};
      map[key] = { chunk: this.index, word: this.wordOffset };
      window.localStorage.setItem('nf-article-audio-positions', JSON.stringify(map));
    } catch {
      /* private mode: position is simply not remembered */
    }
  }

  /** Load the stored position for the current key. */
  restore() {
    const key = this.options.getPositionKey ? this.options.getPositionKey() : '';
    if (!key || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('nf-article-audio-positions');
      const map = raw ? JSON.parse(raw) : {};
      const saved = map[key];
      if (saved && Number.isFinite(saved.chunk)) {
        this.index = Math.max(0, saved.chunk);
        this.wordOffset = Math.max(0, saved.word || 0);
      }
    } catch {
      /* ignore */
    }
  }

  /** Speak one chunk; the next is chained from `onend`. */
  _say(index, skip, restart) {
    const synth = this._synth();
    if (!synth) return;
    if (index >= this.chunks.length) {
      this.finished = true;
      this._setMode('idle');
      this._clearHighlight();
      this.persist();
      return;
    }
    const spoken = sliceFromWord(this.chunks[index].text, skip);
    const baseWord = this.chunks[index].firstWordIndex + skip;
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.lang = this._lang() === 'en' ? 'en-CA' : 'fr-CA';
    utterance.rate = this._rate();
    if (this.options.getPitch) utterance.pitch = this.options.getPitch();
    if (this.options.getVolume) utterance.volume = this.options.getVolume();
    const voice = this._voice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.onstart = () => {
      this.index = index;
      this.wordOffset = skip;
      if (this.options.onProgress) this.options.onProgress(index, this.chunks.length);
      const next = this.chunks[index + 1] ? this.chunks[index + 1].firstWordIndex : this.words.length;
      this._paint(baseWord, next - 1);
    };
    utterance.onboundary = (event) => {
      if (event.name && event.name !== 'word') return;
      const local = countSpeechWords(spoken.slice(0, event.charIndex));
      this.wordOffset = skip + local;
      this._paint(baseWord + local, baseWord + local);
    };
    utterance.onend = () => {
      if (this.options.shouldStopAfterChunk && this.options.shouldStopAfterChunk()) {
        this.pause();
        return;
      }
      if (this.mode === 'playing') this._say(index + 1, 0, false);
      else this.persist();
    };
    utterance.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled') return;
      this._setMode('idle');
    };
    if (restart) {
      synth.cancel();
      window.setTimeout(() => {
        if (this.mode !== 'playing') return;
        synth.resume();
        synth.speak(utterance);
      }, 0);
    } else {
      synth.speak(utterance);
    }
  }

  /** Start or restart narration, optionally at a chunk/word. */
  play(index, skip) {
    const synth = this._synth();
    if (!synth) return;
    this.build();
    if (!this.chunks.length) return;
    const target = Math.max(0, Math.min(Number.isFinite(index) ? index : this.index, this.chunks.length - 1));
    this._setMode('playing');
    this.finished = false;
    this._clearHighlight();
    this._say(target, Math.max(0, skip || 0), true);
  }

  /** Resume, or start from the remembered position. */
  toggle() {
    if (!this._synth()) return;
    if (this.mode === 'playing') {
      this.pause();
      return;
    }
    this.play(this.index, this.wordOffset);
  }

  /** Stop and remember the position. */
  pause() {
    const synth = this._synth();
    if (synth) synth.cancel();
    this._setMode('paused');
    this._clearHighlight();
    this.persist();
  }

  skip(delta) {
    if (!this.chunks.length) this.build();
    if (!this.chunks.length) return;
    this.play(Math.max(0, Math.min(this.index + delta, this.chunks.length - 1)), 0);
  }

  restart() {
    this.play(0, 0);
  }

  /** Move without starting playback (used by a seek control while idle). */
  seek(index) {
    if (!this.chunks.length) this.build();
    if (!this.chunks.length) return;
    const target = Math.max(0, Math.min(index, this.chunks.length - 1));
    if (this.mode === 'idle') {
      this.index = target;
      this.wordOffset = 0;
      if (this.options.onProgress) this.options.onProgress(target, this.chunks.length);
      this._paint(this.chunks[target].firstWordIndex, this.chunks[target].firstWordIndex);
      return;
    }
    this.play(target, 0);
  }

  jumpParagraph(direction) {
    if (!this.chunks.length) this.build();
    const starts = this.paragraphStarts.length ? this.paragraphStarts : this.chunks.map((_, i) => i);
    if (direction < 0) {
      const previous = [...starts].reverse().find((start) => start < this.index);
      this.seek(previous === undefined ? 0 : previous);
    } else {
      const next = starts.find((start) => start > this.index);
      if (next !== undefined) this.seek(next);
    }
  }

  /** Find the chunk that contains a global word index. */
  chunkForWord(wordIndex) {
    let chunk = 0;
    for (let i = 0; i < this.chunks.length; i += 1) {
      if (this.chunks[i].firstWordIndex <= wordIndex) chunk = i;
      else break;
    }
    return chunk;
  }

  /** Start narration at a global word index (click-to-read). */
  playFromWord(wordIndex) {
    if (!this.words.length) this.build();
    if (!this.words.length) return;
    const chunk = this.chunkForWord(wordIndex);
    this.play(chunk, Math.max(0, wordIndex - this.chunks[chunk].firstWordIndex));
  }

  /** Read an arbitrary text once (selection, voice sample). */
  speakText(text) {
    const synth = this._synth();
    if (!synth || !text) return;
    synth.cancel();
    this._clearHighlight();
    this._setMode('idle');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this._lang() === 'en' ? 'en-CA' : 'fr-CA';
    utterance.rate = this._rate();
    if (this.options.getPitch) utterance.pitch = this.options.getPitch();
    if (this.options.getVolume) utterance.volume = this.options.getVolume();
    const voice = this._voice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    synth.resume();
    synth.speak(utterance);
  }

  wordIndexAtPoint(x, y) {
    if (!this.words.length) this.build();
    return wordIndexAtPoint(this.words, x, y);
  }

  destroy() {
    const synth = this._synth();
    if (synth) synth.cancel();
    this._clearHighlight();
    this.persist();
  }
}
