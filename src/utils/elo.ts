import { ChessTier } from '../types';

/**
 * 2048 Highest-Tile Achievement Milestone Progression Table
 * 128: +5
 * 256: +10
 * 512: +20
 * 1024: +35
 * 2048: +55
 * 4096: +80
 * 8192: +110
 * 16384: +145
 * 32768: +185
 */
export const TILE_2048_MILESTONES: { tile: number; points: number }[] = [
  { tile: 128, points: 5 },
  { tile: 256, points: 10 },
  { tile: 512, points: 20 },
  { tile: 1024, points: 35 },
  { tile: 2048, points: 55 },
  { tile: 4096, points: 80 },
  { tile: 8192, points: 110 },
  { tile: 16384, points: 145 },
  { tile: 32768, points: 185 },
];

/**
 * Calculates new progression points for a completed Ranked 2048 game.
 * Rule: Ranked 2048 rank can NEVER decrease from a normal game over / loss.
 * Progression is awarded strictly when achieving a new, previously unreached milestone tile.
 */
export function calculate2048RankedProgression(
  prevHighestTile: number,
  currentMatchHighestTile: number
): { pointsDelta: number; newHighestTile: number; newMilestonesUnlocked: number[] } {
  if (currentMatchHighestTile <= prevHighestTile) {
    return {
      pointsDelta: 0,
      newHighestTile: prevHighestTile,
      newMilestonesUnlocked: [],
    };
  }

  let pointsDelta = 0;
  const newMilestonesUnlocked: number[] = [];

  for (const milestone of TILE_2048_MILESTONES) {
    if (milestone.tile > prevHighestTile && milestone.tile <= currentMatchHighestTile) {
      pointsDelta += milestone.points;
      newMilestonesUnlocked.push(milestone.tile);
    }
  }

  return {
    pointsDelta,
    newHighestTile: currentMatchHighestTile,
    newMilestonesUnlocked,
  };
}

/**
 * Competitive Rating Formula for Ranked Chess
 * - Win: +20 points
 * - Draw: +5 points
 * - Normal Loss: -15 points
 * - Forfeit: -30 points
 */
export function calculateChessRatingDelta(
  result: 'win' | 'loss' | 'draw',
  isForfeit: boolean = false
): number {
  if (isForfeit) {
    return -30;
  }
  if (result === 'win') {
    return 20;
  }
  if (result === 'draw') {
    return 5;
  }
  return -15;
}

// Backwards compatibility alias
export function calculateChessXpDelta(
  playerXp: number,
  opponentXp: number,
  result: 'win' | 'loss' | 'draw',
  movesCount: number = 25,
  isForfeit: boolean = false
): number {
  return calculateChessRatingDelta(result, isForfeit);
}

export const calculateChessEloDelta = calculateChessXpDelta;

export function getXpTier(xp: number): ChessTier {
  if (xp < 200) return 'Bronze';
  if (xp < 500) return 'Silver';
  if (xp < 900) return 'Gold';
  if (xp < 1400) return 'Platinum';
  if (xp < 2000) return 'Diamond';
  if (xp < 2800) return 'Master';
  if (xp < 3800) return 'Grandmaster';
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
 * 2048 XP Delta Calculation
 * For Ranked 2048: Calls calculate2048RankedProgression (points strictly based on new highest tile reached)
 * Normal 2048: 0 ranked progression
 */
export function calculate2048XpDelta(
  currentScore2048Rating: number,
  score: number,
  highestTile: number,
  moves: number,
  durationSeconds: number,
  prevHighestTile: number = 0,
  isRanked: boolean = true,
  isForfeit: boolean = false
): number {
  if (isForfeit) {
    return isRanked ? -30 : 0;
  }
  if (!isRanked) {
    return 0;
  }
  const { pointsDelta } = calculate2048RankedProgression(prevHighestTile, highestTile);
  return pointsDelta;
}

export const calculate2048RatingDelta = calculate2048XpDelta;

