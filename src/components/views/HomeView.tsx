import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Trophy,
  Swords,
  Bot,
  Zap,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
  Award,
  Activity,
  Coins,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { subscribeOkbPrice, OkbMarketPrice } from '../../utils/web3OnChain';

export const HomeView: React.FC = () => {
  const {
    user,
    setCurrentView,
    startQuickMatch,
    leaderboard,
    events,
    aiAgents,
    isConnected,
    setIsWalletModalOpen,
  } = useApp();

  const [okbPrice, setOkbPrice] = useState<OkbMarketPrice>({
    priceUsd: 105.65,
    change24h: 4.05,
    lastUpdated: Date.now(),
  });

  // Subscribe to real-time OKB price ticks
  useEffect(() => {
    const unsubscribe = subscribeOkbPrice((price) => {
      setOkbPrice(price);
    });
    return () => unsubscribe();
  }, []);

  const featuredEvent = events && events.length > 0 ? (events.find((e) => e.featured) || events[0]) : null;

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Arena Section — Bold Typography Showcase */}
      <div className="border border-white/10 bg-[#050505] grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-2xl">
        {/* Left Column: Massive Headline & Active Gauntlet */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 space-y-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-[10px] bg-[#CCFF00] text-black px-2.5 py-0.5 font-black uppercase tracking-wider">
                Phase 1: Live
              </span>
              <span className="text-[#CCFF00] text-xs font-bold uppercase tracking-[0.3em]">
                Active Gauntlet
              </span>
            </div>

            <h1 className="text-3xl sm:text-6xl lg:text-[88px] leading-[0.92] font-black uppercase tracking-tighter text-white font-display">
              Play.<br />
              Compete.<br />
              <span className="text-[#CCFF00] italic">Win.</span>
            </h1>

            <p className="mt-4 sm:mt-6 text-white/60 max-w-lg text-xs sm:text-base leading-relaxed">
              X ARENA is the apex competitive ecosystem where human grandmasters and neural AI agents duel across Chess and 2048 with on-chain settlement on X Layer.
            </p>
          </div>

          <div className="pt-5 sm:pt-6 border-t border-white/10 flex flex-wrap items-end justify-between gap-4 sm:gap-6">
            <div className="flex items-end">
              <div>
                <div className="text-[9px] sm:text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1 font-mono flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                  <span>Real-Time 1 OKB Price (USD)</span>
                </div>
                <div className="text-3xl sm:text-5xl font-mono font-black italic text-white flex items-baseline space-x-3">
                  <span>${okbPrice.priceUsd.toFixed(2)}</span>
                  <span className={`text-[10px] sm:text-xs font-mono font-black uppercase not-italic px-2 py-0.5 border ${
                    okbPrice.change24h >= 0
                      ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40 text-[#CCFF00]'
                      : 'bg-red-500/10 border-red-500/40 text-red-400'
                  }`}>
                    {okbPrice.change24h >= 0 ? `+${okbPrice.change24h.toFixed(2)}%` : `${okbPrice.change24h.toFixed(2)}%`} (24H)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                id="hero-btn-match"
                onClick={() => {
                  sound.playClick();
                  if (!isConnected) {
                    setIsWalletModalOpen(true);
                  } else {
                    setCurrentView('ranked');
                  }
                }}
                className="w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition shadow-lg flex items-center justify-center space-x-2"
              >
                <Flame className="w-4 h-4" />
                <span>{isConnected ? 'Enter Ranked Match' : 'Connect to Enter Ranked'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Game Selector & Live Apex Standings */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#080808]">
          {/* Game Select Cards */}
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="flex justify-between items-center mb-5">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest font-mono">
                Select Game Arena
              </span>
              <span className="text-[10px] text-[#CCFF00] uppercase font-mono font-bold">
                2 Games Live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chess Card */}
              <div
                id="home-card-chess"
                onClick={() => {
                  sound.playClick();
                  setCurrentView('chess');
                }}
                className="border border-white/10 p-5 relative overflow-hidden group cursor-pointer bg-[#0A0A0A] hover:border-[#CCFF00] transition"
              >
                <div className="absolute right-[-8px] top-[-12px] text-6xl font-black text-white/5 select-none font-display">
                  01
                </div>
                <div className="text-base font-black uppercase tracking-tight text-white group-hover:text-[#CCFF00] transition font-display">
                  ♟️ Chess
                </div>
                <div className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider font-mono">
                  Ranked Chess
                </div>
                <div className="mt-10 flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-xs font-mono font-bold text-white/80">
                    {isConnected ? `${user.chessRating} XP` : 'XP Locked'}
                  </span>
                  <span className="text-[#CCFF00] text-xs font-bold font-mono group-hover:translate-x-1 transition-transform">
                    PLAY &rarr;
                  </span>
                </div>
              </div>

              {/* 2048 Card */}
              <div
                id="home-card-2048"
                onClick={() => {
                  sound.playClick();
                  setCurrentView('2048');
                }}
                className="border border-white/10 p-5 relative overflow-hidden group cursor-pointer bg-[#0A0A0A] hover:border-[#CCFF00] transition"
              >
                <div className="absolute right-[-8px] top-[-12px] text-6xl font-black text-white/5 select-none font-display">
                  02
                </div>
                <div className="text-base font-black uppercase tracking-tight text-white group-hover:text-[#CCFF00] transition font-display">
                  ⚡ 2048
                </div>
                <div className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider font-mono">
                  Velocity Gauntlet
                </div>
                <div className="mt-10 flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-xs font-mono font-bold text-white/80">
                    {isConnected ? `${user.score2048Rating} XP` : 'XP Locked'}
                  </span>
                  <span className="text-[#CCFF00] text-xs font-bold font-mono group-hover:translate-x-1 transition-transform">
                    PLAY &rarr;
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Standings Board */}
          <div className="p-6 sm:p-8 bg-[#050505]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest font-mono">
                Live Apex Standings
              </span>
              <button
                onClick={() => setCurrentView('leaderboard')}
                className="text-[10px] text-[#CCFF00] uppercase font-bold tracking-wider hover:underline"
              >
                View Full Hall of Fame &rarr;
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {leaderboard.slice(0, 4).map((entry, idx) => (
                <div
                  key={entry.userId || entry.id || `lb_entry_${idx}`}
                  className={`flex items-center justify-between border-b border-white/5 pb-2.5 ${
                    entry.username.includes(user.username) ? 'bg-white/5 -mx-2 px-2 py-1 border-white/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="opacity-40 text-[10px] shrink-0">0{idx + 1}</span>
                    <span className="font-bold text-white tracking-tight uppercase text-xs truncate">
                      {entry.username}
                      {entry.isAi && <span className="ml-1 text-[9px] text-purple-400">[AI]</span>}
                    </span>
                  </div>
                  <span className="text-[#CCFF00] font-black shrink-0">{entry.chessRating} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Platform Feature Pillars — Horizontal Scroll on Mobile/Tablet (Hidden Scrollbar) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between lg:hidden px-1">
          <span className="text-[9px] sm:text-[10px] text-white/40 uppercase font-mono font-bold tracking-widest">
            Game Modes & Features
          </span>
          <span className="text-[9px] sm:text-[10px] text-[#CCFF00] uppercase font-mono">
            Swipe &rarr;
          </span>
        </div>
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-3 sm:gap-4 pb-1 no-scrollbar snap-x">
          {/* Pillar 1: Ranked Matchmaking */}
          <div
            onClick={() => setCurrentView('ranked')}
            className="w-[260px] sm:w-[300px] shrink-0 lg:w-auto snap-start border border-white/10 bg-[#0A0A0A] p-5 sm:p-6 hover:border-[#CCFF00] transition cursor-pointer group flex flex-col justify-between space-y-5"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black border border-white/15 flex items-center justify-center text-[#CCFF00]">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-display">
                PvP Ranked Queues
              </h3>
              <p className="text-[11px] sm:text-xs text-white/50 leading-relaxed">
                Skill-calibrated matchmaking for Chess & 2048 with instant tier delta calculations.
              </p>
            </div>
            <div className="text-[11px] sm:text-xs font-mono text-[#CCFF00] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              Enter Matchmaking &rarr;
            </div>
          </div>

          {/* Pillar 2: Prize Events & Escrows */}
          <div
            onClick={() => setCurrentView('events')}
            className="w-[260px] sm:w-[300px] shrink-0 lg:w-auto snap-start border border-white/10 bg-[#0A0A0A] p-5 sm:p-6 hover:border-[#CCFF00] transition cursor-pointer group flex flex-col justify-between space-y-5"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black border border-white/15 flex items-center justify-center text-[#CCFF00]">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-display">
                Smart Escrow Tournaments
              </h3>
              <p className="text-[11px] sm:text-xs text-white/50 leading-relaxed">
                Swiss and knockout cups funded in USDC with automated prize smart contracts.
              </p>
            </div>
            <div className="text-[11px] sm:text-xs font-mono text-[#CCFF00] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              Browse Prize Cups &rarr;
            </div>
          </div>

          {/* Pillar 3: AI Arena & Bot Duels */}
          <div
            onClick={() => setCurrentView('ai-arena')}
            className="w-[260px] sm:w-[300px] shrink-0 lg:w-auto snap-start border border-white/10 bg-[#0A0A0A] p-5 sm:p-6 hover:border-[#CCFF00] transition cursor-pointer group flex flex-col justify-between space-y-5"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black border border-white/15 flex items-center justify-center text-[#CCFF00]">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-display">
                Neural Agent Roster
              </h3>
              <p className="text-[11px] sm:text-xs text-white/50 leading-relaxed">
                Duel 6 specialized AI bots or run high-speed bot-vs-bot live simulation battles.
              </p>
            </div>
            <div className="text-[11px] sm:text-xs font-mono text-[#CCFF00] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              Challenge AI Bots &rarr;
            </div>
          </div>

          {/* Pillar 4: Daily Tactical Challenges */}
          <div
            onClick={() => setCurrentView('challenges')}
            className="w-[260px] sm:w-[300px] shrink-0 lg:w-auto snap-start border border-white/10 bg-[#0A0A0A] p-5 sm:p-6 hover:border-[#CCFF00] transition cursor-pointer group flex flex-col justify-between space-y-5"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black border border-white/15 flex items-center justify-center text-[#CCFF00]">
                <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-display">
                Daily Drills & Bounties
              </h3>
              <p className="text-[11px] sm:text-xs text-white/50 leading-relaxed">
                Solve tactical checkmate puzzles and speed-run tile synthesis to earn XP and USDC.
              </p>
            </div>
            <div className="text-[11px] sm:text-xs font-mono text-[#CCFF00] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              Start Daily Drills &rarr;
            </div>
          </div>
        </div>
      </div>

      {/* 3. Featured Active Event Spotlight or Ranked Season Banner */}
      {featuredEvent ? (
        <div className="border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 shadow-xl">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#CCFF00] text-black">
                FEATURED TOURNAMENT
              </span>
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                X Layer Smart Escrow
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
              {featuredEvent.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              {featuredEvent.description || 'Competitive tournament on X Layer. Register and claim verified on-chain prize distributions.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shrink-0">
            <div className="bg-black border border-white/15 p-4 text-center sm:text-left">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block font-mono">
                Guaranteed Pool
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-[#CCFF00]">
                ${(featuredEvent.prizePoolUsdc || 0).toLocaleString()} USDC
              </span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setCurrentView('events');
              }}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition text-center"
            >
              Enter Tournament &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 shadow-xl">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#CCFF00] text-black">
                RANKED SEASON LIVE
              </span>
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                Real-Time Elo & Tier Progression
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
              Compete on X Layer zkEVM
            </h2>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Battle in rated Chess and 2048 matches to ascend the global leaderboards. All match statistics and ratings persist securely on-chain and to your verified profile.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                setCurrentView('ranked');
              }}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition text-center font-mono"
            >
              Enter Ranked Ladder &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
