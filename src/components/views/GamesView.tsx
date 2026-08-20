import React from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, Flame, Trophy, Swords, Bot, Sparkles, ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';
import { sound } from '../../utils/audio';

export const GamesView: React.FC = () => {
  const { setCurrentView, user, showToast } = useApp();

  const games = [
    {
      id: 'chess',
      code: '01',
      title: 'Chess',
      status: 'Live Launch Game',
      category: 'Board Strategy • Ranked Chess',
      description:
        'Standard 64-square competitive chess with move validation, en passant, castling, promotion, bullet/blitz/rapid time controls, live AI evaluations, and post-game tactical review.',
      tag: 'RANKED & CASUAL',
      rating: `${user.chessRating} XP`,
      tier: user.chessTier,
      activeMatches: 412,
      features: ['PvP & AI Modes', 'Bullet, Blitz, Rapid', 'Live AI Eval Bar', 'Tactical Post-Match Review'],
      icon: '♟️',
      color: 'from-amber-500/20 to-orange-500/5',
      accentColor: 'border-[#CCFF00]/40',
      actionText: 'Enter Chess Arena',
    },
    {
      id: '2048',
      code: '02',
      title: '2048',
      status: 'Live Launch Game',
      category: 'Algorithmic Speed Puzzle',
      description:
        'Fast-paced competitive 2048 with swipe physics, speed multipliers, milestone bonuses, anti-macro validation, and algorithmic breakdown of tile monotonicity and corner stability.',
      tag: 'SPEED & SKILL',
      rating: `${user.score2048Rating} XP`,
      tier: user.tier2048,
      activeMatches: 628,
      features: ['High-Speed Grid Engine', 'Anti-Macro Integrity', 'Dynamic Multiplier', 'Tactical Run Optimization'],
      icon: '⚡',
      color: 'from-cyan-500/20 to-blue-500/5',
      accentColor: 'border-[#CCFF00]/40',
      actionText: 'Enter 2048 Arena',
    },
    {
      id: 'go',
      code: '03',
      title: 'Go (Weiqi)',
      status: 'Phase 2 Pipeline',
      category: 'Territory Strategy',
      description:
        'Ancient territory board game on 19x19 grids. Featuring AlphaGo-inspired neural evaluation, territory calculations, and smart contract escrow.',
      tag: 'IN DEVELOPMENT',
      rating: '1500 XP',
      tier: 'Coming Soon',
      activeMatches: 0,
      features: ['19x19 & 9x9 Grids', 'Territory AI Score', 'Komi Settings', 'Tournament Brackets'],
      icon: '⚪',
      color: 'from-purple-500/20 to-indigo-500/5',
      accentColor: 'border-white/10 opacity-70',
      actionText: 'Preview Specs',
    },
    {
      id: 'poker',
      code: '04',
      title: 'Texas Hold\'em Poker',
      status: 'Phase 2 Pipeline',
      category: 'Imperfect Information & GTO',
      description:
        'Provably fair mental poker with zero-knowledge shuffles, GTO bots, ring games, and multi-table tournaments on X Layer.',
      tag: 'IN DEVELOPMENT',
      rating: '1500 XP',
      tier: 'Coming Soon',
      activeMatches: 0,
      features: ['ZK Card Shuffling', 'GTO Neural Bots', 'Micro-Stakes to High', 'Single/Multi Table'],
      icon: '♠️',
      color: 'from-emerald-500/20 to-teal-500/5',
      accentColor: 'border-white/10 opacity-70',
      actionText: 'Preview Specs',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-[#CCFF00] uppercase tracking-[0.3em]">
          <Layers className="w-4 h-4" />
          <span>Competitive Game Directory</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase mt-2 font-display">
          Arena Games
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-2 max-w-2xl leading-relaxed">
          Launch ecosystem featuring full server-authoritative integrity, anti-cheat validation, and instant rating synchronization.
        </p>
      </div>

      {/* Grid of Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {games.map((g) => {
          const isPlayable = g.id === 'chess' || g.id === '2048';
          return (
            <div
              key={g.id}
              className={`border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden transition ${
                isPlayable ? 'hover:border-[#CCFF00]' : 'opacity-80'
              }`}
            >
              {/* Massive Watermark Digit */}
              <div className="absolute right-4 top-2 text-8xl font-black text-white/5 select-none font-display pointer-events-none">
                {g.code}
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{g.icon}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 uppercase bg-white/10 text-white/80 border border-white/10">
                    {g.tag}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display">
                    {g.title}
                  </h2>
                  <p className="text-[11px] font-mono text-[#CCFF00] uppercase tracking-wider mt-1">
                    {g.category}
                  </p>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">{g.description}</p>

                {/* Feature Chips */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {g.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="bg-black p-2 border border-white/5 text-[10px] text-white/70 font-mono flex items-center space-x-1.5"
                    >
                      <span className="text-[#CCFF00] font-bold">✓</span>
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating & Action Bottom */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest block font-mono">
                    Your Standing
                  </span>
                  <span className="text-base font-mono font-bold text-white">{g.rating}</span>
                </div>

                {isPlayable ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setCurrentView(g.id);
                    }}
                    className="px-6 py-3 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition active:scale-95"
                  >
                    {g.actionText} &rarr;
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sound.playClick();
                      showToast(`${g.title} is in development for Phase 2 pipeline.`, 'info');
                    }}
                    className="text-xs font-mono uppercase text-white/40 hover:text-white px-3 py-1.5 border border-white/10 hover:border-white/30 transition flex items-center space-x-1.5 active:scale-95"
                  >
                    <Lock className="w-3 h-3 text-white/40" />
                    <span>In Development</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
