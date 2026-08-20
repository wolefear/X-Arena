import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Wallet,
  Trophy,
  Award,
  Sparkles,
  Flame,
  Zap,
  ExternalLink,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Edit2,
  Check,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { getTierColor } from '../../utils/elo';

export const ProfileView: React.FC = () => {
  const {
    user,
    setUser,
    matchHistory,
    achievements,
    transactions,
    claimAchievementReward,
    claimFaucet,
    showToast,
    isConnected,
    setIsWalletModalOpen,
  } = useApp();

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(user.username);
  const [profileTab, setProfileTab] = useState<'matches' | 'achievements' | 'transactions'>('matches');

  const handleSaveName = () => {
    if (!tempName.trim()) return;
    setUser({ ...user, username: tempName.trim() });
    setIsEditingName(false);
    sound.playClick();
    showToast('Competitive handle updated!', 'success');
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Wallet Connection Status Alert if Disconnected */}
      {!isConnected && (
        <div className="border border-[#CCFF00]/40 bg-[#CCFF00]/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black uppercase text-[#CCFF00] tracking-widest block">
              Wallet Disconnected
            </span>
            <p className="text-xs text-white/80 font-mono">
              Connect your Web3 wallet on X Layer to link your on-chain account, sync real token balances, and record rated match history.
            </p>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="px-6 py-2.5 bg-[#CCFF00] hover:bg-white text-black font-black text-xs uppercase tracking-tight font-mono shrink-0 transition"
          >
            Connect Wallet &rarr;
          </button>
        </div>
      )}

      {/* Profile Top Banner */}
      <div className="border border-white/10 bg-[#0A0A0A] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Identifiers */}
          <div className="flex items-center space-x-5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-white/20 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-[#CCFF00] border-2 border-black" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                {isEditingName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-black border border-[#CCFF00] px-3 py-1 text-base font-black text-white focus:outline-none font-mono"
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1.5 bg-[#CCFF00] text-black font-bold"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight font-display">
                      {user.username}
                    </h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-white/40 hover:text-[#CCFF00] transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-white/50 font-mono flex items-center space-x-2">
                <span>{user.walletAddress}</span>
                <span className="text-[10px] px-2 py-0.5 bg-white/10 text-[#CCFF00] border border-white/10 font-bold uppercase">
                  X Layer L2
                </span>
              </p>

              <div className="flex items-center space-x-4 pt-1 text-xs font-mono">
                <span className="text-white/70">
                  Balance: <strong className="text-[#CCFF00] font-black">{user.balanceUsdc.toFixed(2)} USDC</strong>
                </span>
                <span className="text-white/50">
                  Gas: <strong className="text-white">{user.balanceOkb.toFixed(4)} OKB</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-black border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#CCFF00]" />
              <span>Real USDC & Token Rewards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chess Card */}
        <div className="border border-white/10 bg-[#0A0A0A] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♟️</span>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight font-display">
                  Chess Masters Rating
                </h3>
                <span className="text-[10px] text-white/40 uppercase font-mono">Ranked XP Model</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-white/10 text-white font-mono border border-white/15">
              {user.chessTier}
            </span>
          </div>

          <div className="flex items-baseline space-x-2 font-mono">
            <span className="text-4xl font-black text-white">{user.chessRating} <span className="text-sm text-[#CCFF00]">XP</span></span>
            <span className="text-xs text-white/40 font-mono">Peak: {user.chessPeakRating || user.chessRating} XP</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
            <div className="bg-black p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Record</span>
              <span className="font-bold text-white">{user.chessStats.wins}W - {user.chessStats.losses}L</span>
            </div>
            <div className="bg-black p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Streak</span>
              <span className="font-bold text-[#CCFF00]">{user.chessStats.streak} 🔥</span>
            </div>
            <div className="bg-black p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Draws</span>
              <span className="font-bold text-white/70">{user.chessStats.draws}</span>
            </div>
          </div>
        </div>

        {/* 2048 Card */}
        <div className="border border-white/10 bg-[#0A0A0A] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight font-display">
                  2048 Velocity Rating
                </h3>
                <span className="text-[10px] text-white/40 uppercase font-mono">Ranked XP Model</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-white/10 text-white font-mono border border-white/15">
              {user.tier2048}
            </span>
          </div>

          <div className="flex items-baseline space-x-2 font-mono">
            <span className="text-4xl font-black text-white">{user.score2048Rating} <span className="text-sm text-[#CCFF00]">XP</span></span>
            <span className="text-xs text-white/40 font-mono">Best: {user.bestScore2048}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
            <div className="bg-black p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Max Tile</span>
              <span className="font-bold text-[#CCFF00]">{user.stats2048.highestTile}</span>
            </div>
            <div className="bg-black p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Runs Done</span>
              <span className="font-bold text-white">{user.stats2048.gamesPlayed}</span>
            </div>
            <div className="bg-black p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Avg Speed</span>
              <span className="font-bold text-white">3.4 m/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Match History / Achievements / Transactions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
          <button
            onClick={() => {
              sound.playClick();
              setProfileTab('matches');
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition ${
              profileTab === 'matches'
                ? 'bg-white text-black'
                : 'bg-black text-white/50 hover:text-white border border-white/10'
            }`}
          >
            ⚔️ Match History ({matchHistory.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setProfileTab('achievements');
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition ${
              profileTab === 'achievements'
                ? 'bg-white text-black'
                : 'bg-black text-white/50 hover:text-white border border-white/10'
            }`}
          >
            🏆 Achievements ({achievements.filter((a) => user.achievements?.includes(a.id)).length}/{achievements.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setProfileTab('transactions');
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition ${
              profileTab === 'transactions'
                ? 'bg-white text-black'
                : 'bg-black text-white/50 hover:text-white border border-white/10'
            }`}
          >
            ⛓️ X Layer Transactions ({transactions.length})
          </button>
        </div>

        {/* Tab 1: Match History */}
        {profileTab === 'matches' && (
          <div className="border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs font-mono">
                <thead className="bg-black text-white/40 uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-4">Game & Mode</th>
                    <th className="p-4">Opponent / Target</th>
                    <th className="p-4">Result</th>
                    <th className="p-4 text-right">XP Δ</th>
                    <th className="p-4 text-right">Moves / Score</th>
                    <th className="p-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {matchHistory.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 transition">
                      <td className="p-4 font-bold text-white flex items-center space-x-2">
                        <span>{m.game === 'chess' ? '♟️ Chess' : '⚡ 2048'}</span>
                        <span className="text-[10px] text-[#CCFF00] uppercase bg-black px-2 py-0.5 border border-white/10">
                          {m.mode}
                        </span>
                      </td>
                      <td className="p-4 text-white/80">{m.opponentName}</td>
                      <td className="p-4">
                        <span
                          className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 ${
                            m.result === 'win'
                              ? 'bg-[#CCFF00] text-black font-black'
                              : m.result === 'loss'
                              ? 'bg-red-900/40 text-red-300 border border-red-500/30'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {m.result}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-xs">
                        <span className={m.ratingDelta >= 0 ? 'text-[#CCFF00]' : 'text-red-400'}>
                          {m.ratingDelta >= 0 ? `+${m.ratingDelta} XP` : `${m.ratingDelta} XP`}
                        </span>
                      </td>
                      <td className="p-4 text-right text-white/80">
                        {m.game === '2048' ? `Score: ${m.playerScore || 0}` : `${m.movesCount} Moves`}
                      </td>
                      <td className="p-4 text-right text-white/40 text-[10px]">
                        {m.date || 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Achievements */}
        {profileTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach) => {
              const isUnlocked = user.achievements?.includes(ach.id);
              const iconEmoji =
                ach.icon === 'Crown' ? '👑' :
                ach.icon === 'Sword' ? '⚔️' :
                ach.icon === 'Bot' ? '🤖' :
                ach.icon === 'Sparkles' ? '✨' :
                ach.icon === 'Zap' ? '⚡' :
                ach.icon === 'Trophy' ? '🏆' :
                ach.icon === 'Coins' ? '🪙' : '🎯';

              return (
                <div
                  key={ach.id}
                  className={`p-6 border space-y-4 flex flex-col justify-between transition ${
                    isUnlocked
                      ? 'bg-[#0A0A0A] border-[#CCFF00]/50 shadow-lg shadow-[#CCFF00]/5'
                      : 'bg-black border-white/10 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{iconEmoji}</span>
                      {isUnlocked ? (
                        <span className="text-[10px] font-mono font-bold text-black bg-[#CCFF00] px-2 py-0.5 uppercase flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>UNLOCKED</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-white/40 uppercase">IN PROGRESS</span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-white uppercase tracking-tight font-display">
                      {ach.title}
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed">{ach.description}</p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#CCFF00] font-black">+${ach.rewardUsdc} USDC</span>
                    {isUnlocked ? (
                      <span className="text-[#CCFF00] text-[11px] font-bold uppercase flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>CLAIMED</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => claimAchievementReward(ach.id)}
                        className="px-3.5 py-1.5 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight hover:bg-white transition"
                      >
                        Unlock ({ach.xp} XP)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Transactions */}
        {profileTab === 'transactions' && (
          <div className="border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black text-white/40 uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-4">Type & Action</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">X Layer Tx Hash</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => {
                    const txDisplayHash = (tx.hash || tx.txHash || tx.id || '0x').slice(0, 14);
                    const txType = (tx.type || 'TRANSACTION').replace(/_/g, ' ');

                    return (
                      <tr key={tx.id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-bold text-white uppercase">{txType}</td>
                        <td className="p-4 font-bold text-[#CCFF00]">
                          {tx.amountUsdc > 0 ? `${tx.amountUsdc} USDC` : `${tx.amountOkb || 0} OKB`}
                        </td>
                        <td className="p-4 text-white/80 hover:text-[#CCFF00] cursor-pointer flex items-center space-x-1">
                          <span>{txDisplayHash}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] uppercase text-[#CCFF00] bg-black px-2 py-0.5 border border-[#CCFF00]/40">
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 text-right text-white/40 text-[10px]">
                          {tx.timestamp || 'Recent'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
