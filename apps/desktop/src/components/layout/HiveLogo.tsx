interface HiveLogoProps {
  size?: number;
  className?: string;
}

export function HiveLogo({ size = 36, className }: HiveLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="hiveLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="hiveGlow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hexagon */}
      <polygon
        points="16,3 25,8 25,18 16,23 7,18 7,8"
        fill="url(#hiveLogo)"
        opacity="0.95"
      />

      {/* Inner hexagon outline */}
      <polygon
        points="16,7 22,10.5 22,17.5 16,21 10,17.5 10,10.5"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.5"
      />

      {/* Neural connections */}
      <line x1="16" y1="3" x2="16" y2="7" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
      <line x1="25" y1="8" x2="22" y2="10.5" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
      <line x1="25" y1="18" x2="22" y2="17.5" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
      <line x1="16" y1="23" x2="16" y2="21" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
      <line x1="7" y1="18" x2="10" y2="17.5" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
      <line x1="7" y1="8" x2="10" y2="10.5" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />

      {/* Center node */}
      <circle cx="16" cy="13" r="2.5" fill="white" opacity="0.9" />
      <circle cx="16" cy="13" r="1" fill="url(#hiveLogo)" />

      {/* Vertex nodes */}
      <circle cx="16" cy="3" r="1.2" fill="#F59E0B" />
      <circle cx="25" cy="8" r="1.2" fill="#F59E0B" />
      <circle cx="25" cy="18" r="1.2" fill="#F59E0B" />
      <circle cx="16" cy="23" r="1.2" fill="#F59E0B" />
      <circle cx="7" cy="18" r="1.2" fill="#F59E0B" />
      <circle cx="7" cy="8" r="1.2" fill="#F59E0B" />
    </svg>
  );
}
