"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, BookOpen, FileType, ChevronDown } from "lucide-react";

interface ExportDropdownProps {
  projectId: string;
}

export function ExportDropdown({ projectId }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-fg/20 rounded-md hover:bg-fg/5"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className="h-3 w-3 text-fg/40" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-bg border border-fg/15 rounded-md shadow-lg z-50 py-1">
          <a
            href={`/api/projects/${projectId}/export`}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-fg/5"
          >
            <FileText className="h-4 w-4 text-fg/50" />
            Export as Markdown
          </a>
          <a
            href={`/api/projects/${projectId}/export?format=epub`}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-fg/5"
          >
            <BookOpen className="h-4 w-4 text-fg/50" />
            Export as EPUB
          </a>
          <a
            href={`/api/projects/${projectId}/export?format=pdf`}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-fg/5"
          >
            <FileType className="h-4 w-4 text-fg/50" />
            Export as PDF
          </a>
        </div>
      )}
    </div>
  );
}
