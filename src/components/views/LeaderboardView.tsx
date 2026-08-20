import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Trophy,
  Search,
  User,
  Flame,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export const LeaderboardView: React.FC = () => {
  const { leaderboard, user, isConnected } = useApp();
  const [tab, setTab] = useState<'chess' | '2048'>('chess');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamically include current user with live XP in the leaderboard list
  const consolidatedList = useMemo(() => {
    // Clone existing leaderboard items
    const list = [...leaderboard];

    // Find if user already exists
    const userIndex = list.findIndex(
      (item) =>
        item.userId === user.id ||
        (user.walletAddress && item.walletAddress?.toLowerCase() === user.walletAddress.toLowerCase()) ||
        item.username.toLowerCase() === user.username.toLowerCase()
    );

    const userEntry = {
      id: user.id || 'current_user',
      userId: user.id || 'current_user',
      username: user.username,
      avatar: user.avatar,
      walletAddress: user.walletAddress,
      chessRating: user.chessRating,
      score2048Rating: user.score2048Rating,
      tier: tab === '2048' ? user.tier2048 : user.chessTier,
      winRate:
        tab === '2048'
          ? 74
          : user.chessStats.played > 0
          ? Math.round((user.chessStats.wins / user.chessStats.played) * 100)
          : 68,
      prizesWonUsdc: user.balanceUsdc || 150,
      matchesPlayed: tab === '2048' ? user.stats2048.gamesPlayed : user.chessStats.played || 14,
      isCurrentUser: true,
    };

    if (userIndex >= 0) {
      list[userIndex] = {
        ...list[userIndex],
        ...userEntry,
        // Ensure tier is never "ADMIN"
        tier: tab === '2048' ? user.tier2048 : user.chessTier,
      };
    } else {
      list.push(userEntry);
    }

    return list;
  }, [leaderboard, user, tab]);

  // Human / competitive leaderboard for Chess and 2048 sorted by XP
  const filteredList = useMemo(() => {
    return consolidatedList
      .filter((item) => {
        if (tab === 'chess' && item.chessRating === undefined) return false;
        if (tab === '2048' && item.score2048Rating === undefined) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.username.toLowerCase().includes(q) ||
            (item.walletAddress && item.walletAddress.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        const scoreA = tab === '2048' ? (a.score2048Rating || 0) : (a.chessRating || 0);
        const scoreB = tab === '2048' ? (b.score2048Rating || 0) : (b.chessRating || 0);
        return scoreB - scoreA;
      });
  }, [consolidatedList, tab, searchQuery]);

  const top3 = filteredList.slice(0, 3);

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 min-w-0 max-w-full">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] sm:tracking-[0.3em]">
          <Award className="w-4 h-4 shrink-0" />
          <span>Apex Rankings & Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase mt-2 font-display break-words">
          Arena Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-2 max-w-2xl leading-relaxed">
          Global competitive standings for Chess and 2048. Ranked by verified XP earned through competitive PvP and tournament match victories.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#0A0A0A] border border-white/10 p-3 sm:p-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {(['chess', '2048'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                sound.playClick();
                setTab(t);
              }}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs font-mono font-bold uppercase transition shrink-0 ${
                tab === t
                  ? 'bg-white text-black font-black'
                  : 'bg-black text-white/50 hover:text-white border border-white/10'
              }`}
            >
              {t === 'chess' ? '♟️ Chess Grandmasters (XP)' : '⚡ 2048 Velocity Apex (XP)'}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player or 0x..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-white/15 pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 font-mono focus:outline-none focus:border-[#CCFF00]"
          />
        </div>
      </div>

      {/* Top 3 Podium Visualization */}
      {top3.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 sm:pt-4 items-end">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 border border-white/10 bg-[#0A0A0A] p-5 sm:p-6 text-center space-y-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black border border-white/20 flex items-center justify-center font-black text-white/70 mx-auto text-sm font-mono">
              02
            </div>
            <img
              src={top3[1].avatar}
              alt={top3[1].username}
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto object-cover border border-white/20"
            />
            <div className="min-w-0">
              <div className="flex items-center justify-center space-x-1.5">
                <h4 className="text-base font-black text-white uppercase tracking-tight font-display truncate">
                  {top3[1].username}
                </h4>
                {top3[1].isCurrentUser && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#CCFF00] text-black font-black font-mono">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm text-[#CCFF00] font-mono font-black block mt-1">
                {tab === '2048' ? `${top3[1].score2048Rating} XP` : `${top3[1].chessRating} XP`}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 text-[10px] text-white/40 font-mono">
              Win Rate: {top3[1].winRate}% • Tier: {top3[1].tier}
            </div>
          </div>

          {/* 1st Place (Champion) */}
          <div className="order-1 md:order-2 border-2 border-[#CCFF00] bg-[#0A0A0A] p-6 sm:p-8 text-center space-y-4 shadow-xl shadow-[#CCFF00]/5 transform md:-translate-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#CCFF00] text-black flex items-center justify-center font-black mx-auto text-sm sm:text-base font-mono">
              01
            </div>
            <img
              src={top3[0].avatar}
              alt={top3[0].username}
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto object-cover border-2 border-[#CCFF00]"
            />
            <div className="min-w-0">
              <div className="flex items-center justify-center space-x-1.5">
                <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-display truncate">
                  {top3[0].username}
                </h4>
                {top3[0].isCurrentUser && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#CCFF00] text-black font-black font-mono">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-sm sm:text-base text-[#CCFF00] font-mono font-black block mt-1">
                {tab === '2048' ? `${top3[0].score2048Rating} XP` : `${top3[0].chessRating} XP`}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 text-xs text-white/80 font-mono font-bold">
              ${top3[0].prizesWonUsdc.toLocaleString()} USDC Won • Tier: {top3[0].tier}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 border border-white/10 bg-[#0A0A0A] p-5 sm:p-6 text-center space-y-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black border border-white/20 flex items-center justify-center font-black text-white/70 mx-auto text-sm font-mono">
              03
            </div>
            <img
              src={top3[2].avatar}
              alt={top3[2].username}
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto object-cover border border-white/20"
            />
            <div className="min-w-0">
              <div className="flex items-center justify-center space-x-1.5">
                <h4 className="text-base font-black text-white uppercase tracking-tight font-display truncate">
                  {top3[2].username}
                </h4>
                {top3[2].isCurrentUser && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#CCFF00] text-black font-black font-mono">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm text-[#CCFF00] font-mono font-black block mt-1">
                {tab === '2048' ? `${top3[2].score2048Rating} XP` : `${top3[2].chessRating} XP`}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 text-[10px] text-white/40 font-mono">
              Win Rate: {top3[2].winRate}% • Tier: {top3[2].tier}
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono min-w-[550px]">
            <thead className="bg-black border-b border-white/10 text-white/40 uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Contender</th>
                <th className="py-3.5 px-4">Tier</th>
                <th className="py-3.5 px-4 text-right">Ranked XP</th>
                <th className="py-3.5 px-4 text-right">Win Rate</th>
                <th className="py-3.5 px-4 text-right">Prizes Won</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredList.map((item, index) => {
                const isYou = item.isCurrentUser || item.username === user.username;
                return (
                  <tr
                    key={item.userId || item.id || `lb_row_${index}`}
                    className={`transition ${
                      isYou
                        ? 'bg-[#CCFF00]/10 border-l-2 border-l-[#CCFF00] hover:bg-[#CCFF00]/15'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-4 px-4 font-bold text-white">
                      #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.avatar}
                          alt={item.username}
                          className={`w-8 h-8 object-cover border shrink-0 ${
                            isYou ? 'border-[#CCFF00]' : 'border-white/20'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className={`font-bold text-xs truncate max-w-[120px] sm:max-w-[180px] ${
                              isYou ? 'text-[#CCFF00]' : 'text-white'
                            }`}>
                              {item.username}
                            </span>
                            {isYou && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-[#CCFF00] text-black font-black font-mono shrink-0">
                                YOU
                              </span>
                            )}
                            {item.walletAddress && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-white/10 text-white/70 border border-white/10 font-mono hidden sm:inline-block">
                                {item.walletAddress}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/40">
                            {item.matchesPlayed} Matches Completed
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                        isYou
                          ? 'bg-[#CCFF00]/20 text-[#CCFF00] border-[#CCFF00]/40'
                          : 'bg-white/10 text-white border-white/15'
                      }`}>
                        {item.tier}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-[#CCFF00] text-sm">
                      {tab === '2048' ? item.score2048Rating : item.chessRating} XP
                    </td>
                    <td className="py-4 px-4 text-right text-white/80 font-bold">
                      {item.winRate}%
                    </td>
                    <td className="py-4 px-4 text-right text-[#CCFF00] font-bold">
                      ${item.prizesWonUsdc.toLocaleString()} USDC
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
