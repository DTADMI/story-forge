'use client';

import * as React from 'react';
import {
  ArrowDownToLine,
  ChevronDown,
  ChevronUp,
  Headphones,
  Keyboard,
  Moon,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Type,
  Volume2,
} from 'lucide-react';

import { useI18n } from '@/lib/i18n/provider';
import { countSpeechWords, splitIntoSpeechChunksWithWordIndex } from '@/lib/audio/plain-text';
import { NarrationEngine, type NarrationMode } from '@/lib/audio/narration-core';
import { cn } from '@/lib/utils';

export interface ArticleAudioPlayerProps {
  /** Plain text of the article, read aloud by the browser speech engine. */
  text?: string | null;
  /** Language of the text: `fr` or `en`. */
  lang?: 'fr' | 'en';
  /** Article title, shown as the player label. */
  title?: string;
  /** Stable key (slug) used to remember the reader's position. */
  storageKey?: string;
  /** Selectable reading rates. Defaults to 0.75 / 1 / 1.25 / 1.5 / 2. */
  speeds?: number[];
  className?: string;
  /**
   * CSS selector of the rendered article body. When it resolves, the player
   * tracks the spoken word in that DOM, highlights it, follows it (optionally)
   * and lets the reader click a word to resume from there.
   */
  trackSelector?: string;
  /** Label overrides for projects that do not share the Nebula Forge i18n keys. */
  labels?: Partial<Record<keyof typeof LABEL_KEYS, string>>;
}

const LABEL_KEYS = {
  listen: '',
  play: '',
  pause: '',
  speed: '',
  voice: '',
  seek: '',
  skipBack: '',
  skipForward: '',
  unavailable: '',
  restart: '',
  follow: '',
  shortcuts: '',
  clickToRead: '',
  shortcutsHint: '',
  options: '',
  sleep: '',
  sleepOff: '',
  paragraphBack: '',
  paragraphForward: '',
  preview: '',
  volume: '',
  pitch: '',
  readingComfort: '',
  fontSize: '',
  lineHeight: '',
  letterSpacing: '',
  theme: '',
  themeDefault: '',
  themeSepia: '',
  themeContrast: '',
  lineFocus: '',
  readSelection: '',
  remaining: '',
  shortcutsTitle: '',
  reset: '',
} as const;

type ReadingTheme = 'default' | 'sepia' | 'contrast';

const DEFAULT_SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_CHOICES = [0, 5, 15, 30, 60];
const PREFS_KEY = 'nf-article-audio-prefs';

interface AudioPrefs {
  speed?: number;
  voiceName?: string;
  follow?: boolean;
  shortcuts?: boolean;
  lineFocus?: boolean;
  pitch?: number;
  volume?: number;
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  theme?: ReadingTheme;
}

const DEFAULTS = {
  speed: 1,
  pitch: 1,
  volume: 1,
  fontSize: 18,
  lineHeight: 1.8,
  letterSpacing: 0,
  theme: 'default' as ReadingTheme,
};

function pickVoice(voices: SpeechSynthesisVoice[], lang: 'fr' | 'en'): SpeechSynthesisVoice | null {
  const prefix = lang === 'fr' ? 'fr' : 'en';
  const candidates = voices.filter((voice) => voice.lang?.toLowerCase().startsWith(prefix));
  const regions = lang === 'fr' ? ['fr-ca', 'fr-fr'] : ['en-ca', 'en-us', 'en-gb'];
  for (const region of regions) {
    const exact = candidates.filter((voice) => voice.lang.toLowerCase() === region);
    const local = exact.find((voice) => voice.localService);
    if (local) return local;
    if (exact[0]) return exact[0];
  }
  return candidates.find((voice) => voice.localService) ?? candidates[0] ?? null;
}

function readPrefs(): AudioPrefs {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as AudioPrefs) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs: AudioPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Private mode: the player still works, only the preference is not kept.
  }
}

/** True when the browser can paint an arbitrary Range without touching the DOM. */
function supportsHighlights(): boolean {
  if (typeof window === 'undefined') return false;
  const css = CSS as typeof CSS & { highlights?: Map<string, unknown> };
  const HighlightCtor = (window as unknown as { Highlight?: unknown }).Highlight;
  return Boolean(css.highlights && HighlightCtor);
}

export function formatDuration(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

/**
 * Accessible, storage-free narration player (NF-AUDIO-001).
 *
 * The playback engine is shared with the vanilla authoring CMS
 * (`lib/audio/narration-core.js`): one chunk at a time, an explicit
 * `idle | playing | paused` state machine, word highlighting, click-to-read,
 * follow and line focus. This component only owns the UI and the reading
 * comfort settings, and reads the engine state through callbacks.
 *
 * The article text is read by the browser speech engine (`speechSynthesis`):
 * nothing is stored server-side, nothing goes stale, no storage cost. The player
 * renders only when the device exposes a speech engine, and never autoplays.
 */
export function ArticleAudioPlayer({
  text,
  lang = 'fr',
  title,
  storageKey,
  speeds = DEFAULT_SPEEDS,
  className,
  trackSelector,
  labels,
}: ArticleAudioPlayerProps) {
  const { t } = useI18n();
  const engineRef = React.useRef<NarrationEngine | null>(null);
  const langRef = React.useRef(lang);
  const storageKeyRef = React.useRef(storageKey);
  const fallbackTextRef = React.useRef(text);
  const voiceRef = React.useRef<SpeechSynthesisVoice | null>(null);
  const rateRef = React.useRef(DEFAULTS.speed);
  const pitchRef = React.useRef(DEFAULTS.pitch);
  const volumeRef = React.useRef(DEFAULTS.volume);
  const followRef = React.useRef(true);
  const lineFocusRef = React.useRef(false);
  const sleepStopRef = React.useRef(false);
  const keyHandlerRef = React.useRef<(event: KeyboardEvent) => void>(() => {});

  const [speechSupported, setSpeechSupported] = React.useState(false);
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = React.useState('');
  const [mode, setMode] = React.useState<NarrationMode>('idle');
  const [speed, setSpeed] = React.useState(DEFAULTS.speed);
  const [pitch, setPitch] = React.useState(DEFAULTS.pitch);
  const [volume, setVolume] = React.useState(DEFAULTS.volume);
  const [failed, setFailed] = React.useState(false);
  const [chunkIndex, setChunkIndex] = React.useState(0);
  const [follow, setFollow] = React.useState(true);
  const [shortcuts, setShortcuts] = React.useState(true);
  const [lineFocus, setLineFocus] = React.useState(false);
  const [tracking, setTracking] = React.useState(false);
  const [canHighlight, setCanHighlight] = React.useState(false);
  const [chunkTotal, setChunkTotal] = React.useState(0);
  const [hasSavedPosition, setHasSavedPosition] = React.useState(false);
  const [sleepMinutes, setSleepMinutes] = React.useState(0);
  const [sleepRemaining, setSleepRemaining] = React.useState(0);
  const [fontSize, setFontSize] = React.useState(DEFAULTS.fontSize);
  const [lineHeight, setLineHeight] = React.useState(DEFAULTS.lineHeight);
  const [letterSpacing, setLetterSpacing] = React.useState(DEFAULTS.letterSpacing);
  const [theme, setTheme] = React.useState<ReadingTheme>(DEFAULTS.theme);
  const [hasSelection, setHasSelection] = React.useState(false);

  const playing = mode === 'playing';

  const languageVoices = React.useMemo(
    () => voices.filter((voice) => voice.lang?.toLowerCase().startsWith(lang === 'fr' ? 'fr' : 'en')),
    [voices, lang],
  );

  const L = React.useMemo(() => {
    const merged = {} as Record<keyof typeof LABEL_KEYS, string>;
    for (const key of Object.keys(LABEL_KEYS) as (keyof typeof LABEL_KEYS)[]) {
      merged[key] = labels?.[key] ?? t(`audio.${key}`);
    }
    return merged;
  }, [labels, t]);

  // Keep the engine getters fresh without recreating it.
  React.useEffect(() => {
    langRef.current = lang;
  }, [lang]);
  React.useEffect(() => {
    storageKeyRef.current = storageKey;
  }, [storageKey]);
  React.useEffect(() => {
    fallbackTextRef.current = text;
  }, [text]);
  React.useEffect(() => {
    rateRef.current = speed;
  }, [speed]);
  React.useEffect(() => {
    pitchRef.current = pitch;
  }, [pitch]);
  React.useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  React.useEffect(() => {
    followRef.current = follow;
  }, [follow]);
  React.useEffect(() => {
    lineFocusRef.current = lineFocus;
  }, [lineFocus]);
  React.useEffect(() => {
    const chosen = languageVoices.find((voice) => voice.name === voiceName) ?? pickVoice(voices, lang);
    voiceRef.current = chosen ?? null;
  }, [languageVoices, voiceName, voices, lang]);

  // Detect the speech engine and load voices and preferences after mount, so the
  // server render matches the first client render (no hydration mismatch).
  React.useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const update = () => setVoices(synth.getVoices());
    synth.addEventListener?.('voiceschanged', update);
    const timer = window.setTimeout(() => {
      setSpeechSupported(true);
      update();
      const prefs = readPrefs();
      if (typeof prefs.speed === 'number') setSpeed(prefs.speed);
      if (typeof prefs.pitch === 'number') setPitch(prefs.pitch);
      if (typeof prefs.volume === 'number') setVolume(prefs.volume);
      if (typeof prefs.voiceName === 'string') setVoiceName(prefs.voiceName);
      if (typeof prefs.follow === 'boolean') setFollow(prefs.follow);
      if (typeof prefs.shortcuts === 'boolean') setShortcuts(prefs.shortcuts);
      if (typeof prefs.lineFocus === 'boolean') setLineFocus(prefs.lineFocus);
      if (typeof prefs.fontSize === 'number') setFontSize(prefs.fontSize);
      if (typeof prefs.lineHeight === 'number') setLineHeight(prefs.lineHeight);
      if (typeof prefs.letterSpacing === 'number') setLetterSpacing(prefs.letterSpacing);
      if (prefs.theme) setTheme(prefs.theme);
      if (trackSelector) setTracking(Boolean(document.querySelector(trackSelector)));
      setCanHighlight(supportsHighlights());
    }, 0);
    return () => {
      window.clearTimeout(timer);
      synth.removeEventListener?.('voiceschanged', update);
    };
  }, [trackSelector]);

  React.useEffect(() => {
    if (speechSupported) {
      savePrefs({
        speed,
        voiceName,
        follow,
        shortcuts,
        lineFocus,
        pitch,
        volume,
        fontSize,
        lineHeight,
        letterSpacing,
        theme,
      });
    }
  }, [speed, voiceName, follow, shortcuts, lineFocus, pitch, volume, fontSize, lineHeight, letterSpacing, theme, speechSupported]);

  // The shared engine owns playback, highlighting, follow and position. It is
  // recreated when the article (storage key) or the tracked root changes, which
  // stops the previous narration and restores the new article's position.
  React.useEffect(() => {
    if (!speechSupported) return;
    const engine = new NarrationEngine({
      getRoot: () => (trackSelector ? document.querySelector(trackSelector) : null),
      getFallbackText: () => (fallbackTextRef.current ? String(fallbackTextRef.current) : ''),
      getLang: () => langRef.current,
      getVoice: () => voiceRef.current,
      getRate: () => rateRef.current,
      getPitch: () => pitchRef.current,
      getVolume: () => volumeRef.current,
      isFollow: () => followRef.current,
      isLineFocus: () => lineFocusRef.current,
      shouldStopAfterChunk: () => sleepStopRef.current,
      getPositionKey: () => storageKeyRef.current ?? '',
      onMode: (next) => setMode(next),
      onProgress: (index, total) => {
        setChunkIndex(index);
        setChunkTotal(total);
      },
    });
    engineRef.current = engine;
    engine.restore();
    setChunkIndex(engine.index);
    setHasSavedPosition(engine.index > 0 || engine.wordOffset > 0);
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [speechSupported, trackSelector, storageKey]);

  // Apply reading comfort to the article body (external DOM, not React state).
  React.useEffect(() => {
    if (!trackSelector) return;
    const root = document.querySelector<HTMLElement>(trackSelector);
    if (!root) return;
    root.style.fontSize = `${fontSize}px`;
    root.style.lineHeight = String(lineHeight);
    root.style.letterSpacing = `${letterSpacing}em`;
    root.classList.toggle('nf-read-sepia', theme === 'sepia');
    root.classList.toggle('nf-read-contrast', theme === 'contrast');
    if (lineFocus) root.setAttribute('data-audio-line-focus', '');
    else root.removeAttribute('data-audio-line-focus');
  }, [trackSelector, fontSize, lineHeight, letterSpacing, theme, lineFocus]);

  // Sleep timer: countdown only while a delay is set. The engine stops at the
  // end of the current sentence when `sleepStopRef` turns true.
  React.useEffect(() => {
    if (sleepMinutes <= 0) return;
    const end = Date.now() + sleepMinutes * 60_000;
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.round((end - Date.now()) / 1000));
      setSleepRemaining(left);
      if (left <= 0) sleepStopRef.current = true;
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sleepMinutes]);

  React.useEffect(() => {
    if (mode === 'paused' && sleepStopRef.current) {
      sleepStopRef.current = false;
      setSleepMinutes(0);
      setSleepRemaining(0);
    }
  }, [mode]);

  // Track whether the reader selected text inside the article (for "read selection").
  React.useEffect(() => {
    if (!trackSelector) return;
    const onSelectionChange = () => {
      const selection = window.getSelection();
      const root = document.querySelector(trackSelector);
      const selected = selection?.toString().trim() ?? '';
      setHasSelection(Boolean(selected && selection?.anchorNode && root && root.contains(selection.anchorNode)));
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [trackSelector]);

  const estimatedTotal = React.useMemo(
    () => splitIntoSpeechChunksWithWordIndex((text ?? '').replace(/\s+/g, ' ').trim()).length,
    [text],
  );
  const totalChunks = chunkTotal || estimatedTotal;
  const totalWords = React.useMemo(() => countSpeechWords(text ?? ''), [text]);
  const remainingSeconds = React.useMemo(() => {
    if (!totalChunks) return 0;
    const wordsLeft = Math.max(0, Math.round(totalWords * (1 - chunkIndex / totalChunks)));
    return (wordsLeft / (150 * (speed || 1))) * 60;
  }, [totalWords, totalChunks, chunkIndex, speed]);

  const toggle = React.useCallback(() => {
    setFailed(false);
    engineRef.current?.toggle();
  }, []);

  const skipTo = React.useCallback((index: number) => {
    engineRef.current?.seek(index);
  }, []);

  const jumpParagraph = React.useCallback((direction: number) => {
    engineRef.current?.jumpParagraph(direction);
  }, []);

  const stepSpeed = React.useCallback(
    (direction: number) => {
      const current = speeds.indexOf(speed);
      const next = speeds[Math.min(Math.max(0, current + direction), speeds.length - 1)];
      if (next !== undefined && next !== speed) {
        rateRef.current = next;
        setSpeed(next);
        const engine = engineRef.current;
        if (engine && engine.mode !== 'idle') engine.play(engine.index, engine.wordOffset);
      }
    },
    [speeds, speed],
  );

  const restartIfActive = React.useCallback(() => {
    const engine = engineRef.current;
    if (engine && engine.mode !== 'idle') engine.play(engine.index, engine.wordOffset);
  }, []);

  const previewVoice = React.useCallback(() => {
    const sample = lang === 'fr' ? 'Voici la voix sélectionnée pour la lecture.' : 'This is the selected reading voice.';
    engineRef.current?.speakText(sample);
  }, [lang]);

  const readSelection = React.useCallback(() => {
    const selected = window.getSelection()?.toString().trim();
    if (selected) engineRef.current?.speakText(selected);
  }, []);

  const setSleep = React.useCallback((minutes: number) => {
    setSleepMinutes(minutes);
    sleepStopRef.current = false;
    setSleepRemaining(minutes > 0 ? minutes * 60 : 0);
  }, []);

  const resetComfort = React.useCallback(() => {
    setFontSize(DEFAULTS.fontSize);
    setLineHeight(DEFAULTS.lineHeight);
    setLetterSpacing(DEFAULTS.letterSpacing);
    setTheme(DEFAULTS.theme);
  }, []);

  // Click a word in the article to resume from it.
  React.useEffect(() => {
    if (!speechSupported || !trackSelector) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || !target.closest(trackSelector)) return;
      if (target.closest('a') || target.closest('button')) return;
      const engine = engineRef.current;
      if (!engine) return;
      const word = engine.wordIndexAtPoint(event.clientX, event.clientY);
      if (word >= 0) engine.playFromWord(word);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [speechSupported, trackSelector]);

  // Keyboard shortcuts. Reassigned after every render so the window listener
  // never goes stale; the listener itself is added once per enable toggle.
  React.useEffect(() => {
    keyHandlerRef.current = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      const engine = engineRef.current;
      if (!engine) return;
      switch (event.key) {
        case ' ':
          event.preventDefault();
          toggle();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          engine.skip(-1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          engine.skip(1);
          break;
        case 'PageUp':
          event.preventDefault();
          jumpParagraph(-1);
          break;
        case 'PageDown':
          event.preventDefault();
          jumpParagraph(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          stepSpeed(1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          stepSpeed(-1);
          break;
        case 'f':
        case 'F':
          setFollow((value) => !value);
          break;
        case 'l':
        case 'L':
          setLineFocus((value) => !value);
          break;
        case 'Home':
          event.preventDefault();
          engine.restart();
          break;
        case 'Escape':
          engine.pause();
          break;
      }
    };
  });

  React.useEffect(() => {
    if (!speechSupported || !shortcuts) return;
    const onKey = (event: KeyboardEvent) => keyHandlerRef.current(event);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [speechSupported, shortcuts]);

  const hasText = Boolean(text && text.trim()) || tracking;
  if (!speechSupported || !hasText) return null;

  const iconButton =
    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
  const toggleButton =
    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40';
  const rangeClass = 'h-1.5 w-full min-w-0 cursor-pointer accent-primary';
  const fieldClass =
    'rounded-md border border-input bg-transparent px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <section
      aria-label={L.listen}
      data-testid="blog-audio-player"
      data-audio-tracking={tracking ? 'on' : 'off'}
      data-audio-highlight={canHighlight ? 'on' : 'off'}
      data-audio-saved={hasSavedPosition ? 'on' : 'off'}
      className={cn('mb-6 rounded-xl border border-border bg-card p-4', className)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            disabled={failed}
            aria-label={playing ? L.pause : L.play}
            className={cn(iconButton, 'bg-primary text-primary-foreground hover:opacity-90')}
          >
            {playing ? <Pause aria-hidden="true" className="h-5 w-5" /> : <Play aria-hidden="true" className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => skipTo(chunkIndex - 1)}
              aria-label={L.skipBack}
              disabled={failed}
              className={cn(iconButton, 'text-foreground hover:bg-muted')}
            >
              <SkipBack aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => skipTo(chunkIndex + 1)}
              aria-label={L.skipForward}
              disabled={failed}
              className={cn(iconButton, 'text-foreground hover:bg-muted')}
            >
              <SkipForward aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => engineRef.current?.restart()}
              aria-label={L.restart}
              disabled={failed}
              className={cn(iconButton, 'text-foreground hover:bg-muted')}
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Headphones aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{title || L.listen}</span>
            <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              −{formatDuration(remainingSeconds)}
            </span>
          </div>

          {failed ? (
            <p className="text-xs text-destructive" role="alert">{L.unavailable}</p>
          ) : (
            <div className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                {chunkIndex + 1}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, totalChunks - 1)}
                value={chunkIndex}
                onChange={(event) => skipTo(Number(event.target.value))}
                aria-label={L.seek}
                className={rangeClass}
              />
              <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                {totalChunks}
              </span>
            </div>
          )}

          <p className="truncate text-xs text-muted-foreground" title={`${L.clickToRead} ${L.shortcutsHint}`}>
            {tracking ? `${L.clickToRead} ` : ''}
            {shortcuts ? L.shortcutsHint : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tracking ? (
            <>
              <button
                type="button"
                onClick={() => setFollow((value) => !value)}
                aria-label={L.follow}
                aria-pressed={follow}
                title={L.follow}
                className={cn(toggleButton, follow ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted')}
              >
                <ArrowDownToLine aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLineFocus((value) => !value)}
                aria-label={L.lineFocus}
                aria-pressed={lineFocus}
                title={L.lineFocus}
                className={cn(toggleButton, lineFocus ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted')}
              >
                <Type aria-hidden="true" className="h-4 w-4" />
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setShortcuts((value) => !value)}
            aria-label={L.shortcuts}
            aria-pressed={shortcuts}
            title={L.shortcuts}
            className={cn(toggleButton, shortcuts ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted')}
          >
            <Keyboard aria-hidden="true" className="h-4 w-4" />
          </button>

          {languageVoices.length > 0 ? (
            <select
              value={voiceName}
              onChange={(event) => {
                setVoiceName(event.target.value);
                restartIfActive();
              }}
              aria-label={L.voice}
              className={cn(fieldClass, 'h-9 max-w-36')}
            >
              {languageVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </select>
          ) : null}

          <select
            value={speed}
            onChange={(event) => {
              const value = Number(event.target.value);
              rateRef.current = value;
              setSpeed(value);
              restartIfActive();
            }}
            aria-label={L.speed}
            className={cn(fieldClass, 'h-9')}
          >
            {speeds.map((rate) => (
              <option key={rate} value={rate}>
                {rate === 1 ? '1\u00d7' : `${rate}\u00d7`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <details className="group mt-3 border-t border-border pt-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 group-open:hidden" />
          <ChevronUp aria-hidden="true" className="hidden h-3.5 w-3.5 group-open:block" />
          {L.options}
        </summary>

        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              {L.preview}
            </span>
            <button type="button" onClick={previewVoice} className={cn(fieldClass, 'h-8 hover:bg-muted')}>
              {L.preview}
            </button>
            <button
              type="button"
              onClick={readSelection}
              disabled={!hasSelection}
              className={cn(fieldClass, 'h-8 hover:bg-muted disabled:opacity-40')}
            >
              {L.readSelection}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Moon aria-hidden="true" className="h-3.5 w-3.5" />
              {L.sleep}
              {sleepMinutes > 0 ? ` · ${formatDuration(sleepRemaining)}` : ''}
            </span>
            <select
              value={sleepMinutes}
              onChange={(event) => setSleep(Number(event.target.value))}
              aria-label={L.sleep}
              className={cn(fieldClass, 'h-8')}
            >
              {SLEEP_CHOICES.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes === 0 ? L.sleepOff : `${minutes} min`}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => jumpParagraph(-1)}
                aria-label={L.paragraphBack}
                title={L.paragraphBack}
                className={cn(toggleButton, 'text-muted-foreground hover:bg-muted')}
              >
                <ChevronUp aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => jumpParagraph(1)}
                aria-label={L.paragraphForward}
                title={L.paragraphForward}
                className={cn(toggleButton, 'text-muted-foreground hover:bg-muted')}
              >
                <ChevronDown aria-hidden="true" className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">{L.paragraphForward}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Volume2 aria-hidden="true" className="h-3.5 w-3.5" />
              {L.volume}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label={L.volume}
              className={rangeClass}
            />
            <span className="text-xs font-medium text-muted-foreground">{L.pitch}</span>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={pitch}
              onChange={(event) => setPitch(Number(event.target.value))}
              aria-label={L.pitch}
              className={rangeClass}
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Type aria-hidden="true" className="h-3.5 w-3.5" />
              {L.readingComfort}
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                {L.fontSize}
                <input
                  type="range"
                  min={14}
                  max={26}
                  step={1}
                  value={fontSize}
                  onChange={(event) => setFontSize(Number(event.target.value))}
                  className={rangeClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                {L.lineHeight}
                <input
                  type="range"
                  min={1.3}
                  max={2.4}
                  step={0.1}
                  value={lineHeight}
                  onChange={(event) => setLineHeight(Number(event.target.value))}
                  className={rangeClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                {L.letterSpacing}
                <input
                  type="range"
                  min={0}
                  max={0.15}
                  step={0.01}
                  value={letterSpacing}
                  onChange={(event) => setLetterSpacing(Number(event.target.value))}
                  className={rangeClass}
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={theme}
                onChange={(event) => setTheme(event.target.value as ReadingTheme)}
                aria-label={L.theme}
                className={cn(fieldClass, 'h-8')}
              >
                <option value="default">{L.themeDefault}</option>
                <option value="sepia">{L.themeSepia}</option>
                <option value="contrast">{L.themeContrast}</option>
              </select>
              <button type="button" onClick={resetComfort} className={cn(fieldClass, 'h-8 hover:bg-muted')}>
                {L.reset}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-muted-foreground">{L.shortcutsTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{L.shortcutsHint}</p>
          </div>
        </div>
      </details>
    </section>
  );
}
