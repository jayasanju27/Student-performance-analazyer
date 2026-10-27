import React, { useState } from 'react';

export default function CollegeLogo({ size = 56, className = '', variant = 'navy', useImage = true }) {
  const [imgError, setImgError] = useState(false);
  // Formal heraldic Indian college emblem
  const isLight = variant === 'light';
  const primaryStroke = isLight ? '#FFFFFF' : '#0F2F57';
  const accentColor = isLight ? '#93C5FD' : '#1E40AF';
  const goldColor = isLight ? '#FDE047' : '#B45309';

  if (useImage && !imgError) {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 select-none overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        title="Info Institute of Engineering Official Logo"
      >
        <img
          src="/info-college-logo.png"
          alt="Info Institute of Engineering Logo"
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title="Official College Crest"
    >
      <svg
        viewBox="0 0 120 120"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Outer Shield / Concentric Rings */}
        <circle cx="60" cy="60" r="56" stroke={primaryStroke} strokeWidth="2.5" />
        <circle cx="60" cy="60" r="51.5" stroke={primaryStroke} strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="60" cy="60" r="47" stroke={primaryStroke} strokeWidth="1.5" />

        {/* Circular Seal Text Paths */}
        <path
          id="upperArch"
          d="M 22 60 A 38 38 0 1 1 98 60"
          fill="none"
        />
        <text
          fontSize="6.8"
          fontWeight="700"
          fontFamily="serif"
          fill={primaryStroke}
          letterSpacing="1.2"
        >
          <textPath href="#upperArch" startOffset="50%" textAnchor="middle">
            INFO INSTITUTE OF ENGINEERING
          </textPath>
        </text>

        {/* Established Year & Stars */}
        <circle cx="20" cy="60" r="1.5" fill={primaryStroke} />
        <circle cx="100" cy="60" r="1.5" fill={primaryStroke} />

        {/* Central Emblems */}
        {/* Laurel Wreath */}
        <g stroke={primaryStroke} strokeWidth="1.2" fill="none" opacity="0.85">
          {/* Left Wreath */}
          <path d="M 36 68 C 34 56, 38 42, 48 34" />
          <path d="M 35 62 C 32 60, 31 56, 34 54" />
          <path d="M 37 53 C 33 50, 34 45, 38 44" />
          <path d="M 42 44 C 38 41, 40 36, 44 36" />

          {/* Right Wreath */}
          <path d="M 84 68 C 86 56, 82 42, 72 34" />
          <path d="M 85 62 C 88 60, 89 56, 86 54" />
          <path d="M 83 53 C 87 50, 86 45, 82 44" />
          <path d="M 78 44 C 82 41, 80 36, 76 36" />
        </g>

        {/* Central Lamp of Knowledge / Traditional Diya Flame */}
        <g transform="translate(60, 39)">
          {/* Flame of Wisdom */}
          <path
            d="M 0 -8 C 3 -4, 4 -2, 2 1 C 0 3, -2 3, -2 1 C -4 -2, -3 -4, 0 -8 Z"
            fill={goldColor}
            stroke={primaryStroke}
            strokeWidth="0.8"
          />
          {/* Lamp Base */}
          <path
            d="M -7 4 C -6 2, 6 2, 7 4 C 5 6, -5 6, -7 4 Z"
            fill={primaryStroke}
          />
          <path
            d="M -3 6 L 3 6 L 4 9 L -4 9 Z"
            fill={primaryStroke}
          />
        </g>

        {/* Open Book of Academic Learning */}
        <g transform="translate(60, 58)">
          {/* Left Page */}
          <path
            d="M 0 3 C -8 -2, -15 -1, -19 2 L -19 12 C -15 9, -8 8, 0 13 Z"
            fill={isLight ? '#1E293B' : '#F8FAFC'}
            stroke={primaryStroke}
            strokeWidth="1.2"
          />
          {/* Right Page */}
          <path
            d="M 0 3 C 8 -2, 15 -1, 19 2 L 19 12 C 15 9, 8 8, 0 13 Z"
            fill={isLight ? '#1E293B' : '#F8FAFC'}
            stroke={primaryStroke}
            strokeWidth="1.2"
          />
          {/* Book Spine Center */}
          <line x1="0" y1="3" x2="0" y2="13" stroke={primaryStroke} strokeWidth="1.5" />
          {/* Page Lines (Left) */}
          <line x1="-16" y1="5" x2="-4" y2="2" stroke={accentColor} strokeWidth="0.8" opacity="0.6" />
          <line x1="-16" y1="8" x2="-4" y2="5" stroke={accentColor} strokeWidth="0.8" opacity="0.6" />
          {/* Page Lines (Right) */}
          <line x1="4" y1="2" x2="16" y2="5" stroke={accentColor} strokeWidth="0.8" opacity="0.6" />
          <line x1="4" y1="5" x2="16" y2="8" stroke={accentColor} strokeWidth="0.8" opacity="0.6" />
        </g>

        {/* Established Year Tag */}
        <text
          x="60"
          y="77"
          fontSize="5.5"
          fontWeight="bold"
          fontFamily="serif"
          fill={primaryStroke}
          textAnchor="middle"
          letterSpacing="0.8"
        >
          ESTD 2007
        </text>

        {/* Traditional Motto Banner Ribbon at Bottom */}
        <g transform="translate(60, 87)">
          <path
            d="M -38 0 L -30 3 L -30 -3 Z"
            fill={primaryStroke}
          />
          <path
            d="M 38 0 L 30 3 L 30 -3 Z"
            fill={primaryStroke}
          />
          <rect
            x="-32"
            y="-5"
            width="64"
            height="10"
            rx="1.5"
            fill={isLight ? '#0F172A' : '#FFFFFF'}
            stroke={primaryStroke}
            strokeWidth="1.2"
          />
          <text
            x="0"
            y="2"
            fontSize="5.2"
            fontWeight="bold"
            fontFamily="serif"
            fill={primaryStroke}
            textAnchor="middle"
            letterSpacing="0.6"
          >
            VIDYA DADATI VINAYAM
          </text>
        </g>
      </svg>
    </div>
  );
}
