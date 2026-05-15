/** Default avatar placeholder. MIT License. */
export function AvatarDefault({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="20" fill="currentColor" fillOpacity="0.1"/>
      <circle cx="20" cy="15" r="7" fill="currentColor" fillOpacity="0.3"/>
      <path d="M8 36c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="currentColor" fillOpacity="0.2"/>
    </svg>
  );
}
