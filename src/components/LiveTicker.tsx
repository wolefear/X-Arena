import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, TrendingDown, Coins, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { subscribeOkbPrice, OkbMarketPrice } from '../utils/web3OnChain';

interface TickerItem {
  id: string;
  icon: 'win' | 'prize' | 'rank' | 'ai';
  text: string;
  time: string;
  tag: string;
}

const BASE_TICKER_DATA: TickerItem[] = [
  { id: '1', icon: 'prize', text: 'Valkyrie_GM won 1,400 USDC in 2048 Apex Championship (+65 XP)', time: 'Just now', tag: 'REAL PRIZE' },
  { id: '2', icon: 'win', text: 'KryptoKnight defeated Tactical Blitz (+35 Ranked XP, total 1,640 XP)', time: '2m ago', tag: 'CHESS' },
  { id: '3', icon: 'prize', text: 'Grandmaster Blitz Cup payout confirmed on X Layer zkEVM', time: '4m ago', tag: 'ON-CHAIN' },
  { id: '4', icon: 'rank', text: 'SnakeGrid99 reached Master Tier with 2,450 Ranked XP', time: '7m ago', tag: 'TIER UP' },
  { id: '5', icon: 'ai', text: 'Aether Apex defended bounty gauntlet vs 14 contenders', time: '11m ago', tag: 'ARENA DUEL' },
  { id: '6', icon: 'win', text: 'TileOverlord synthesized 4096 tile in Ranked 2048 (+45 XP)', time: '16m ago', tag: '2048' },
];

export const LiveTicker: React.FC = () => {
  const { matchHistory } = useApp();
  const [index, setIndex] = useState(0);
  const [tickerList, setTickerList] = useState<TickerItem[]>(BASE_TICKER_DATA);
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

  // Update ticker dynamically when new matches occur in the app
  useEffect(() => {
    if (matchHistory.length > 0) {
      const latestMatch = matchHistory[0];
      const newTickerItem: TickerItem = {
        id: `match_${latestMatch.id}`,
        icon: latestMatch.result === 'win' ? 'win' : 'rank',
        text: `Match completed: ${latestMatch.game.toUpperCase()} vs ${latestMatch.opponentName} (${latestMatch.ratingDelta > 0 ? '+' : ''}${latestMatch.ratingDelta} XP)`,
        time: 'Just now',
        tag: latestMatch.game.toUpperCase(),
      };
      setTickerList((prev) => [newTickerItem, ...prev.slice(0, 8)]);
    }
  }, [matchHistory]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % tickerList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [tickerList.length]);

  const current = tickerList[index] || tickerList[0] || BASE_TICKER_DATA[0];

  return (
    <div className="block bg-black border-b border-white/10 px-2 sm:px-4 py-1.5 sm:py-2 text-xs overflow-hidden select-none">
      <div className="w-full max-w-[98%] 2xl:max-w-[1780px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden min-w-0 flex-1">
          {/* Live Feed badge - desktop only */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 bg-[#CCFF00] text-black shrink-0 font-display">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider">LIVE FEED</span>
          </div>

          {/* News Label on Mobile */}
          <div className="flex sm:hidden items-center space-x-1 px-1.5 py-0.2 bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] shrink-0 font-mono">
            <span className="w-1 h-1 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider">NEWS</span>
          </div>

          <div className="relative h-5 sm:h-6 flex-1 overflow-hidden min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center space-x-1.5 sm:space-x-2 truncate"
              >
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1 sm:px-1.5 py-0.2 sm:py-0.5 bg-white/10 text-[#CCFF00] border border-white/10 shrink-0">
                  {current.tag}
                </span>
                <span className="text-white/90 truncate font-medium text-[11px] sm:text-xs tracking-tight">
                  {current.text}
                </span>
                <span className="text-white/40 text-[9px] sm:text-[10px] hidden md:inline font-mono shrink-0">
                  ({current.time})
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Real-time 1 OKB Price in USD (Replacing previous static vault ticker) */}
        <div className="flex items-center space-x-3 sm:space-x-5 text-[10px] sm:text-[11px] font-mono shrink-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-[#0C0C0C] border border-white/15 px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="text-white/50 uppercase font-bold text-[9px] sm:text-[10px] tracking-wider">
              1 OKB
            </span>
            <span className="text-white font-black">
              ${okbPrice.priceUsd.toFixed(2)}
            </span>
            <span
              className={`text-[9px] font-bold ${
                okbPrice.change24h >= 0 ? 'text-[#CCFF00]' : 'text-red-400'
              }`}
            >
              {okbPrice.change24h >= 0 ? `+${okbPrice.change24h.toFixed(2)}%` : `${okbPrice.change24h.toFixed(2)}%`}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 text-white/40 uppercase font-bold tracking-[0.15em] text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>X Layer Mainnet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
