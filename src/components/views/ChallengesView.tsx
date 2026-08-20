import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Swords,
  CheckCircle2,
  Trophy,
  Flame,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { Challenge } from '../../types';

export const ChallengesView: React.FC = () => {
  const { challenges, completeChallenge, setCurrentView, setSelectedGame, setActiveMode, setActiveChallengeToPlay, showToast } = useApp();

  const handleStartDrill = (ch: Challenge) => {
    setActiveChallengeToPlay(ch);
    setSelectedGame(ch.game);
    setActiveMode('challenge');
    setCurrentView(ch.game);
    showToast(`Started tactical drill: ${ch.title}`, 'info');
  };

  const totalXpAvailable = challenges.reduce((acc, c) => acc + (c.rewardXp || 250), 0);

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#CCFF00] uppercase tracking-[0.3em]">
            <Swords className="w-4 h-4" />
            <span>Active Tactical Drills & Puzzles</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase mt-2 font-display">
            Ranked Challenges
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-2 max-w-2xl leading-relaxed">
            Sharpen your mastery with curated chess tactical puzzles and 2048 algorithmic speed drills to earn competitive XP.
          </p>
        </div>

        <div className="bg-black border border-white/15 px-5 py-3 flex items-center space-x-3 shrink-0">
          <div>
            <span className="text-[10px] text-white/40 uppercase font-mono font-bold block">
              Total XP Available
            </span>
            <span className="text-base font-black text-[#CCFF00] font-mono">
              +{totalXpAvailable.toLocaleString()} XP
            </span>
          </div>
          <Flame className="w-4 h-4 text-[#CCFF00]" />
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((ch) => {
          const isCompleted = ch.completed;
          return (
            <div
              key={ch.id}
              className={`border p-6 flex flex-col justify-between space-y-6 transition ${
                isCompleted
                  ? 'border-[#CCFF00]/60 bg-[#0A0A0A] shadow-lg shadow-[#CCFF00]/5'
                  : 'border-white/10 bg-[#0A0A0A] hover:border-white/30'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-white/10 text-[#CCFF00] border border-white/10">
                    {ch.game === 'chess' ? '♟️ CHESS' : '⚡ 2048'} • {ch.difficulty.toUpperCase()}
                  </span>
                  {isCompleted ? (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-[#CCFF00] text-black">
                      COMPLETED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-white/40 uppercase">ACTIVE DRILL</span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-white/60 mt-1.5 leading-relaxed">{ch.description}</p>
                </div>

                <div className="bg-black/60 border border-white/10 p-3 space-y-1 text-xs">
                  <div className="text-[10px] font-mono text-white/40 uppercase">Objective:</div>
                  <div className="text-xs text-white font-medium">{ch.objective}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="font-mono">
                  <span className="text-[10px] text-white/40 uppercase block">Reward</span>
                  <span className="text-base font-black text-[#CCFF00]">
                    +{ch.rewardXp} XP
                  </span>
                </div>

                {isCompleted ? (
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-[#CCFF00] font-bold uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartDrill(ch)}
                    className="px-4 py-2.5 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition flex items-center space-x-1.5 active:scale-95"
                  >
                    <span>Start Drill</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
