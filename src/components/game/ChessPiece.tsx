import React from 'react';

export interface ChessPieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
  color?: 'w' | 'b';
  className?: string;
}

/**
 * Standard Staunton Chess Piece Vector Set
 * 100% IDENTICAL piece geometry and design for both Black and White.
 * The only difference is the color theme (fill & strokes).
 */
export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const normalizedType = type.toLowerCase() as 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  const pieceColor = color || (type === type.toUpperCase() ? 'w' : 'b');
  const isWhite = pieceColor === 'w';

  // Crisp, identical Staunton styling
  const fill = isWhite ? '#FFFFFF' : '#0F172A';
  const stroke = isWhite ? '#1E293B' : '#CBD5E1';
  const accentDetail = isWhite ? '#E2E8F0' : '#334155';
  const innerLine = isWhite ? '#334155' : '#94A3B8';

  const renderPaths = () => {
    switch (normalizedType) {
      case 'p': // Pawn
        return (
          <g>
            {/* Base */}
            <path
              d="M12 40h24c0-2-3-4-8-4.5V32c4-1 6-4 6-8 0-4-3-7-7-7s-7 3-7 7c0 4 2 7 6 8v3.5c-5 .5-8 2.5-8 4.5z"
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Head Ball */}
            <circle
              cx="24"
              cy="15"
              r="6.5"
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
            />
            {/* Detail Collar */}
            <path
              d="M19 24.5h10"
              stroke={innerLine}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M15 38.5h18"
              stroke={innerLine}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        );

      case 'n': // Knight
        return (
          <g>
            {/* Knight Silhouette */}
            <path
              d="M13 40h22c0-2-2-4-5-5 0-3 3-7 3-12 0-3-1.5-6-3-8l-3 2c-1-3-4-5-8-5-5 0-8 4-8 8 0 1 .5 3 1.5 4L11 26c-1.5 1.5-2 3.5-2 5.5 0 2.5 2 4.5 4 4.5v-1c-1.5 0-2.5-1-2.5-2.5 0-1.5 1-3 2.5-4l4-3.5c.5 1 1.5 2 3 2 1.5 0 2.5-1 2.5-2.5 0-.5-.2-1-.5-1.5 2 1 3 3 3 5 0 4-3 7-4 10-2 .5-4 2-4 4z"
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Eye */}
            <circle cx="18" cy="18" r="1.5" fill={isWhite ? '#0F172A' : '#FFFFFF'} />
            {/* Mane & Nostril detail */}
            <path
              d="M14 27.5c.5-.5 1.5-.5 2 0"
              stroke={innerLine}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M23 15c2 2 3 5 3 8"
              stroke={innerLine}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        );

      case 'b': // Bishop
        return (
          <g>
            {/* Base */}
            <path
              d="M13 40h22c0-2-3-4-7-4.5v-3c3.5-1 5.5-3.5 5.5-7 0-3.5-2.5-7-6.5-11-.5-.5-1.5-.5-2 0-4 4-6.5 7.5-6.5 11 0 3.5 2 6 5.5 7v3c-4 .5-7 2.5-7 4.5z"
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Bishop Top Cross / Finial */}
            <circle cx="24" cy="10" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
            {/* Cut slit in bishop miter */}
            <path
              d="M21 18l6 6M27 18l-3 3"
              stroke={innerLine}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M17 32h14"
              stroke={innerLine}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        );

      case 'r': // Rook
        return (
          <g>
            {/* Rook Tower Base & Stem */}
            <path
              d="M13 40h22c0-2-3-4-6-4.5v-17h3v-7h-4v3h-3v-3h-2v3h-3v-3h-4v7h3v17c-3 .5-6 2.5-6 4.5z"
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Crenellation details */}
            <path
              d="M16 18.5h16M17 35.5h14"
              stroke={innerLine}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        );

      case 'q': // Queen
        return (
          <g>
            {/* Crown & Base */}
            <path
              d="M12 40h24c0-2-3-4-6-4.5v-6.5l6-13-7 4-5-8-5 8-7-4 6 13v6.5c-3 .5-6 2.5-6 4.5z"
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Queen Crown Jewels */}
            <circle cx="10" cy="15" r="2" fill={fill} stroke={stroke} strokeWidth="1.2" />
            <circle cx="17" cy="19" r="2" fill={fill} stroke={stroke} strokeWidth="1.2" />
            <circle cx="24" cy="11" r="2" fill={fill} stroke={stroke} strokeWidth="1.2" />
            <circle cx="31" cy="19" r="2" fill={fill} stroke={stroke} strokeWidth="1.2" />
            <circle cx="38" cy="15" r="2" fill={fill} stroke={stroke} strokeWidth="1.2" />
            {/* Detail Bands */}
            <path
              d="M18 29.5h12M16 35.5h16"
              stroke={innerLine}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        );

      case 'k': // King
        return (
          <g>
            {/* Royal Cross */}
            <path
              d="M24 7v6M21 9.5h6"
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Crown Body & Base */}
            <path
              d="M12 40h24c0-2-3-4-6-4.5V30c4-2 6-6 6-11 0-4-3-6-6-6-2.5 0-4 1-5 2.5C20 14 18.5 13 16 13c-3 0-6 2-6 6 0 5 2 9 6 11v5.5c-3 .5-6 2.5-6 4.5z"
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Crown Arch Details */}
            <path
              d="M18 20c2-2 4-3 6-3s4 1 6 3"
              stroke={innerLine}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M18 30h12M16 35.5h16"
              stroke={innerLine}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 48 48"
      className={`inline-block select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {renderPaths()}
    </svg>
  );
};
