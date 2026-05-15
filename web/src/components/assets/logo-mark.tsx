/** StoryForge logomark — quill forming an "S" with ink drop. MIT License. */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M32 8C22 8 14 16 14 26v14c0 6 3 10 8 12l-2 6h8l-3-6c2 0 4 0 6-1" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 12c-6 6-6 16-4 24l10-18c-2 0-4-2-6-6z" fill="currentColor" fillOpacity="0.3"/>
      <circle cx="38" cy="52" r="5" fill="currentColor" fillOpacity="0.8"/>
    </svg>
  );
}
