import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";

import { ArticleAudioPlayer } from "@/components/audio/article-audio-player";
import { I18nProvider } from "@/lib/i18n/provider";
import { markdownToPlainText, splitIntoSpeechChunks } from "@/lib/audio/plain-text";

const labels = {
  listen: "Listen",
  play: "Play",
  pause: "Pause",
  speed: "Speed",
  voice: "Voice",
  seek: "Seek",
  skipBack: "Back",
  skipForward: "Forward",
  unavailable: "Unavailable",
};

describe("markdownToPlainText", () => {
  it("strips markdown syntax but keeps the words", () => {
    const text = markdownToPlainText("# Title\n\nSome **bold** and a [link](https://example.com).");
    expect(text).not.toContain("#");
    expect(text).not.toContain("**");
    expect(text).not.toContain("https://example.com");
    expect(text).toContain("Title");
    expect(text).toContain("bold");
  });

  it("returns an empty string for empty input", () => {
    expect(markdownToPlainText("")).toBe("");
    expect(markdownToPlainText(null)).toBe("");
  });
});

describe("splitIntoSpeechChunks", () => {
  it("splits long text into sentence-sized chunks", () => {
    const chunks = splitIntoSpeechChunks("One. Two. Three. ".repeat(30));
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 260)).toBe(true);
  });
});

describe("ArticleAudioPlayer (storage-free)", () => {
  const wrap = (node: ReactNode) => (
    <I18nProvider initialLocale="fr">{node}</I18nProvider>
  );

  it("renders nothing without text", () => {
    expect(renderToStaticMarkup(wrap(<ArticleAudioPlayer text={null} labels={labels} />))).toBe("");
    expect(renderToStaticMarkup(wrap(<ArticleAudioPlayer text="   " labels={labels} />))).toBe("");
  });

  it("renders nothing on the server (speech engine detected client-side only)", () => {
    expect(renderToStaticMarkup(wrap(<ArticleAudioPlayer text="Hello world" labels={labels} />))).toBe("");
  });
});
