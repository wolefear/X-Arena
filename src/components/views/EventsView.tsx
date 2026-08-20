import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Flame,
  Zap,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { ArenaEvent } from '../../types';

export const EventsView: React.FC = () => {
  const { user, events, joinEvent, isConnected, setIsWalletModalOpen, showToast, setCurrentView, setActiveEventToPlay, setSelectedGame, setActiveMode } = useApp();

  const [selectedTab, setSelectedTab] = useState<'all' | 'chess' | '2048'>('all');
  const [selectedEventModal, setSelectedEventModal] = useState<ArenaEvent | null>(null);

  const filteredEvents = events.filter((evt) => {
    if (selectedTab === 'all') return true;
    return evt.game === selectedTab;
  });

  const handleStartTournamentMatch = (evt: ArenaEvent) => {
    setActiveEventToPlay(evt);
    setSelectedGame(evt.game);
    setActiveMode('events');
    setCurrentView(evt.game);
    showToast(`Entering tournament round for ${evt.title}`, 'info');
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#CCFF00] uppercase tracking-[0.3em]">
            <Trophy className="w-4 h-4" />
            <span>Tournaments, Cups & Prize Escrow</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase mt-2 font-display">
            Official Events
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-2 max-w-2xl leading-relaxed">
            Compete in smart contract-backed Swiss cups, single-elimination brackets, and leaderboard sprints funded in USDC on X Layer.
          </p>
        </div>

        <div className="bg-black border border-white/15 px-5 py-3 flex items-center space-x-3 shrink-0">
          <div>
            <span className="text-[10px] text-white/40 uppercase font-mono font-bold block">
              Total Escrow Vault
            </span>
            <span className="text-base font-black text-[#CCFF00] font-mono block">$19,500 USDC</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
        {(['all', 'chess', '2048'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              sound.playClick();
              setSelectedTab(tab);
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition ${
              selectedTab === tab
                ? 'bg-white text-black'
                : 'bg-black text-white/50 hover:text-white border border-white/10'
            }`}
          >
            {tab === 'all' ? 'All Tournaments' : tab === 'chess' ? '♟️ Chess Cups' : '⚡ 2048 Cups'}
          </button>
        ))}
      </div>

      {/* Events Grid / Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="border border-dashed border-white/20 bg-[#0A0A0A] p-12 text-center space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-12 h-12 bg-black border border-white/20 mx-auto flex items-center justify-center text-[#CCFF00]">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">
            No Active Events Currently
          </h3>
          <p className="text-xs text-white/50 leading-relaxed max-w-md mx-auto">
            There are no active competitive events or prize cups running at this moment. Stay tuned for upcoming brackets or create your own custom tournament in the Admin Suite.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentView('ranked')}
              className="px-6 py-2.5 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition"
            >
              Play Ranked Queue &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const isRegistered = evt.isUserRegistered || evt.participants.some((p) => p.userId === user.id);
            const formatDisplay = (evt.format || 'swiss').replace(/_/g, ' ').toUpperCase();

            // Reward string formatting
            const prizes = [];
            if (evt.prizePoolUsdc) prizes.push(`$${evt.prizePoolUsdc.toLocaleString()} USDC`);
            if (evt.prizePoolOkb) prizes.push(`${evt.prizePoolOkb} OKB`);
            if (evt.prizePoolXp) prizes.push(`+${evt.prizePoolXp.toLocaleString()} XP`);
            const prizeString = prizes.join(' + ') || `$${evt.prizePoolUsdc} USDC`;

            return (
              <div
                key={evt.id}
                className="border border-white/10 bg-[#0A0A0A] hover:border-[#CCFF00] p-6 flex flex-col justify-between transition shadow-xl space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#CCFF00] font-bold uppercase text-[10px]">
                      {evt.game === 'chess' ? '♟️ CHESS' : '⚡ 2048'} • {formatDisplay}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-white/10 text-white/80 border border-white/10">
                      {evt.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{evt.description}</p>

                  {/* Prize & Rules Box */}
                  <div className="bg-black p-4 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40 uppercase font-mono text-[10px]">Guaranteed Pool:</span>
                      <span className="text-sm sm:text-base font-black text-[#CCFF00] font-mono">
                        {prizeString}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                      <span>Entry: {evt.entryFeeUsdc > 0 ? `${evt.entryFeeUsdc} USDC` : evt.entryFeeOkb ? `${evt.entryFeeOkb} OKB` : 'FREE'}</span>
                      <span>
                        {evt.currentParticipantsCount} / {evt.maxParticipants} Registered
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  {isRegistered ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-1.5 text-xs text-[#CCFF00] font-bold py-2 bg-black border border-[#CCFF00]/30">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="uppercase text-[10px] tracking-wider">Registered & Seeding Confirmed</span>
                      </div>
                      <button
                        onClick={() => handleStartTournamentMatch(evt)}
                        className="w-full py-3 bg-[#CCFF00] hover:bg-white text-black font-black text-xs uppercase tracking-tight transition flex items-center justify-center space-x-1.5 active:scale-95"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Play Tournament Round</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedEventModal(evt)}
                        className="flex-1 py-2.5 bg-black hover:bg-white/5 border border-white/15 text-white/70 text-xs font-bold uppercase tracking-wider transition"
                      >
                        Rules & Prizes
                      </button>
                      <button
                        onClick={() => {
                          if (!isConnected) {
                            setIsWalletModalOpen(true);
                            return;
                          }
                          joinEvent(evt.id);
                        }}
                        className="flex-1 py-2.5 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition active:scale-95"
                      >
                        Join ({evt.entryFeeUsdc > 0 ? `${evt.entryFeeUsdc} USDC` : evt.entryFeeOkb ? `${evt.entryFeeOkb} OKB` : 'FREE'})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details & Rules Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#050505] border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 text-[#CCFF00]" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight font-display">
                  {selectedEventModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="text-white/40 hover:text-white text-xs font-mono uppercase px-2.5 py-1 border border-white/10"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-white/70 leading-relaxed">{selectedEventModal.description}</p>

              {/* Prize distribution table */}
              <div className="space-y-2">
                <span className="font-mono uppercase text-[10px] text-white/40 tracking-widest font-bold block">
                  Prize Distribution:
                </span>
                <div className="bg-black p-4 border border-white/10 space-y-2 font-mono">
                  {selectedEventModal.prizeDistribution.map((tier) => (
                    <div key={tier.place} className="flex items-center justify-between text-white/80">
                      <span>{tier.place} Place:</span>
                      <span className="font-black text-[#CCFF00]">${tier.amountUsdc.toLocaleString()} USDC</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tournament Specs */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-black p-3 border border-white/10">
                  <span className="text-white/40 text-[10px] uppercase block">Tournament Format</span>
                  <span className="font-bold text-white block mt-0.5 uppercase">
                    {(selectedEventModal.format || 'swiss').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="bg-black p-3 border border-white/10">
                  <span className="text-white/40 text-[10px] uppercase block">Settlement</span>
                  <span className="font-bold text-[#CCFF00] block mt-0.5">X Layer Smart Escrow</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono">
                <span className="text-white/40 text-xs">Entry Fee: {selectedEventModal.entryFeeUsdc} USDC</span>
                <button
                  onClick={() => {
                    joinEvent(selectedEventModal.id);
                    setSelectedEventModal(null);
                  }}
                  className="px-6 py-2.5 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition"
                >
                  Confirm Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
