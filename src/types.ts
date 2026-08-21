export type GameType = 'chess' | '2048';
export type GameMode = 'play' | 'challenge' | 'ranked' | 'events';
export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';

export type ChessTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Apex';

export interface UserProfile {
  id: string;
  walletAddress: string;
  username: string;
  avatar: string;
  title: string;
  bio: string;
  joinedDate: string;
  balanceUsdt: number;
  balanceUsdc: number;
  balanceOkb: number;
  totalPrizesWonUsdc: number;
  totalPrizesWonUsdt?: number;
  globalRank: number;
  chessRating: number;
  chessPeakRating: number;
  chessTier: ChessTier;
  chessStats: {
    wins: number;
    losses: number;
    draws: number;
    streak: number;
  };
  score2048Rating: number;
  score2048PeakRating: number;
  bestScore2048: number;
  tier2048?: string;
  stats2048: {
    gamesPlayed: number;
    wins2048: number; // reached 2048+
    highestTile: number;
    streak: number;
  };
  achievements: string[]; // achievement IDs
  isCreator: boolean;
  isAdmin: boolean;
}

export interface MatchRecord {
  id: string;
  game: GameType;
  mode: GameMode;
  date: string;
  playerScore?: number;
  opponentName: string;
  opponentAvatar?: string;
  opponentRating?: number;
  isAiOpponent: boolean;
  result: 'win' | 'loss' | 'draw';
  ratingDelta: number;
  movesCount: number;
  durationSeconds: number;
  highestTile?: number;
  pgnOrMoves?: string[];
  eventId?: string;
  accuracyPercent?: number;
  rewardsEarnedUsdc?: number;
}

export interface AIAgent {
  id: string;
  name: string;
  avatar: string;
  title: string;
  game: GameType | 'all';
  difficulty: DifficultyLevel;
  rating: number;
  winRate: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  personality: string;
  specialty: string;
  catchphrase: string;
  colorTheme: string;
  isAvailable: boolean;
}

export interface EventPrizeTier {
  place: string; // e.g. "1st", "2nd-3rd", "4th-10th"
  amountUsdc: number;
  percentage: number;
}

export interface EventParticipant {
  userId: string;
  username: string;
  avatar: string;
  walletAddress: string;
  score: number;
  rank: number;
  joinedAt: string;
  rewardClaimed?: boolean;
}

export interface ArenaEvent {
  id: string;
  title: string;
  game: GameType;
  mode: GameMode;
  format?: 'swiss' | 'single_elimination' | 'leaderboard_sprint' | string;
  difficulty?: DifficultyLevel;
  bannerGradient: string;
  description: string;
  rules: string[];
  scoringSystem: string;
  prizeCurrency?: 'USDC' | 'OKB' | 'BOTH';
  entryFeeUsdc: number;
  entryFeeOkb?: number;
  prizePoolUsdc: number;
  prizePoolOkb?: number;
  prizePoolXp?: number;
  sponsorName?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  isOfficial: boolean;
  status: 'active' | 'upcoming' | 'completed';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipantsCount: number;
  participants: EventParticipant[];
  prizeDistribution: EventPrizeTier[];
  featured?: boolean;
  isUserRegistered?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  game: GameType;
  difficulty: DifficultyLevel;
  description: string;
  objective: string;
  handicapDescription?: string;
  targetScore?: number;
  moveLimit?: number;
  timeLimitSeconds?: number;
  rewardUsdc: number;
  rewardXp: number;
  tags: string[];
  isAiGenerated?: boolean;
  creatorName?: string;
  completed?: boolean;
}

export interface LeaderboardEntry {
  id?: string;
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  walletAddress: string;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  tier: string;
  isAi?: boolean;
  highestTile?: number;
  bestScore?: number;
  prizesWonUsdc?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'chess' | '2048' | 'events' | 'ai' | 'general';
  xp: number;
  rewardUsdc?: number;
  unlockedAt?: string;
}

export interface Web3Transaction {
  id: string;
  hash: string;
  type: 'event_entry' | 'prize_claim' | 'faucet' | 'creator_payout';
  amountUsdc: number;
  currency: 'USDC' | 'OKB';
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
  explorerUrl: string;
}

export interface MatchAnalysisResult {
  summary: string;
  accuracy: number;
  keyTurningPoint: string;
  playerStrengths: string[];
  playerWeaknesses: string[];
  proTip: string;
  mvpPiece?: string;
}
