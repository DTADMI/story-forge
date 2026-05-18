/** Empty state illustrations. MIT License. 120x120 viewBox, muted, friendly. */

function EmptySvg({
  children,
  className,
  size = 120,
}: {
  children: React.ReactNode;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function EmptyBook({ className, size }: { className?: string; size?: number }) {
  return (
    <EmptySvg className={className} size={size}>
      <rect
        x="25"
        y="20"
        width="50"
        height="65"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.05"
      />
      <path d="M50 20v65" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
      <line
        x1="32"
        y1="35"
        x2="45"
        y2="35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="44"
        x2="45"
        y2="44"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="53"
        x2="42"
        y2="53"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="55"
        y1="35"
        x2="68"
        y2="35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="55"
        y1="44"
        x2="68"
        y2="44"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </EmptySvg>
  );
}

export function EmptyScroll({ className, size }: { className?: string; size?: number }) {
  return (
    <EmptySvg className={className} size={size}>
      <path
        d="M30 25h40v50H30c-8 0-10-4-10-10V35c0-6 2-10 10-10z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.05"
      />
      <path d="M30 25c0 0-10-2-10 10s10-2 10 0" stroke="currentColor" strokeWidth="1.5" />
      <line
        x1="36"
        y1="38"
        x2="64"
        y2="38"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="46"
        x2="64"
        y2="46"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="54"
        x2="56"
        y2="54"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="90" cy="30" r="12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M86 30h8M90 26v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </EmptySvg>
  );
}

export function EmptyQuill({ className, size }: { className?: string; size?: number }) {
  return (
    <EmptySvg className={className} size={size}>
      <path
        d="M50 20l-30 50 15 5 25-40-10-15z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <line
        x1="55"
        y1="25"
        x2="70"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="90"
        cy="15"
        r="15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      <path
        d="M90 8v14M83 15h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </EmptySvg>
  );
}

export function EmptyChart({ className, size }: { className?: string; size?: number }) {
  return (
    <EmptySvg className={className} size={size}>
      <rect
        x="20"
        y="20"
        width="80"
        height="80"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.03"
      />
      <line x1="30" y1="80" x2="30" y2="30" stroke="currentColor" strokeWidth="1.5" />
      <line x1="28" y1="78" x2="100" y2="78" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M30 70l15-25 15 10 15-35 10 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      <circle cx="90" cy="50" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M88 50h4M90 48v4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </EmptySvg>
  );
}
