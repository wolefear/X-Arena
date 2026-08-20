import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Flame, ShieldAlert, Swords, X } from 'lucide-react';
import { sound } from '../utils/audio';

export const ForfeitModal: React.FC = () => {
  const { forfeitModalState, cancelForfeit, confirmForfeitAndLeave, activeMode } = useApp();

  if (!forfeitModalState.isOpen) return null;

  const isRanked = forfeitModalState.isRanked || activeMode === 'ranked';
  const xpPenalty = forfeitModalState.xpPenalty || (isRanked ? 50 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#080808] border-2 border-red-500/60 p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.25)] space-y-6">
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between border-b border-red-500/30 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 bg-red-950/80 border border-red-500 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-widest block">
                MATCH ABANDONMENT WARNING
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display">
                Forfeit Match?
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              cancelForfeit();
            }}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Content */}
        <div className="space-y-4">
          {isRanked ? (
            <div className="p-4 bg-red-950/30 border border-red-500/50 space-y-2.5">
              <div className="flex items-center space-x-2 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-red-400" />
                <span>Ranked Match In Progress</span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                If you leave or navigate away now, this match will be registered as an immediate <strong className="text-red-400">forfeit</strong>.
              </p>
              <div className="p-3 bg-black border border-red-500/40 flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-white/60">
                  Forfeit Rating Penalty (2x Loss):
                </span>
                <span className="text-base font-mono font-black text-red-400 animate-pulse">
                  -{xpPenalty} XP
                </span>
              </div>
              <p className="text-[11px] text-white/50 font-mono">
                *Standard match loss is ~{Math.round(xpPenalty / 2)} XP. Forfeiting penalizes you with double the XP loss.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-[#111] border border-white/15 space-y-2">
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                You have an active game session. Leaving now will discard your current board progress.
              </p>
              <p className="text-[11px] text-white/40 font-mono">
                Do you want to forfeit this session and navigate to another page?
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              cancelForfeit();
            }}
            className="w-full py-3.5 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition flex items-center justify-center space-x-2 shadow-lg active:scale-95"
          >
            <Swords className="w-4 h-4" />
            <span>Continue Playing</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              confirmForfeitAndLeave();
            }}
            className="w-full py-3.5 bg-red-950/60 hover:bg-red-900 border border-red-500 text-red-200 hover:text-white font-black text-xs uppercase tracking-tight transition flex items-center justify-center space-x-2 active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Forfeit & Leave {isRanked ? `(-${xpPenalty} XP)` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
