import React from 'react';
import { ShieldCheck, Cpu, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer className="bg-black border-t border-white/10 text-white/50 py-12 px-3 sm:px-6 lg:px-10 mt-20">
      <div className="w-full max-w-[98%] 2xl:max-w-[1780px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Mission */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black border border-white/20 flex items-center justify-center font-black text-[#CCFF00] text-lg">
              X
            </div>
            <span className="font-black text-white text-lg tracking-tighter uppercase font-display">X ARENA</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed max-w-sm">
            Unified competitive ecosystem for human champions, AI grandmasters, and skill-based on-chain settlement on X Layer.
          </p>
          <div className="flex items-center space-x-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="text-[10px] text-[#CCFF00] font-mono uppercase tracking-widest font-bold">
              X Layer Protocol: Operational
            </span>
          </div>
          <div className="pt-2">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 text-xs font-mono text-white/70 hover:text-[#CCFF00] transition"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Follow @XArena_Protocol on X</span>
              <ExternalLink className="w-3 h-3 text-white/40" />
            </a>
          </div>
        </div>

        {/* Quick Game Modes */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Modes & Arena</h4>
          <ul className="space-y-2 text-xs uppercase tracking-wider font-semibold">
            <li>
              <button onClick={() => setCurrentView('ranked')} className="hover:text-[#CCFF00] transition">
                Ranked Matchmaking
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('events')} className="hover:text-[#CCFF00] transition">
                Prize Events & Cups
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('challenges')} className="hover:text-[#CCFF00] transition">
                Daily Tactical Challenges
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('ai-arena')} className="hover:text-[#CCFF00] transition">
                AI Arena & Neural Duels
              </button>
            </li>
          </ul>
        </div>

        {/* Supported Games */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Launch Ecosystem</h4>
          <ul className="space-y-2 text-xs uppercase tracking-wider font-semibold">
            <li>
              <button onClick={() => setCurrentView('chess')} className="hover:text-[#CCFF00] transition">
                Ranked Chess
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('2048')} className="hover:text-[#CCFF00] transition">
                Competitive 2048
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('games')} className="hover:text-[#CCFF00] transition">
                Future Roadmap (Go, Poker)
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('leaderboard')} className="hover:text-[#CCFF00] transition">
                Global Apex Rankings
              </button>
            </li>
          </ul>
        </div>

        {/* Web3 & Security Specs */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Web3 Infrastructure</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2 bg-[#080808] p-2.5 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#CCFF00] shrink-0" />
              <span className="text-[11px] text-white/70 uppercase tracking-wide font-medium">
                Server-authoritative anti-cheat
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-[#080808] p-2.5 border border-white/10">
              <Cpu className="w-4 h-4 text-[#CCFF00] shrink-0" />
              <span className="text-[11px] text-white/70 uppercase tracking-wide font-medium">
                Grandmaster tactical engine analysis
              </span>
            </div>
            <a
              href="https://www.oklink.com/xlayer"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-[#CCFF00] hover:underline text-[10px] uppercase tracking-widest font-mono pt-1"
            >
              <span>Explore X Layer Contracts</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
        <p>© 2026 X ARENA ECOSYSTEM. PLAY • COMPETE • RANK • WIN.</p>
        <p className="mt-2 sm:mt-0 font-mono">X LAYER NETWORK</p>
      </div>
    </footer>
  );
};
