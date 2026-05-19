"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/toast";
import { Share2, X, Link2 } from "lucide-react";

interface ShareButtonProps {
  type: "project" | "character" | "location";
  id: string;
  title: string;
}

export function ShareButton({ type, id, title }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const ref = useRef<HTMLDivElement>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const shareUrl = `${origin}/${type}s/${id}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied to clipboard!" });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  }

  const embedCode = `<iframe src="${shareUrl}?embed=1" width="100%" height="400" frameborder="0" style="border:1px solid #ddd;border-radius:8px"></iframe>`;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-fg/20 rounded-md hover:bg-fg/5"
        aria-label="Share"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-bg border border-fg/15 rounded-lg shadow-lg z-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Share</h4>
            <button onClick={() => setOpen(false)} className="p-0.5 rounded hover:bg-fg/5">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-fg/15 rounded-md hover:bg-fg/5 text-left"
            >
              <Link2 className="h-4 w-4" />
              Copy link
            </button>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  window.open(
                    `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
                    "_blank"
                  )
                }
                className="flex-1 px-2 py-1.5 text-xs border border-fg/15 rounded-md hover:bg-fg/5"
              >
                X / Twitter
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                    "_blank"
                  )
                }
                className="flex-1 px-2 py-1.5 text-xs border border-fg/15 rounded-md hover:bg-fg/5"
              >
                Facebook
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
                    "_blank"
                  )
                }
                className="flex-1 px-2 py-1.5 text-xs border border-fg/15 rounded-md hover:bg-fg/5"
              >
                Reddit
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-fg/50 mb-1">Embed</label>
              <textarea
                readOnly
                value={embedCode}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full rounded-md border border-fg/20 px-2 py-1.5 text-xs bg-bg resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
