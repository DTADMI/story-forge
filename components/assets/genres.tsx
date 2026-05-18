/** Genre icons. MIT License. All 24x24 viewBox, stroke-based. */

function GIcon({
  children,
  className,
  size = 24,
}: {
  children: React.ReactNode;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function GenreFantasy({ className, size }: { className?: string; size?: number }) {
  return (
    <GIcon className={className} size={size}>
      <path d="M12 3l3 7h7l-5.5 4 2 7L12 17l-6.5 4 2-7L2 10h7l3-7z" />
    </GIcon>
  );
}

export function GenreScifi({ className, size }: { className?: string; size?: number }) {
  return (
    <GIcon className={className} size={size}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
    </GIcon>
  );
}

export function GenreRomance({ className, size }: { className?: string; size?: number }) {
  return (
    <GIcon className={className} size={size}>
      <path d="M12 21C12 21 4 14 4 8a5 5 0 0110 0c0-3 4-5 6-3s2 6-2 9c-3 3-4 4-6 7z" />
    </GIcon>
  );
}

export function GenreMystery({ className, size }: { className?: string; size?: number }) {
  return (
    <GIcon className={className} size={size}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l6 6" />
    </GIcon>
  );
}

export function GenreNonfiction({ className, size }: { className?: string; size?: number }) {
  return (
    <GIcon className={className} size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v6l4 2-4 2v6" />
    </GIcon>
  );
}

export function GenreHorror({ className, size }: { className?: string; size?: number }) {
  return (
    <GIcon className={className} size={size}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" />
      <path d="M9 15c.8 1.5 2.5 2.5 3 2.5s2.2-1 3-2.5" />
    </GIcon>
  );
}
