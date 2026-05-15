/** Badge icons for writing milestones. MIT License. */

export function BadgeQuillBronze({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#CD7F32" fillOpacity="0.15" stroke="#CD7F32" strokeWidth="2"/>
      <path d="M24 40L32 16l8 24-4-6h-8l-4 6z" fill="#CD7F32" fillOpacity="0.6"/>
      <path d="M30 20v16" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round"/>
      <text x="32" y="52" textAnchor="middle" fill="#CD7F32" fontSize="9" fontWeight="bold">1K</text>
    </svg>
  );
}

export function BadgeScrollSilver({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#A8A8A8" fillOpacity="0.15" stroke="#A8A8A8" strokeWidth="2"/>
      <rect x="18" y="16" width="28" height="32" rx="2" stroke="#A8A8A8" strokeWidth="2"/>
      <line x1="22" y1="24" x2="42" y2="24" stroke="#A8A8A8" strokeWidth="1.5"/>
      <line x1="22" y1="30" x2="42" y2="30" stroke="#A8A8A8" strokeWidth="1.5"/>
      <line x1="22" y1="36" x2="36" y2="36" stroke="#A8A8A8" strokeWidth="1.5"/>
      <text x="32" y="56" textAnchor="middle" fill="#A8A8A8" fontSize="9" fontWeight="bold">5K</text>
    </svg>
  );
}

export function BadgeBookGold({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#FFD700" fillOpacity="0.15" stroke="#FFD700" strokeWidth="2"/>
      <path d="M20 16h12l4 4v28l-4-4H20V16z" stroke="#FFD700" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M32 16v28l4 4V20l-4-4z" stroke="#FFD700" strokeWidth="2"/>
      <text x="32" y="54" textAnchor="middle" fill="#FFD700" fontSize="9" fontWeight="bold">10K</text>
    </svg>
  );
}

export function BadgeLibraryPlatinum({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#E5E4E2" fillOpacity="0.2" stroke="#E5E4E2" strokeWidth="2"/>
      <rect x="18" y="20" width="10" height="24" rx="1" stroke="#E5E4E2" strokeWidth="2"/>
      <rect x="30" y="18" width="10" height="26" rx="1" stroke="#E5E4E2" strokeWidth="2"/>
      <rect x="42" y="22" width="6" height="22" rx="1" stroke="#E5E4E2" strokeWidth="1.5"/>
      <text x="32" y="54" textAnchor="middle" fill="#E5E4E2" fontSize="9" fontWeight="bold">50K</text>
    </svg>
  );
}

export function BadgeGalaxyDiamond({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#7B68EE" fillOpacity="0.2" stroke="#7B68EE" strokeWidth="2"/>
      <path d="M32 8l8 18-8 6-8-6 8-18z" stroke="#7B68EE" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M24 26l8 6v16l-8-6V26z" stroke="#7B68EE" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M40 26l-8 6v16l8-6V26z" stroke="#7B68EE" strokeWidth="2" strokeLinejoin="round"/>
      <text x="32" y="54" textAnchor="middle" fill="#7B68EE" fontSize="9" fontWeight="bold">100K</text>
    </svg>
  );
}

export function BadgeFire({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#FF4500" fillOpacity="0.1" stroke="#FF4500" strokeWidth="2"/>
      <path d="M32 12c-4 8-8 14-8 20 0 4.4 3.6 8 8 8s8-3.6 8-8c0-6-4-12-8-20z" fill="#FF4500" fillOpacity="0.5" stroke="#FF4500" strokeWidth="2"/>
      <path d="M28 36c2 3 6 3 8 0" stroke="#FF4500" strokeWidth="2" strokeLinecap="round"/>
      <text x="32" y="54" textAnchor="middle" fill="#FF4500" fontSize="8" fontWeight="bold">STREAK</text>
    </svg>
  );
}

export function BadgeCrown({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#DAA520" fillOpacity="0.15" stroke="#DAA520" strokeWidth="2"/>
      <path d="M16 40l6-20 10 8 10-8 6 20H16z" stroke="#DAA520" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="22" cy="20" r="3" fill="#DAA520" fillOpacity="0.5"/>
      <circle cx="32" cy="18" r="3" fill="#DAA520" fillOpacity="0.5"/>
      <circle cx="42" cy="20" r="3" fill="#DAA520" fillOpacity="0.5"/>
      <text x="32" y="56" textAnchor="middle" fill="#DAA520" fontSize="8" fontWeight="bold">LEGEND</text>
    </svg>
  );
}
