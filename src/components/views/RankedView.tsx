import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Swords,
  Clock,
  ShieldCheck,
  TrendingUp,
  User,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { getTierColor } from '../../utils/elo';

export const RankedView: React.FC = () => {
  const { user, isConnected, setIsWalletModalOpen, startQuickMatch, setCurrentView, showToast } = useApp();

  const [selectedGame, setSelectedGame] = useState<'chess' | '2048'>('chess');
  const [selectedTimeControl, setSelectedTimeControl] = useState<string>('5+0 Blitz');
  const [isQueueing, setIsQueueing] = useState<boolean>(false);
  const [queueTimer, setQueueTimer] = useState<number>(0);
  const [foundMatch, setFoundMatch] = useState<{
    opponentName: string;
    opponentRating: number;
    game: 'chess' | '2048';
  } | null>(null);

  // Queue interval timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isQueueing) {
      interval = setInterval(() => {
        setQueueTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isQueueing]);

  // Simulate opponent discovery and AUTO-ENTER immediately
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isQueueing) {
      const waitTime = Math.floor(Math.random() * 1800) + 2000;
      timeout = setTimeout(() => {
        setIsQueueing(false);
        setQueueTimer(0);
        sound.playMatchFound();

        const fakeOpponents = [
          { name: 'Valkyrie_GM', rating: 1680 },
          { name: 'KryptoKnight_99', rating: 1450 },
          { name: 'GridMaster_X', rating: 1520 },
          { name: 'VoidWalker_99', rating: 1600 },
        ];
        const opp = fakeOpponents[Math.floor(Math.random() * fakeOpponents.length)];

        setFoundMatch({
          opponentName: opp.name,
          opponentRating: opp.rating,
          game: selectedGame,
        });

        // Auto enter the match immediately without waiting for extra click
        const autoEnterTimer = setTimeout(() => {
          startQuickMatch(selectedGame, opp.name, opp.rating);
        }, 800);

        return () => clearTimeout(autoEnterTimer);
      }, waitTime);
    }
    return () => clearTimeout(timeout);
  }, [isQueueing, selectedGame, startQuickMatch]);

  const handleStartQueue = () => {
    if (!isConnected) {
      setIsWalletModalOpen(true);
      showToast('Connect wallet to register ranked matchmaking signature.', 'info');
      return;
    }
    sound.playClick();
    setFoundMatch(null);
    setIsQueueing(true);
  };

  const handleCancelQueue = () => {
    sound.playClick();
    setIsQueueing(false);
    setQueueTimer(0);
  };

  const chessTierStyle = getTierColor(user.chessTier);
  const tier2048Style = getTierColor(user.tier2048 || 'Gold');

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 min-w-0 max-w-full">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] sm:tracking-[0.3em]">
          <Flame className="w-4 h-4 shrink-0" />
          <span>Competitive Ranked Matchmaking</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase mt-2 font-display break-words">
          Ranked Arena
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-2 max-w-2xl leading-relaxed">
          Duel global contenders in skill-calibrated queues. Chess features Elo rating progression (+20W / +5D / -15L), while 2048 features permanent highest-tile milestone unlocks (never decreases on game loss).
        </p>
      </div>

      {/* Tier Overview Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chess Ranked Banner */}
        <div
          onClick={() => setSelectedGame('chess')}
          className={`border p-5 sm:p-6 cursor-pointer transition ${
            selectedGame === 'chess'
              ? 'border-[#CCFF00] bg-[#0A0A0A] shadow-lg shadow-[#CCFF00]/5'
              : 'border-white/10 bg-black hover:border-white/30'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <span className="text-2xl sm:text-3xl shrink-0">♟️</span>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight font-display truncate">
                  Chess Masters
                </h3>
                <span className="text-[10px] text-white/40 uppercase font-mono tracking-wider block truncate">
                  Win: +20 • Draw: +5 • Loss: -15
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-[#CCFF00] text-black font-mono shrink-0">
              {user.chessTier}
            </span>
          </div>

          <div className="mt-4 flex items-baseline space-x-2 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-white">{user.chessRating}</span>
            <span className="text-xs text-[#CCFF00] font-bold">XP</span>
          </div>
        </div>

        {/* 2048 Ranked Banner */}
        <div
          onClick={() => setSelectedGame('2048')}
          className={`border p-5 sm:p-6 cursor-pointer transition ${
            selectedGame === '2048'
              ? 'border-[#CCFF00] bg-[#0A0A0A] shadow-lg shadow-[#CCFF00]/5'
              : 'border-white/10 bg-black hover:border-white/30'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <span className="text-2xl sm:text-3xl shrink-0">⚡</span>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight font-display truncate">
                  2048 Tile Milestones
                </h3>
                <span className="text-[10px] text-white/40 uppercase font-mono tracking-wider block truncate">
                  Max: {user.stats2048?.highestTile || 0} • Never Decreases on Loss
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-[#CCFF00] text-black font-mono shrink-0">
              {user.tier2048 || 'Gold'}
            </span>
          </div>

          <div className="mt-4 flex items-baseline space-x-2 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-white">{user.score2048Rating}</span>
            <span className="text-xs text-[#CCFF00] font-bold">XP</span>
          </div>
        </div>
      </div>

      {/* Main Queue Launcher Panel */}
      <div className="border border-white/10 bg-[#0A0A0A] p-5 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 shadow-xl min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display truncate">
              {selectedGame === 'chess' ? '♟️ Chess Ranked Queue' : '⚡ 2048 Velocity Sprint'}
            </h2>
            <p className="text-xs text-white/50 mt-1 font-mono">
              Matching contenders around your XP ({selectedGame === 'chess' ? user.chessRating : user.score2048Rating} XP)
            </p>
          </div>

          {/* Time Controls */}
          {selectedGame === 'chess' && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {['1+0 Bullet', '3+0 Blitz', '5+0 Blitz', '10+0 Rapid'].map((tc) => (
                <button
                  key={tc}
                  onClick={() => setSelectedTimeControl(tc)}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold uppercase transition ${
                    selectedTimeControl === tc
                      ? 'bg-white text-black'
                      : 'bg-black text-white/50 border border-white/10 hover:text-white'
                  }`}
                >
                  {tc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Match Finding / Auto Enter State */}
        {foundMatch ? (
          <div className="bg-black border-2 border-[#CCFF00] p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <span className="text-[10px] font-black uppercase px-3 py-1 bg-[#CCFF00] text-black font-mono tracking-widest animate-pulse">
              MATCH FOUND • ENTERING ARENA...
            </span>
            <div className="flex items-center justify-center space-x-6 sm:space-x-10">
              <div className="text-right min-w-0">
                <span className="text-xs sm:text-sm font-black text-white uppercase block truncate">{user.username}</span>
                <span className="text-xs font-mono text-[#CCFF00]">
                  {selectedGame === 'chess' ? user.chessRating : user.score2048Rating} XP
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black text-white/30 font-display">VS</div>

              <div className="text-left min-w-0">
                <span className="text-xs sm:text-sm font-black text-white uppercase block truncate">{foundMatch.opponentName}</span>
                <span className="text-xs font-mono text-[#CCFF00]">{foundMatch.opponentRating} XP</span>
              </div>
            </div>

            <div className="text-xs font-mono text-white/50">
              Launching rated game automatically...
            </div>
          </div>
        ) : isQueueing ? (
          <div className="bg-black border border-white/20 p-8 sm:p-12 text-center space-y-6">
            <div className="w-12 h-12 border-4 border-[#CCFF00] border-t-transparent animate-spin mx-auto" />
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-display">
                Searching for Contender...
              </h3>
              <p className="text-xs font-mono text-white/40 mt-1">
                Queue Time: {queueTimer}s • Matching ranked contenders
              </p>
            </div>
            <button
              onClick={handleCancelQueue}
              className="px-6 py-2.5 bg-[#0A0A0A] hover:bg-red-950/40 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider"
            >
              Cancel Matchmaking
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-black p-5 sm:p-6 border border-white/10">
            <div className="space-y-1 min-w-0">
              <span className="text-sm font-black text-white uppercase tracking-tight font-display block">
                Ready for Competitive Dispatch
              </span>
              <p className="text-xs text-white/50 font-mono">
                Entry: Free Ranked Queue • Gain XP on Win (+30-50 XP), Lose XP on Loss (-15-25 XP)
              </p>
            </div>

            <button
              onClick={handleStartQueue}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition shrink-0"
            >
              Find Ranked Match &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
