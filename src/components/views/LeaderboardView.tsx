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
  RefreshCw,
  Crown,
  Medal,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export const LeaderboardView: React.FC = () => {
  const { allUsers, user, isConnected } = useApp();
  const [tab, setTab] = useState<'chess' | '2048'>('chess');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Global Leaderboard computation from ALL registered database users
  const rankedUsers = useMemo(() => {
    // Clone all database users
    const list = allUsers.map((u) => {
      const isCurr = Boolean(
        isConnected &&
          user.walletAddress &&
          u.walletAddress?.toLowerCase() === user.walletAddress.toLowerCase()
      );

      const chessPlayed =
        (u.chessStats?.wins || 0) + (u.chessStats?.losses || 0) + (u.chessStats?.draws || 0);
      const chessWinRate =
        chessPlayed > 0 ? Math.round(((u.chessStats?.wins || 0) / chessPlayed) * 100) : 0;

      const games2048 = u.stats2048?.gamesPlayed || 0;
      const winRate2048 =
        games2048 > 0 ? Math.round(((u.stats2048?.wins2048 || 0) / games2048) * 100) : 0;

      return {
        id: u.id || u.walletAddress,
        userId: u.id || u.walletAddress,
        username: u.username || 'Contender',
        avatar: u.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=xarena',
        walletAddress: u.walletAddress,
        chessRating: u.chessRating ?? 1200,
        chessTier: u.chessTier || 'Bronze',
        chessWins: u.chessStats?.wins || 0,
        chessPlayed,
        chessWinRate,
        score2048Rating: u.score2048Rating ?? 1200,
        tier2048: u.tier2048 || 'Bronze',
        bestScore2048: u.bestScore2048 || 0,
        highestTile: u.stats2048?.highestTile || 0,
        games2048,
        winRate2048,
        prizesWonUsdc: u.totalPrizesWonUsdc || u.balanceUsdc || 0,
        isCurrentUser: isCurr,
      };
    });

    // If current logged-in user is not yet in allUsers array (optimistic fallback)
    if (
      isConnected &&
      user.walletAddress &&
      !list.some((item) => item.walletAddress?.toLowerCase() === user.walletAddress.toLowerCase())
    ) {
      const chessPlayed =
        (user.chessStats?.wins || 0) + (user.chessStats?.losses || 0) + (user.chessStats?.draws || 0);
      const chessWinRate =
        chessPlayed > 0 ? Math.round(((user.chessStats?.wins || 0) / chessPlayed) * 100) : 0;
      const games2048 = user.stats2048?.gamesPlayed || 0;
      const winRate2048 =
        games2048 > 0 ? Math.round(((user.stats2048?.wins2048 || 0) / games2048) * 100) : 0;

      list.push({
        id: user.id || user.walletAddress,
        userId: user.id || user.walletAddress,
        username: user.username,
        avatar: user.avatar,
        walletAddress: user.walletAddress,
        chessRating: user.chessRating ?? 1200,
        chessTier: user.chessTier || 'Bronze',
        chessWins: user.chessStats?.wins || 0,
        chessPlayed,
        chessWinRate,
        score2048Rating: user.score2048Rating ?? 1200,
        tier2048: user.tier2048 || 'Bronze',
        bestScore2048: user.bestScore2048 || 0,
        highestTile: user.stats2048?.highestTile || 0,
        games2048,
        winRate2048,
        prizesWonUsdc: user.totalPrizesWonUsdc || user.balanceUsdc || 0,
        isCurrentUser: true,
      });
    }

    // Sort strictly by the selected game rating metric
    return list.sort((a, b) => {
      if (tab === 'chess') {
        if (b.chessRating !== a.chessRating) {
          return b.chessRating - a.chessRating;
        }
        return b.chessWins - a.chessWins;
      } else {
        if (b.score2048Rating !== a.score2048Rating) {
          return b.score2048Rating - a.score2048Rating;
        }
        return b.bestScore2048 - a.bestScore2048;
      }
    });
  }, [allUsers, user, isConnected, tab]);

  // Filter with search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return rankedUsers;
    const q = searchQuery.toLowerCase();
    return rankedUsers.filter(
      (item) =>
        item.username.toLowerCase().includes(q) ||
        (item.walletAddress && item.walletAddress.toLowerCase().includes(q))
    );
  }, [rankedUsers, searchQuery]);

  const top3 = filteredList.slice(0, 3);

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 min-w-0 max-w-full">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] sm:tracking-[0.3em]">
          <Award className="w-4 h-4 shrink-0" />
          <span>Apex Rankings & Central Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase mt-2 font-display break-words">
          Arena Global Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-2 max-w-2xl leading-relaxed">
          Shared real-time standings across all contenders on X Layer. Ranked by verified XP and competitive ratings synchronized across all players.
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
              {t === 'chess' ? '♟️ Chess Grandmasters' : '⚡ 2048 Velocity Apex'}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contender or 0x..."
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
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#CCFF00] text-black font-black font-mono">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm text-[#CCFF00] font-mono font-black block mt-1">
                {tab === '2048' ? `${top3[1].score2048Rating} XP` : `${top3[1].chessRating} XP`}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 text-[10px] text-white/40 font-mono">
              Win Rate: {tab === '2048' ? top3[1].winRate2048 : top3[1].chessWinRate}% • Tier:{' '}
              {tab === '2048' ? top3[1].tier2048 : top3[1].chessTier}
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
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#CCFF00] text-black font-black font-mono">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-sm sm:text-base text-[#CCFF00] font-mono font-black block mt-1">
                {tab === '2048' ? `${top3[0].score2048Rating} XP` : `${top3[0].chessRating} XP`}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 text-xs text-white/80 font-mono font-bold">
              ${top3[0].prizesWonUsdc.toLocaleString()} USDC Won • Tier:{' '}
              {tab === '2048' ? top3[0].tier2048 : top3[0].chessTier}
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
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#CCFF00] text-black font-black font-mono">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm text-[#CCFF00] font-mono font-black block mt-1">
                {tab === '2048' ? `${top3[2].score2048Rating} XP` : `${top3[2].chessRating} XP`}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 text-[10px] text-white/40 font-mono">
              Win Rate: {tab === '2048' ? top3[2].winRate2048 : top3[2].chessWinRate}% • Tier:{' '}
              {tab === '2048' ? top3[2].tier2048 : top3[2].chessTier}
            </div>
          </div>
        </div>
      )}

      {/* Full Global Contenders Table */}
      <div className="border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono min-w-[650px]">
            <thead className="bg-black border-b border-white/10 text-white/40 uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Contender</th>
                <th className="py-3.5 px-4">Tier</th>
                <th className="py-3.5 px-4 text-right">Ranked Rating</th>
                <th className="py-3.5 px-4 text-right">Win Rate</th>
                <th className="py-3.5 px-4 text-right">
                  {tab === 'chess' ? 'Matches Played' : 'Best Score'}
                </th>
                <th className="py-3.5 px-4 text-right">Prizes Won</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredList.map((entry, index) => {
                const rankNum = index + 1;
                const isYou = entry.isCurrentUser;
                const shortAddr = entry.walletAddress
                  ? `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`
                  : '0x...';

                return (
                  <tr
                    key={entry.userId || entry.walletAddress || index}
                    className={`transition ${
                      isYou
                        ? 'bg-[#CCFF00]/10 border-l-4 border-l-[#CCFF00] hover:bg-[#CCFF00]/15'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 font-bold">
                      <div className="flex items-center space-x-1.5">
                        {rankNum === 1 && <Crown className="w-4 h-4 text-[#CCFF00]" />}
                        {rankNum === 2 && <Medal className="w-4 h-4 text-slate-300" />}
                        {rankNum === 3 && <Medal className="w-4 h-4 text-amber-600" />}
                        <span
                          className={`${
                            rankNum <= 3 ? 'text-white font-black' : 'text-white/40'
                          }`}
                        >
                          #{rankNum.toString().padStart(2, '0')}
                        </span>
                      </div>
                    </td>

                    {/* Contender Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={entry.avatar}
                          alt={entry.username}
                          className="w-8 h-8 object-cover border border-white/20 bg-black shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`font-black uppercase tracking-tight truncate ${
                                isYou ? 'text-[#CCFF00]' : 'text-white'
                              }`}
                            >
                              {entry.username}
                            </span>
                            {isYou && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-[#CCFF00] text-black font-black font-mono shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/40 font-mono block truncate">
                            {shortAddr}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] px-2 py-0.5 bg-white/10 text-white font-bold uppercase">
                        {tab === 'chess' ? entry.chessTier : entry.tier2048}
                      </span>
                    </td>

                    {/* Ranked Rating */}
                    <td className="py-3.5 px-4 text-right font-black text-[#CCFF00] text-sm">
                      {tab === 'chess' ? entry.chessRating : entry.score2048Rating} XP
                    </td>

                    {/* Win Rate */}
                    <td className="py-3.5 px-4 text-right text-white/80">
                      {tab === 'chess' ? `${entry.chessWinRate}%` : `${entry.winRate2048}%`}
                    </td>

                    {/* Secondary stat */}
                    <td className="py-3.5 px-4 text-right text-white/60">
                      {tab === 'chess'
                        ? `${entry.chessPlayed} games`
                        : `${entry.bestScore2048.toLocaleString()} pts`}
                    </td>

                    {/* Prizes Won */}
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      ${entry.prizesWonUsdc.toLocaleString()} USDC
                    </td>
                  </tr>
                );
              })}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/40 font-mono">
                    No contenders found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
