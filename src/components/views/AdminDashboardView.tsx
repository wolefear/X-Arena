import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Trophy,
  Bot,
  Plus,
  Layers,
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export const AdminDashboardView: React.FC = () => {
  const { user, events, setEvents, aiAgents, setAiAgents, showToast } = useApp();

  const [adminTab, setAdminTab] = useState<'events' | 'agents' | 'analytics'>('events');

  // Tournament creation form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    game: 'chess' as 'chess' | '2048',
    format: 'swiss' as 'swiss' | 'single_elimination' | 'leaderboard_sprint',
    prizeCurrency: 'USDC' as 'USDC' | 'OKB' | 'BOTH',
    prizePoolUsdc: 1000,
    prizePoolOkb: 50,
    prizePoolXp: 2500,
    entryFeeUsdc: 10,
    entryFeeOkb: 0.5,
    maxParticipants: 64,
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) {
      showToast('Tournament title is required.', 'warning');
      return;
    }

    sound.playClick();
    const created = {
      id: `evt_user_${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description || 'Community organized competitive prize cup on X Layer.',
      game: newEvent.game,
      format: newEvent.format,
      prizeCurrency: newEvent.prizeCurrency,
      entryFeeUsdc: newEvent.prizeCurrency === 'OKB' ? 0 : Number(newEvent.entryFeeUsdc),
      entryFeeOkb: newEvent.prizeCurrency === 'USDC' ? 0 : Number(newEvent.entryFeeOkb),
      prizePoolUsdc: newEvent.prizeCurrency === 'OKB' ? 0 : Number(newEvent.prizePoolUsdc),
      prizePoolOkb: newEvent.prizeCurrency === 'USDC' ? 0 : Number(newEvent.prizePoolOkb),
      prizePoolXp: Number(newEvent.prizePoolXp),
      currentParticipantsCount: 1,
      maxParticipants: Number(newEvent.maxParticipants),
      status: 'active' as const,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      creatorWallet: user.walletAddress,
      isUserRegistered: true,
      participants: [
        {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          walletAddress: user.walletAddress,
          score: 0,
          rank: 1,
          joinedAt: new Date().toISOString(),
        }
      ],
      prizeDistribution: [
        { place: '1st', amountUsdc: Math.floor(newEvent.prizePoolUsdc * 0.5) },
        { place: '2nd', amountUsdc: Math.floor(newEvent.prizePoolUsdc * 0.3) },
        { place: '3rd', amountUsdc: Math.floor(newEvent.prizePoolUsdc * 0.2) },
      ],
    };

    setEvents((prev) => [created, ...prev]);
    showToast(`Tournament "${created.title}" deployed to X Layer smart escrow!`, 'success');

    // Reset form
    setNewEvent({
      title: '',
      description: '',
      game: 'chess',
      format: 'swiss',
      prizeCurrency: 'USDC',
      prizePoolUsdc: 1000,
      prizePoolOkb: 50,
      prizePoolXp: 2500,
      entryFeeUsdc: 10,
      entryFeeOkb: 0.5,
      maxParticipants: 64,
    });
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#CCFF00] uppercase tracking-[0.3em]">
            <Shield className="w-4 h-4" />
            <span>Creator Protocol & Admin Suite</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase mt-2 font-display">
            Escrow & Fleet Control
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-2 max-w-2xl leading-relaxed">
            Deploy creator-funded tournaments, calibrate autonomous neural agents, and audit X Layer smart contract escrows.
          </p>
        </div>

        <div className="bg-black border border-white/20 px-4 py-2 flex items-center space-x-2 text-xs font-mono text-[#CCFF00] shrink-0">
          <Shield className="w-4 h-4 text-[#CCFF00]" />
          <span>Admin Protocol Active</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
        <button
          onClick={() => {
            sound.playClick();
            setAdminTab('events');
          }}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            adminTab === 'events'
              ? 'bg-white text-black'
              : 'bg-black text-white/50 hover:text-white border border-white/10'
          }`}
        >
          🏆 Create & Manage Events
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setAdminTab('agents');
          }}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            adminTab === 'agents'
              ? 'bg-white text-black'
              : 'bg-black text-white/50 hover:text-white border border-white/10'
          }`}
        >
          🤖 AI Agent Calibration
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setAdminTab('analytics');
          }}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            adminTab === 'analytics'
              ? 'bg-white text-black'
              : 'bg-black text-white/50 hover:text-white border border-white/10'
          }`}
        >
          📊 Smart Contract Telemetry
        </button>
      </div>

      {/* Tab 1: Create Event Wizard */}
      {adminTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form (Cols 1-6) */}
          <div className="lg:col-span-6 border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center space-x-2 text-white">
              <Plus className="w-5 h-5 text-[#CCFF00]" />
              <h3 className="text-xl font-black uppercase tracking-tight font-display">
                Deploy New Tournament
              </h3>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-white/40 uppercase font-bold block mb-1">Tournament Title</label>
                <input
                  type="text"
                  placeholder="e.g. X Layer Blitz Open Invitational"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-black border border-white/15 p-3 text-white placeholder-white/40 focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 uppercase font-bold block mb-1">Game</label>
                  <select
                    value={newEvent.game}
                    onChange={(e) => setNewEvent({ ...newEvent, game: e.target.value as any })}
                    className="w-full bg-black border border-white/15 p-3 text-white"
                  >
                    <option value="chess">Chess</option>
                    <option value="2048">2048</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/40 uppercase font-bold block mb-1">Tournament Format</label>
                  <select
                    value={newEvent.format}
                    onChange={(e) => setNewEvent({ ...newEvent, format: e.target.value as any })}
                    className="w-full bg-black border border-white/15 p-3 text-white"
                  >
                    <option value="swiss">Swiss Rounds</option>
                    <option value="single_elimination">Single Elimination</option>
                    <option value="leaderboard_sprint">Leaderboard Sprint</option>
                  </select>
                </div>
              </div>

              {/* Reward Currency Selection */}
              <div>
                <label className="text-white/40 uppercase font-bold block mb-1">Reward Asset Currency</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['USDC', 'OKB', 'BOTH'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, prizeCurrency: curr })}
                      className={`py-2 px-3 text-xs font-mono font-bold uppercase border transition ${
                        newEvent.prizeCurrency === curr
                          ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                          : 'bg-black text-white/60 border-white/15 hover:border-white/40'
                      }`}
                    >
                      {curr === 'BOTH' ? 'USDC + OKB' : curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Prize & Entry Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(newEvent.prizeCurrency === 'USDC' || newEvent.prizeCurrency === 'BOTH') && (
                  <div>
                    <label className="text-white/40 uppercase font-bold block mb-1">Prize (USDC)</label>
                    <input
                      type="number"
                      value={newEvent.prizePoolUsdc}
                      onChange={(e) => setNewEvent({ ...newEvent, prizePoolUsdc: Number(e.target.value) })}
                      className="w-full bg-black border border-white/15 p-3 text-white font-mono font-bold"
                    />
                  </div>
                )}

                {(newEvent.prizeCurrency === 'OKB' || newEvent.prizeCurrency === 'BOTH') && (
                  <div>
                    <label className="text-white/40 uppercase font-bold block mb-1">Prize (OKB)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newEvent.prizePoolOkb}
                      onChange={(e) => setNewEvent({ ...newEvent, prizePoolOkb: Number(e.target.value) })}
                      className="w-full bg-black border border-white/15 p-3 text-white font-mono font-bold"
                    />
                  </div>
                )}

                <div>
                  <label className="text-white/40 uppercase font-bold block mb-1">Prize (XP)</label>
                  <input
                    type="number"
                    value={newEvent.prizePoolXp}
                    onChange={(e) => setNewEvent({ ...newEvent, prizePoolXp: Number(e.target.value) })}
                    className="w-full bg-black border border-white/15 p-3 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-white/40 uppercase font-bold block mb-1">Entry (Fee)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEvent.prizeCurrency === 'OKB' ? newEvent.entryFeeOkb : newEvent.entryFeeUsdc}
                    onChange={(e) => {
                      if (newEvent.prizeCurrency === 'OKB') {
                        setNewEvent({ ...newEvent, entryFeeOkb: Number(e.target.value) });
                      } else {
                        setNewEvent({ ...newEvent, entryFeeUsdc: Number(e.target.value) });
                      }
                    }}
                    className="w-full bg-black border border-white/15 p-3 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-white/40 uppercase font-bold block mb-1">Max Players</label>
                  <input
                    type="number"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: Number(e.target.value) })}
                    className="w-full bg-black border border-white/15 p-3 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/40 uppercase font-bold block mb-1">Description / Rules</label>
                <textarea
                  rows={3}
                  placeholder="Describe time controls, eligibility, and rules..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-black border border-white/15 p-3 text-white placeholder-white/40 focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition flex items-center justify-center space-x-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>Deploy Tournament to X Layer Escrow</span>
              </button>
            </form>
          </div>

          {/* Active Events List (Cols 7-12) */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-base font-black text-white uppercase tracking-tight font-display">
              Active Tournaments ({events.length})
            </h3>
            <div className="space-y-3 font-mono">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 bg-[#0A0A0A] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm block">{evt.title}</span>
                    <span className="text-white/40 text-[10px]">
                      {evt.game.toUpperCase()} • {evt.currentParticipantsCount}/{evt.maxParticipants} Players
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#CCFF00] font-black text-sm block">${evt.prizePoolUsdc} USDC</span>
                    <span className="text-[10px] text-white/50">ESCROW LOCKED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Agent Fleet Manager */}
      {adminTab === 'agents' && (
        <div className="border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">
            Autonomous Agent Fleet Calibration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiAgents.map((agent) => (
              <div
                key={agent.id}
                className="p-5 bg-black border border-white/10 space-y-3 text-xs font-mono"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-10 h-10 object-cover border border-white/20"
                  />
                  <div>
                    <h4 className="font-bold text-white">{agent.name}</h4>
                    <span className="text-[#CCFF00]">{agent.rating} XP POWER</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-white/50">
                    <span>Difficulty:</span>
                    <span className="uppercase font-bold text-white">{agent.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/50">
                    <span>Status:</span>
                    <span className="text-[#CCFF00] font-bold">ONLINE & MATCHING</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Telemetry */}
      {adminTab === 'analytics' && (
        <div className="border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">
            Smart Contract & Escrow Telemetry
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="bg-black p-5 border border-white/10">
              <span className="text-white/40 text-xs uppercase font-bold">Total Escrow Vault</span>
              <h4 className="text-2xl font-black text-[#CCFF00] mt-1">$19,500 USDC</h4>
            </div>
            <div className="bg-black p-5 border border-white/10">
              <span className="text-white/40 text-xs uppercase font-bold">Matches Settled</span>
              <h4 className="text-2xl font-black text-white mt-1">14,892</h4>
            </div>
            <div className="bg-black p-5 border border-white/10">
              <span className="text-white/40 text-xs uppercase font-bold">Active Contenders</span>
              <h4 className="text-2xl font-black text-white mt-1">3,420</h4>
            </div>
            <div className="bg-black p-5 border border-white/10">
              <span className="text-white/40 text-xs uppercase font-bold">Anti-Cheat Flags</span>
              <h4 className="text-2xl font-black text-[#CCFF00] mt-1">0 (Verified)</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
