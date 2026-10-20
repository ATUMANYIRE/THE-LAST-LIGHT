'use client';

import React from 'react';

interface CharacterAvatarProps {
  avatarKey: string;
  size?: number;
  className?: string;
  alt: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  avatarKey,
  size = 48,
  className = '',
  alt,
}) => {
  // Original procedural SVG character portraits representing diversity & inclusion
  switch (avatarKey) {
    case 'maya':
      // Maya: Young student, dark hair, blue scarf, bright confident expression
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={`rounded-full shadow-md ${className}`}
          role="img"
          aria-label={alt}
        >
          <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
          {/* Hair back */}
          <circle cx="50" cy="46" r="28" fill="#0f172a" />
          {/* Face */}
          <circle cx="50" cy="48" r="22" fill="#fed7aa" />
          {/* Hair bangs */}
          <path d="M 28 42 Q 50 24 72 42 Q 62 30 50 30 Q 38 30 28 42 Z" fill="#0f172a" />
          {/* Eyes */}
          <circle cx="43" cy="48" r="2.5" fill="#1e293b" />
          <circle cx="57" cy="48" r="2.5" fill="#1e293b" />
          {/* Smile */}
          <path d="M 45 56 Q 50 61 55 56" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round" />
          {/* Scarf / Jacket */}
          <path d="M 24 88 Q 50 68 76 88 L 76 98 L 24 98 Z" fill="#0284c7" />
          <path d="M 38 72 Q 50 80 62 72 Q 50 86 38 72 Z" fill="#38bdf8" />
        </svg>
      );

    case 'sam':
      // Sam: Warm amber background, curly chestnut hair, cozy beanie, wheelchair user indicator
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={`rounded-full shadow-md ${className}`}
          role="img"
          aria-label={alt}
        >
          <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
          {/* Face */}
          <circle cx="50" cy="50" r="23" fill="#fcd34d" />
          {/* Beanie hat */}
          <path d="M 26 44 C 26 24 74 24 74 44 Z" fill="#d97706" />
          <rect x="25" y="41" width="50" height="7" rx="3.5" fill="#b45309" />
          {/* Eyes with glasses */}
          <circle cx="42" cy="51" r="6" fill="none" stroke="#451a03" strokeWidth="2" />
          <circle cx="58" cy="51" r="6" fill="none" stroke="#451a03" strokeWidth="2" />
          <line x1="48" y1="51" x2="52" y2="51" stroke="#451a03" strokeWidth="2" />
          <circle cx="42" cy="51" r="2.5" fill="#1e293b" />
          <circle cx="58" cy="51" r="2.5" fill="#1e293b" />
          {/* Warm smile */}
          <path d="M 44 63 Q 50 68 56 63" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sweater */}
          <path d="M 22 92 C 28 74 72 74 78 92 L 78 98 L 22 98 Z" fill="#92400e" />
          {/* Wheelchair wheel arc badge */}
          <path d="M 72 82 A 10 10 0 1 1 82 92" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'elena':
      // Elena: Silver braided hair, emerald sweater, dark sunglasses / white cane guide
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={`rounded-full shadow-md ${className}`}
          role="img"
          aria-label={alt}
        >
          <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#10b981" strokeWidth="3" />
          {/* Silver hair */}
          <circle cx="50" cy="46" r="28" fill="#cbd5e1" />
          {/* Face */}
          <circle cx="50" cy="50" r="22" fill="#fbcfe8" />
          {/* Stylish low-vision protective eyewear */}
          <rect x="33" y="44" width="34" height="13" rx="5" fill="#0f172a" stroke="#059669" strokeWidth="1.5" />
          {/* Smile */}
          <path d="M 44 65 Q 50 70 56 65" fill="none" stroke="#9d174d" strokeWidth="2" strokeLinecap="round" />
          {/* Knitted green cardigan */}
          <path d="M 22 92 C 30 74 70 74 78 92 L 78 98 L 22 98 Z" fill="#065f46" />
          {/* White cane clip badge */}
          <line x1="68" y1="70" x2="80" y2="92" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="77" y1="87" x2="80" y2="92" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'kai':
      // Kai: Lilac / purple background, noise-cancelling headphones, gentle focused expression
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={`rounded-full shadow-md ${className}`}
          role="img"
          aria-label={alt}
        >
          <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#a855f7" strokeWidth="3" />
          {/* Dark hair */}
          <circle cx="50" cy="46" r="26" fill="#1e1b4b" />
          {/* Face */}
          <circle cx="50" cy="50" r="22" fill="#fcd34d" />
          {/* Eyes */}
          <circle cx="43" cy="50" r="2.5" fill="#1e293b" />
          <circle cx="57" cy="50" r="2.5" fill="#1e293b" />
          {/* Calm smile */}
          <path d="M 45 61 Q 50 64 55 61" fill="none" stroke="#581c87" strokeWidth="2" strokeLinecap="round" />
          {/* Noise-canceling headphones headband */}
          <path d="M 25 48 A 25 25 0 0 1 75 48" fill="none" stroke="#7e22ce" strokeWidth="4.5" strokeLinecap="round" />
          {/* Earcups */}
          <rect x="22" y="44" width="7" height="15" rx="3.5" fill="#a855f7" />
          <rect x="71" y="44" width="7" height="15" rx="3.5" fill="#a855f7" />
          {/* Hoodie */}
          <path d="M 24 90 C 30 74 70 74 76 90 L 76 98 L 24 98 Z" fill="#6b21a8" />
        </svg>
      );

    case 'henderson':
      // Mr. Henderson: Warm golden glow, silver mustache, gentle elder postal cap
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={`rounded-full shadow-md ${className}`}
          role="img"
          aria-label={alt}
        >
          <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#eab308" strokeWidth="3" />
          {/* Face */}
          <circle cx="50" cy="51" r="23" fill="#fed7aa" />
          {/* Cap */}
          <path d="M 27 43 C 27 28 73 28 73 43 Z" fill="#1e3a8a" />
          <path d="M 24 43 L 76 43 L 80 47 L 20 47 Z" fill="#172554" />
          {/* Eyes */}
          <circle cx="42" cy="50" r="2.5" fill="#1e293b" />
          <circle cx="58" cy="50" r="2.5" fill="#1e293b" />
          {/* Silver mustache */}
          <path d="M 37 60 Q 50 56 63 60 Q 50 66 37 60 Z" fill="#e2e8f0" />
          {/* Warm smile */}
          <path d="M 44 66 Q 50 70 56 66" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
          {/* Postal jacket with badge */}
          <path d="M 22 92 C 30 75 70 75 78 92 L 78 98 L 22 98 Z" fill="#1d4ed8" />
          <circle cx="68" cy="84" r="4" fill="#fbbf24" />
        </svg>
      );

    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={`rounded-full shadow-md ${className}`}
          role="img"
          aria-label={alt}
        >
          <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="50" cy="45" r="20" fill="#cbd5e1" />
          <path d="M 25 88 C 30 70 70 70 75 88 Z" fill="#64748b" />
        </svg>
      );
  }
};
