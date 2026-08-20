import { ChessTier } from '../types';

/**
 * Competitive XP Progression Formula for Chess
 * - Win: +25 to +50 XP (scaled by performance and opponent XP)
 * - Loss: -12 to -24 XP (scaled by opponent rank)
 * - Draw: +5 XP
 */
export function calculateChessXpDelta(
  playerXp: number,
  opponentXp: number,
  result: 'win' | 'loss' | 'draw',
  movesCount: number = 25
): number {
  if (result === 'win') {
    const diff = Math.max(-300, Math.min(300, opponentXp - playerXp));
    const baseWinXp = 30;
    const diffBonus = Math.round(diff / 30);
    const speedBonus = movesCount < 30 ? 5 : 0;
    return Math.max(15, Math.min(55, baseWinXp + diffBonus + speedBonus));
  } else if (result === 'loss') {
    const diff = Math.max(-300, Math.min(300, playerXp - opponentXp));
    const baseLossXp = -18;
    const penalty = Math.round(diff / 40);
    return Math.min(-8, Math.max(-35, baseLossXp - penalty));
  } else {
    return 5;
  }
}

// Alias for backwards compatibility
export const calculateChessEloDelta = calculateChessXpDelta;

export function getXpTier(xp: number): ChessTier {
  if (xp < 1000) return 'Bronze';
  if (xp < 1300) return 'Silver';
  if (xp < 1600) return 'Gold';
  if (xp < 1900) return 'Platinum';
  if (xp < 2200) return 'Diamond';
  if (xp < 2500) return 'Master';
  if (xp < 2900) return 'Grandmaster';
  return 'Apex';
}

export const getChessTier = getXpTier;

export function getTierColor(tier: ChessTier | string): {
  badgeBg: string;
  badgeText: string;
  glowBorder: string;
} {
  switch (tier) {
    case 'Bronze':
      return {
        badgeBg: 'bg-amber-900/30 border-amber-700/50',
        badgeText: 'text-amber-400',
        glowBorder: 'border-amber-700',
      };
    case 'Silver':
      return {
        badgeBg: 'bg-slate-700/30 border-slate-400/50',
        badgeText: 'text-slate-300',
        glowBorder: 'border-slate-400',
      };
    case 'Gold':
      return {
        badgeBg: 'bg-yellow-900/30 border-yellow-500/50',
        badgeText: 'text-yellow-400',
        glowBorder: 'border-yellow-500',
      };
    case 'Platinum':
      return {
        badgeBg: 'bg-cyan-950/40 border-cyan-500/50',
        badgeText: 'text-cyan-300',
        glowBorder: 'border-cyan-500',
      };
    case 'Diamond':
      return {
        badgeBg: 'bg-blue-950/40 border-blue-400/50',
        badgeText: 'text-blue-300',
        glowBorder: 'border-blue-400',
      };
    case 'Master':
      return {
        badgeBg: 'bg-purple-950/40 border-purple-500/50',
        badgeText: 'text-purple-300',
        glowBorder: 'border-purple-500',
      };
    case 'Grandmaster':
      return {
        badgeBg: 'bg-rose-950/40 border-rose-500/50',
        badgeText: 'text-rose-300',
        glowBorder: 'border-rose-500',
      };
    case 'Apex':
    default:
      return {
        badgeBg: 'bg-emerald-950/40 border-emerald-400/60',
        badgeText: 'text-emerald-300',
        glowBorder: 'border-emerald-400',
      };
  }
}

/**
 * Ranked XP Delta for 2048
 * - Win (2048+ tile or high score threshold): +25 to +60 XP
 * - Loss (game over before threshold): -10 to -22 XP
 */
export function calculate2048XpDelta(
  currentXp: number,
  score: number,
  highestTile: number,
  moves: number,
  durationSeconds: number
): number {
  if (moves <= 10) return 0;

  if (highestTile >= 2048 || score >= 12000) {
    const tileMultiplier = highestTile >= 4096 ? 1.8 : highestTile >= 2048 ? 1.3 : 1.0;
    const efficiency = moves > 0 ? Math.min(2.0, (score / moves) / 10) : 1;
    const gainedXp = Math.round(28 * tileMultiplier * efficiency);
    return Math.max(20, Math.min(65, gainedXp));
  } else {
    // Loss or low run
    const lossPenalty = score < 2000 ? -20 : score < 5000 ? -15 : -10;
    return lossPenalty;
  }
}

export const calculate2048RatingDelta = calculate2048XpDelta;
