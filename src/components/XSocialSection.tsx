import React from 'react';
import { ExternalLink, Sparkles, Flame, MessageSquare } from 'lucide-react';
import { sound } from '../utils/audio';

export const XSocialSection: React.FC = () => {
  return (
    <section className="w-full max-w-[98%] 2xl:max-w-[1780px] mx-auto px-3 sm:px-6 lg:px-10 mt-12 sm:mt-16">
      <div className="border border-white/10 bg-[#080808] p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl">
        {/* Subtle Background Glow & Accent Grid */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Call to Action */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 bg-black border border-[#CCFF00] flex items-center justify-center text-[#CCFF00] shrink-0">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#CCFF00] font-mono">
                Official Protocol & X Socials
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white font-display">
              Follow X Arena on <span className="text-[#CCFF00]">X</span> & Join the Twitter Game
            </h2>

            <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-xl">
              Stay in the loop with live tournament announcements, weekly USDC prize pool escrow confirmations, and daily tactical chess puzzles on X.
            </p>

            {/* Social Metrics */}
            <div className="flex flex-wrap gap-4 sm:gap-6 pt-2 font-mono text-xs">
              <div className="bg-black/60 border border-white/10 px-3.5 py-2">
                <span className="text-white/40 text-[9px] uppercase block font-bold">X Handle</span>
                <span className="text-white font-bold">@XArena_Protocol</span>
              </div>
              <div className="bg-black/60 border border-white/10 px-3.5 py-2">
                <span className="text-white/40 text-[9px] uppercase block font-bold">Network</span>
                <span className="text-[#CCFF00] font-bold">X Layer L2</span>
              </div>
              <div className="bg-black/60 border border-white/10 px-3.5 py-2">
                <span className="text-white/40 text-[9px] uppercase block font-bold">Daily Bounties</span>
                <span className="text-white font-bold">Live on Feed</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Buttons & Daily Puzzle Teaser */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="bg-black border border-white/15 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-[#CCFF00]" />
                  <span className="text-xs font-black uppercase text-white font-display">
                    Daily X Checkmate Drop
                  </span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-[#CCFF00] text-black font-black uppercase">
                  Active Bounty
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Reply to the daily puzzle on X with your winning move + X Layer address to win instant XP boosts and USDC rewards.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.playClick()}
                className="flex-1 py-3.5 px-5 bg-[#CCFF00] hover:bg-white text-black font-black text-xs uppercase tracking-tight transition flex items-center justify-center space-x-2 text-center"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Follow @XArena on X</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.playClick()}
                className="py-3.5 px-5 bg-black border border-white/20 hover:border-white text-white font-bold text-xs uppercase font-mono transition flex items-center justify-center space-x-1.5 text-center"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white/60" />
                <span>Join Discussion</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
