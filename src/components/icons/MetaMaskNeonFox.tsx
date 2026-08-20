import React from 'react';

interface MetaMaskNeonFoxProps {
  className?: string;
  size?: number;
}

/**
 * Geometric Origami Neon-Polygon Fox Icon
 * Custom-rendered according to user's MetaMask visual specification.
 */
export const MetaMaskNeonFox: React.FC<MetaMaskNeonFoxProps> = ({
  className = 'w-full h-full',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dark Facet Background Panels */}
      <polygon points="50,15 15,22 10,48 50,28" fill="#0A0A0A" />
      <polygon points="50,15 85,22 90,48 50,28" fill="#0A0A0A" />
      <polygon points="10,48 50,28 50,80 10,72" fill="#050505" />
      <polygon points="90,48 50,28 50,80 90,72" fill="#050505" />
      <polygon points="10,72 50,80 50,96 18,94" fill="#080808" />
      <polygon points="90,72 50,80 50,96 82,94" fill="#080808" />

      {/* Top Ear & Brow Outlines - Vibrant Neon Orange */}
      <g stroke="#FF6A00" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
        {/* Left Ear */}
        <polyline points="50,20 15,22 8,48 40,36 50,20" />
        <line x1="15" y1="22" x2="40" y2="36" />
        <polyline points="8,48 40,36 50,80" />

        {/* Right Ear */}
        <polyline points="50,20 85,22 92,48 60,36 50,20" />
        <line x1="85" y1="22" x2="60" y2="36" />
        <polyline points="92,48 60,36 50,80" />

        {/* Central Bridge / Snout Line */}
        <line x1="50" y1="20" x2="50" y2="80" strokeWidth="3" />
      </g>

      {/* Mid Cheeks & Outer Edge - Neon Purple / Violet */}
      <g stroke="#A855F7" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
        {/* Left Cheek */}
        <polyline points="8,48 20,54 40,54 40,65 20,65 8,48" />
        <line x1="20" y1="54" x2="20" y2="65" />
        <polyline points="8,48 8,72 28,72 28,85 50,80" />

        {/* Right Cheek */}
        <polyline points="92,48 80,54 60,54 60,65 80,65 92,48" />
        <line x1="80" y1="54" x2="80" y2="65" />
        <polyline points="92,48 92,72 72,72 72,85 50,80" />
      </g>

      {/* Lower Jaw & Chin - Neon Cyan / Sky Blue */}
      <g stroke="#38BDF8" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
        <polyline points="8,72 18,94 40,96 50,88" />
        <polyline points="92,72 82,94 60,96 50,88" />
        <polyline points="40,96 50,96 60,96" />
      </g>

      {/* Eyes - Neon Lime Green */}
      <g stroke="#CCFF00" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" fill="#000000">
        {/* Left Eye */}
        <polygon points="28,62 38,59 40,64 30,66" fill="#CCFF00" fillOpacity="0.2" />
        {/* Right Eye */}
        <polygon points="72,62 62,59 60,64 70,66" fill="#CCFF00" fillOpacity="0.2" />
      </g>

      {/* Nose - Neon Lime Green */}
      <g stroke="#CCFF00" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" fill="#000000">
        <polygon points="44,81 56,81 58,86 50,90 42,86" fill="#CCFF00" fillOpacity="0.25" />
      </g>
    </svg>
  );
};
