import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Swords,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  FastForward,
  MessageSquare,
  Send,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { AIAgent } from '../../types';

export const AiArenaView: React.FC = () => {
  const { aiAgents, startMatchWithAi, showToast } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'agents' | 'simulation' | 'coach'>('agents');
  const [selectedAgentToChallenge, setSelectedAgentToChallenge] = useState<AIAgent | null>(null);

  // AI vs AI Simulation State
  const [botWhite, setBotWhite] = useState<AIAgent>(aiAgents[1] || aiAgents[0]); // Tactical Blitz
  const [botBlack, setBotBlack] = useState<AIAgent>(aiAgents[3] || aiAgents[1]); // Hydra Fortress
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simMoveIndex, setSimMoveIndex] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<number>(1000);

  // PvP Game Options for AI Duel
  const pvpGameOptions = [
    {
      id: 'chess' as const,
      title: 'Chess',
      category: 'PvP Board Strategy • FIDE Standard',
      icon: '♟️',
      status: 'live' as const,
      description: 'Standard 64-square turn-based PvP battle with AI move evaluation and tactical clock.',
    },
    {
      id: '2048' as const,
      title: '2048',
      category: 'PvP Algorithmic Duel',
      icon: '⚡',
      status: 'live' as const,
      description: 'Competitive 4x4 grid sprint with live score telemetry and milestone multipliers.',
    },
    {
      id: 'go' as const,
      title: 'Go (Weiqi)',
      category: 'PvP Territory Strategy',
      icon: '⚪',
      status: 'dev' as const,
      description: '19x19 ancient territory game with neural Komi scoring.',
    },
    {
      id: 'poker' as const,
      title: 'Texas Hold\'em Poker',
      category: 'PvP Mental Card Strategy',
      icon: '♠️',
      status: 'dev' as const,
      description: 'Zero-knowledge mental poker with on-chain cryptographic cards.',
    },
  ];

  const handleSelectGameForChallenge = (game: typeof pvpGameOptions[0]) => {
    sound.playClick();
    if (game.status === 'dev') {
      showToast(`${game.title} is currently in development for Phase 2 pipeline.`, 'info');
      return;
    }
    if (selectedAgentToChallenge) {
      const agent = selectedAgentToChallenge;
      setSelectedAgentToChallenge(null);
      startMatchWithAi(agent, game.id, 'play');
    }
  };

  // Simulated PGN moves sequence
  const sampleMatchMoves = [
    'e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7',
    'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4', 'Nbd7',
    'Nbd2', 'Bb7', 'Bc2', 'Re8', 'Nf1', 'Bf8', 'Ng3', 'g6', 'Bg5', 'h6',
    'Bd2', 'Bg7', 'a4', 'c5', 'd5', 'c4', 'b4', 'cxb3', 'Bxb3', 'Nc5',
    'Bc2', 'Nfd7', 'Qc1', 'Kh7', 'h4', 'Nb6', 'axb5', 'axb5', 'Rxa8', 'Qxa8',
    'h5', 'Nc4', 'hxg6+', 'fxg6', 'Bxh6', 'Bxh6', 'Ng5+', 'Kg7', 'Nf5+', 'gxf5'
  ];

  // AI Coach Chat State
  const [coachMessages, setCoachMessages] = useState<
    { role: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      role: 'assistant',
      text: "Greetings, Contender. I am AETHER, Grandmaster AI Coach of X ARENA. I evaluate tactical weaknesses, calculate opening tree optimizations, and construct personalized drills for your rated matches. How may I sharpen your game today?",
      time: 'Just now',
    },
  ]);
  const [coachInput, setCoachInput] = useState<string>('');
  const [isCoachThinking, setIsCoachThinking] = useState<boolean>(false);

  // Simulation step timer
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setSimMoveIndex((prev) => {
        if (prev >= sampleMatchMoves.length - 1) {
          setIsSimulating(false);
          sound.playVictory();
          showToast(`Simulation concluded! Tactical victory achieved.`, 'info');
          return prev;
        }
        sound.playMove();
        return prev + 1;
      });
    }, simSpeed);

    return () => clearInterval(timer);
  }, [isSimulating, simSpeed]);

  const handleStartSimulation = () => {
    sound.playClick();
    setSimMoveIndex(0);
    setIsSimulating(true);
  };

  const handleStopSimulation = () => {
    sound.playClick();
    setIsSimulating(false);
  };

  // Coach Send Message (calls backend or answers tactically)
  const handleSendCoach = async () => {
    if (!coachInput.trim()) return;
    const userText = coachInput.trim();
    setCoachInput('');
    sound.playClick();

    const newMsg = {
      role: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setCoachMessages((prev) => [...prev, newMsg]);
    setIsCoachThinking(true);

    try {
      setTimeout(() => {
        let reply = '';
        const lower = userText.toLowerCase();

        if (lower.includes('chess') || lower.includes('opening') || lower.includes('e4')) {
          reply = "In ranked Chess at your rating, control of central squares (d4/e4/d5/e5) and king safety prior to move 15 is decisive. I recommend testing our 'Grandmaster Tactical Blitz' drills to sharpen pawn-break timing against Hydra Fortress.";
        } else if (lower.includes('2048') || lower.includes('tile') || lower.includes('corner')) {
          reply = "For competitive 2048, snake monotonicity is the golden rule. Keep your primary corner locked with your highest tile (e.g. 4096) and maintain descending value across that row. Never swipe in the opposite direction of your anchor unless mathematically forced.";
        } else {
          reply = "Excellent inquiry. Your current profile exhibits a 68% tactical efficiency rate. Focus on reducing hurried moves during blitz time pressure—patience on move 22-30 yields a +2.4 expected material swing.";
        }

        setCoachMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsCoachThinking(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsCoachThinking(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-[#CCFF00] uppercase tracking-[0.3em]">
          <Bot className="w-4 h-4" />
          <span>Neural Agents & Autonomous Engine</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase mt-2 font-display">
          AI Arena
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-2 max-w-2xl leading-relaxed">
          Duel persistent AI agents with distinct playstyles, run live bot simulations, or consult with Grandmaster Coach AETHER.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('agents');
          }}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            activeSubTab === 'agents'
              ? 'bg-white text-black'
              : 'bg-black text-white/50 hover:text-white border border-white/10'
          }`}
        >
          🤖 AI Agents Roster ({aiAgents.length})
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('simulation');
          }}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            activeSubTab === 'simulation'
              ? 'bg-white text-black'
              : 'bg-black text-white/50 hover:text-white border border-white/10'
          }`}
        >
          ⚔️ AI vs AI Simulation Lab
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('coach');
          }}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase transition ${
            activeSubTab === 'coach'
              ? 'bg-white text-black'
              : 'bg-black text-white/50 hover:text-white border border-white/10'
          }`}
        >
          🧠 Coach AETHER (Gemini AI)
        </button>
      </div>

      {/* Subtab 1: AI Agent Roster */}
      {activeSubTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiAgents.map((agent) => {
            return (
              <div
                key={agent.id}
                className="border border-white/10 bg-[#0A0A0A] hover:border-[#CCFF00] p-6 flex flex-col justify-between transition shadow-xl space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-14 h-14 object-cover border-2 border-white/20"
                    />
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight font-display">
                        {agent.name}
                      </h3>
                      <span className="text-xs text-[#CCFF00] font-mono font-bold">
                        {agent.rating} XP POWER
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-white/60 leading-relaxed">{agent.personality}</p>

                  <div className="bg-black p-4 border border-white/10 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-white/50">
                      <span>Difficulty Tier:</span>
                      <span className="font-bold text-white uppercase">{agent.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/50">
                      <span>Matches Recorded:</span>
                      <span className="text-white">{agent.matchesPlayed.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/50">
                      <span>Engine Win Rate:</span>
                      <span className="text-[#CCFF00] font-bold">{agent.winRate}%</span>
                    </div>
                  </div>

                  <div className="bg-[#050505] p-3 border border-white/5 text-[11px] font-mono italic text-white/70">
                    "{agent.catchphrase}"
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedAgentToChallenge(agent);
                  }}
                  className="w-full py-3.5 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Swords className="w-4 h-4" />
                  <span>Challenge in Arena</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtab 2: AI vs AI Simulation Lab */}
      {activeSubTab === 'simulation' && (
        <div className="border border-white/10 bg-[#0A0A0A] p-6 sm:p-10 space-y-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">
                Autonomous Neural Simulation
              </h3>
              <p className="text-xs text-white/50 font-mono">
                Watch two neural bot models execute real-time strategic counter-play.
              </p>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="font-bold text-white/40 uppercase">Speed:</span>
              {[
                { label: '1x', val: 1000 },
                { label: '2x', val: 500 },
                { label: '4x', val: 250 },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSimSpeed(s.val)}
                  className={`px-3 py-1 font-bold transition ${
                    simSpeed === s.val
                      ? 'bg-white text-black'
                      : 'bg-black text-white/50 border border-white/10'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bot Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* White Bot */}
            <div className="bg-black p-4 border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-white/40 uppercase font-mono">White Contender (AI):</span>
              <select
                value={botWhite.id}
                onChange={(e) => {
                  const found = aiAgents.find((a) => a.id === e.target.value);
                  if (found) setBotWhite(found);
                }}
                className="w-full bg-[#0A0A0A] text-xs font-bold text-white p-3 border border-white/20 font-mono"
              >
                {aiAgents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.rating} XP - {a.difficulty.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Black Bot */}
            <div className="bg-black p-4 border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-white/40 uppercase font-mono">Black Contender (AI):</span>
              <select
                value={botBlack.id}
                onChange={(e) => {
                  const found = aiAgents.find((a) => a.id === e.target.value);
                  if (found) setBotBlack(found);
                }}
                className="w-full bg-[#0A0A0A] text-xs font-bold text-white p-3 border border-white/20 font-mono"
              >
                {aiAgents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.rating} XP - {a.difficulty.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Simulation Output Area */}
          <div className="bg-black p-8 border border-white/10 text-center space-y-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center space-y-1">
                <img
                  src={botWhite.avatar}
                  alt={botWhite.name}
                  className="w-16 h-16 mx-auto object-cover border-2 border-white/20"
                />
                <span className="text-xs font-black text-white block uppercase">{botWhite.name}</span>
                <span className="text-[10px] font-mono text-[#CCFF00]">{botWhite.rating} XP</span>
              </div>

              <div className="text-center space-y-2">
                <span className="text-xs font-mono font-bold text-white/40">MOVE {simMoveIndex + 1}</span>
                <div className="text-3xl font-black font-mono text-[#CCFF00] bg-[#0A0A0A] px-6 py-3 border border-white/10">
                  {sampleMatchMoves[simMoveIndex] || 'Ready'}
                </div>
                <span className="text-[10px] text-white/40 font-mono">
                  Branch Eval: +0.4 (Slight White edge)
                </span>
              </div>

              <div className="text-center space-y-1">
                <img
                  src={botBlack.avatar}
                  alt={botBlack.name}
                  className="w-16 h-16 mx-auto object-cover border-2 border-white/20"
                />
                <span className="text-xs font-black text-white block uppercase">{botBlack.name}</span>
                <span className="text-[10px] font-mono text-[#CCFF00]">{botBlack.rating} XP</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              {isSimulating ? (
                <button
                  onClick={handleStopSimulation}
                  className="px-6 py-3 bg-[#0A0A0A] text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider"
                >
                  Pause Simulation
                </button>
              ) : (
                <button
                  onClick={handleStartSimulation}
                  className="px-8 py-3.5 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Autonomous Battle</span>
                </button>
              )}
              <button
                onClick={() => setSimMoveIndex(0)}
                className="px-4 py-3 bg-[#0A0A0A] hover:bg-white/5 border border-white/20 text-white text-xs font-bold uppercase"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Grandmaster AI Coach AETHER */}
      {activeSubTab === 'coach' && (
        <div className="border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl flex flex-col h-[550px]">
          {/* Coach Header */}
          <div className="bg-black border-b border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black border border-[#CCFF00] flex items-center justify-center text-[#CCFF00] font-black text-lg">
                X
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight font-display flex items-center space-x-2">
                  <span>AETHER — Grandmaster AI Coach</span>
                  <span className="text-[9px] px-2 py-0.5 bg-[#CCFF00] text-black font-mono font-black">
                    GEMINI 3.7
                  </span>
                </h3>
                <p className="text-[11px] text-white/40 font-mono">Trained on 40M+ Grandmaster games & algorithmics</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-[#CCFF00] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
              <span>Ready for Analysis</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/60 font-mono text-xs">
            {coachMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md p-4 space-y-1.5 ${
                    msg.role === 'user'
                      ? 'bg-white text-black font-semibold'
                      : 'bg-[#0A0A0A] text-white/90 border border-white/15'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span
                    className={`text-[9px] block text-right font-mono ${
                      msg.role === 'user' ? 'text-black/60' : 'text-white/40'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isCoachThinking && (
              <div className="flex justify-start">
                <div className="bg-[#0A0A0A] p-3 border border-white/10 flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-[#CCFF00] rounded-full animate-ping" />
                  <span className="text-xs text-white/50">AETHER is formulating tactical guidance...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-black border-t border-white/10 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask about opening theory, 2048 corner strategies, or blunder fixes..."
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCoach()}
              className="flex-1 bg-[#0A0A0A] border border-white/15 px-4 py-3 text-xs text-white placeholder-white/40 font-mono focus:outline-none focus:border-[#CCFF00]"
            />
            <button
              onClick={handleSendCoach}
              className="p-3 bg-white hover:bg-[#CCFF00] text-black transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PvP Game Selection Modal for AI Challenge */}
      {selectedAgentToChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#080808] border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedAgentToChallenge.avatar}
                  alt={selectedAgentToChallenge.name}
                  className="w-10 h-10 object-cover border border-[#CCFF00]"
                />
                <div>
                  <div className="text-[10px] font-mono text-[#CCFF00] uppercase font-bold tracking-wider">
                    CHALLENGE NEURAL AGENT
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight font-display">
                    Select Game vs {selectedAgentToChallenge.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedAgentToChallenge(null);
                }}
                className="text-white/40 hover:text-white text-lg font-mono px-2"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/60 font-mono">
              Choose the PvP competitive discipline for this match against {selectedAgentToChallenge.name} ({selectedAgentToChallenge.rating} Elo):
            </p>

            {/* Game Options List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pvpGameOptions.map((g) => {
                const isLive = g.status === 'live';
                return (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGameForChallenge(g)}
                    className={`p-4 border text-left flex flex-col justify-between space-y-3 transition active:scale-95 ${
                      isLive
                        ? 'bg-[#0F0F0F] border-white/15 hover:border-[#CCFF00] hover:bg-[#141414]'
                        : 'bg-black/80 border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{g.icon}</span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border ${
                          isLive
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                            : 'bg-white/10 text-white/50 border-white/10'
                        }`}
                      >
                        {isLive ? 'LIVE' : 'IN DEVELOPMENT'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-white uppercase tracking-tight font-display">
                        {g.title}
                      </h4>
                      <p className="text-[10px] text-[#CCFF00] font-mono mt-0.5">{g.category}</p>
                      <p className="text-[11px] text-white/50 mt-1 leading-snug">{g.description}</p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-white/40 text-[10px] uppercase">
                        {isLive ? 'Start Match' : 'Status'}
                      </span>
                      <span className={`font-bold ${isLive ? 'text-[#CCFF00]' : 'text-white/40'}`}>
                        {isLive ? 'Duel AI →' : 'In Dev'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedAgentToChallenge(null);
                }}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
