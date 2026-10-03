'use client';

import * as React from 'react';
import { Pause, Play, RotateCcw, RotateCw, Headphones } from 'lucide-react';

import { useI18n } from '@/lib/i18n/provider';
import { splitIntoSpeechChunks } from '@/lib/audio/plain-text';
import { cn } from '@/lib/utils';

export interface ArticleAudioPlayerProps {
  /** Plain text of the article, read aloud by the browser speech engine. */
  text?: string | null;
  /** Language of the text: `fr` or `en`. */
  lang?: 'fr' | 'en';
  /** Article title, shown as the player label. */
  title?: string;
  /** Selectable reading rates. Defaults to 0.75 / 1 / 1.25 / 1.5 / 2. */
  speeds?: number[];
  className?: string;
  /** Label overrides for projects that do not share the Nebula Forge i18n keys. */
  labels?: Partial<{
    listen: string;
    play: string;
    pause: string;
    speed: string;
    voice: string;
    seek: string;
    skipBack: string;
    skipForward: string;
    unavailable: string;
  }>;
}

const DEFAULT_SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const PREFS_KEY = 'nf-article-audio-prefs';

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

function readPrefs(): { speed?: number; voiceName?: string } {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as { speed?: number; voiceName?: string }) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs: { speed: number; voiceName: string }): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Private mode: the player still works, only the preference is not kept.
  }
}

/**
 * Accessible, storage-free narration player (NF-AUDIO-001).
 *
 * The article text is read by the browser speech engine (`speechSynthesis`):
 * nothing is stored, nothing goes stale, and there is no storage cost. The
 * player renders only when the current device actually exposes a speech engine,
 * so it adapts to the material conditions of the environment. No autoplay, no
 * tracking; speed and voice are remembered locally.
 *
 * Dependency-free by design (plain HTML controls + Tailwind) so the file can be
 * copied into any Next.js project without its own UI kit. Native controls keep
 * keyboard and screen-reader support; speech is chunked by sentence so progress,
 * pause/resume and navigation work where long utterances are truncated.
 */
export function ArticleAudioPlayer({
  text,
  lang = 'fr',
  title,
  speeds = DEFAULT_SPEEDS,
  className,
  labels,
}: ArticleAudioPlayerProps) {
  const { t } = useI18n();
  const rateRef = React.useRef(1);
  const indexRef = React.useRef(0);

  const [speechSupported, setSpeechSupported] = React.useState(false);
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = React.useState('');
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [failed, setFailed] = React.useState(false);
  const [chunkIndex, setChunkIndex] = React.useState(0);

  const chunks = React.useMemo(
    () => (text && text.trim() ? splitIntoSpeechChunks(text) : []),
    [text],
  );

  const languageVoices = React.useMemo(
    () => voices.filter((voice) => voice.lang?.toLowerCase().startsWith(lang === 'fr' ? 'fr' : 'en')),
    [voices, lang],
  );

  const L = {
    listen: labels?.listen ?? t('audio.listen'),
    play: labels?.play ?? t('audio.play'),
    pause: labels?.pause ?? t('audio.pause'),
    speed: labels?.speed ?? t('audio.speed'),
    voice: labels?.voice ?? t('audio.voice'),
    seek: labels?.seek ?? t('audio.seek'),
    skipBack: labels?.skipBack ?? t('audio.skipBack'),
    skipForward: labels?.skipForward ?? t('audio.skipForward'),
    unavailable: labels?.unavailable ?? t('audio.unavailable'),
  };

  // Detect the speech engine and load voices/preferences after mount, so the
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
      if (typeof prefs.speed === 'number') {
        setSpeed(prefs.speed);
        rateRef.current = prefs.speed;
      }
      if (typeof prefs.voiceName === 'string') setVoiceName(prefs.voiceName);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      synth.removeEventListener?.('voiceschanged', update);
    };
  }, []);

  React.useEffect(() => {
    rateRef.current = speed;
    if (speechSupported) savePrefs({ speed, voiceName });
  }, [speed, voiceName, speechSupported]);

  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakFrom = (startIndex: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const chosen = languageVoices.find((voice) => voice.name === voiceName) ?? pickVoice(voices, lang);
    for (let i = startIndex; i < chunks.length; i += 1) {
      const utterance = new SpeechSynthesisUtterance(chunks[i]);
      utterance.lang = lang === 'fr' ? 'fr-CA' : 'en-CA';
      utterance.rate = rateRef.current;
      if (chosen) {
        utterance.voice = chosen;
        utterance.lang = chosen.lang;
      }
      utterance.onstart = () => {
        indexRef.current = i;
        setChunkIndex(i);
      };
      if (i === chunks.length - 1) utterance.onend = () => setPlaying(false);
      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') setFailed(true);
      };
      synth.speak(utterance);
    }
    setPlaying(true);
  };

  const restartIfPlaying = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      speakFrom(indexRef.current);
    }
  };

  const hasText = Boolean(text && text.trim());

  // Render only if there is text and the device exposes speech.
  if (!speechSupported || !hasText) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setPlaying(false);
      return;
    }
    if (synth.paused) {
      synth.resume();
      setPlaying(true);
      return;
    }
    speakFrom(0);
  };

  const skipBy = (delta: number) => {
    speakFrom(Math.min(Math.max(0, indexRef.current + (delta > 0 ? 1 : -1)), chunks.length - 1));
  };

  const iconButton =
    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

  return (
    <section
      aria-label={L.listen}
      data-testid="article-audio-player"
      className={cn(
        'mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-5',
        className,
      )}
    >
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
            onClick={() => skipBy(-1)}
            aria-label={L.skipBack}
            disabled={failed}
            className={cn(iconButton, 'text-foreground hover:bg-muted')}
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => skipBy(1)}
            aria-label={L.skipForward}
            disabled={failed}
            className={cn(iconButton, 'text-foreground hover:bg-muted')}
          >
            <RotateCw aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Headphones aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{title || L.listen}</span>
        </div>

        {failed ? (
          <p className="text-xs text-destructive" role="alert">{L.unavailable}</p>
        ) : (
          <div className="flex items-center gap-3">
            <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
              {chunkIndex + 1}
            </span>
            <progress
              value={chunkIndex + 1}
              max={chunks.length}
              aria-label={L.seek}
              className="h-1.5 w-full min-w-0 overflow-hidden rounded-full"
            />
            <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {chunks.length}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {languageVoices.length > 0 ? (
          <select
            value={voiceName}
            onChange={(event) => {
              setVoiceName(event.target.value);
              restartIfPlaying();
            }}
            aria-label={L.voice}
            className="h-9 max-w-40 rounded-md border border-input bg-transparent px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            restartIfPlaying();
          }}
          aria-label={L.speed}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {speeds.map((rate) => (
            <option key={rate} value={rate}>
              {rate === 1 ? '1\u00d7' : `${rate}\u00d7`}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
