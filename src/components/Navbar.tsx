import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Swords,
  Flame,
  Bot,
  User,
  LayoutDashboard,
  Volume2,
  VolumeX,
  Wallet,
  Menu,
  X,
  Sparkles,
  Shield,
  Layers,
  Award,
  Share2,
  LogOut,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { sound } from '../utils/audio';

export const Navbar: React.FC = () => {
  const {
    user,
    isConnected,
    isAdmin,
    setIsWalletModalOpen,
    disconnectWallet,
    currentView,
    requestNavigate,
    soundMuted,
    toggleSound,
    showToast,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home', label: 'Hub', icon: LayoutDashboard },
    { id: 'games', label: 'Games', icon: Layers },
    { id: 'ranked', label: 'Ranked', icon: Flame, badge: 'PvP' },
    { id: 'challenges', label: 'Challenges', icon: Swords },
    { id: 'events', label: 'Events', icon: Trophy, badge: 'Prize' },
    { id: 'ai-arena', label: 'AI Arena', icon: Bot },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNav = (viewId: string) => {
    requestNavigate(viewId);
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const copyAddress = () => {
    if (user.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopiedAddr(true);
      showToast('Wallet address copied to clipboard!', 'success');
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-white/10">
      <div className="w-full max-w-[98%] 2xl:max-w-[1780px] mx-auto px-2 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Brand Logo - Bold Typography Style (X hidden on mobile) */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer select-none shrink-0"
            onClick={() => handleNav('home')}
          >
            <div className="hidden sm:flex w-9 h-9 sm:w-11 sm:h-11 bg-black border border-[#CCFF00]/60 items-center justify-center font-black text-lg sm:text-2xl text-[#CCFF00] tracking-tighter shadow-lg shrink-0">
              X
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-black text-lg sm:text-2xl tracking-tighter uppercase text-white font-display">
                  ARENA
                </span>
                <span className="text-[9px] sm:text-[10px] bg-[#CCFF00] text-black px-1.5 sm:px-2 py-0.5 font-black uppercase tracking-wider hidden xs:inline-block">
                  COMPETITIVE
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-white/40 uppercase font-bold tracking-[0.15em] truncate hidden sm:block">
                Proof of Skill • Chess & 2048
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 text-xs uppercase font-bold tracking-wider transition-all ${
                    isActive
                      ? 'bg-white text-black font-black'
                      : 'text-white/50 hover:text-[#CCFF00] hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-white/40'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 font-black uppercase ${
                        isActive ? 'bg-black text-[#CCFF00]' : 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Socials / Twitter X button */}
            <a
              href="https://x.com/XArena_Protocol"
              target="_blank"
              rel="noreferrer"
              title="Official Arena Twitter / X: @XArena_Protocol"
              className="p-2 sm:p-2.5 bg-[#0A0A0A] border border-white/10 text-white/60 hover:text-[#CCFF00] hover:border-white/30 transition flex items-center justify-center shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Sound Mute Toggle */}
            <button
              id="btn-sound-toggle"
              onClick={toggleSound}
              className="p-2 sm:p-2.5 bg-[#0A0A0A] border border-white/10 text-white/50 hover:text-[#CCFF00] hover:border-white/30 transition shrink-0"
              title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Admin / Creator button (Strictly for Owner Wallet) */}
            {isAdmin && (
              <button
                id="btn-admin-nav"
                onClick={() => handleNav('admin')}
                className={`hidden md:flex items-center space-x-1.5 px-3 py-2 text-xs uppercase font-bold tracking-wider transition ${
                  currentView === 'admin'
                    ? 'bg-[#CCFF00] text-black font-black'
                    : 'bg-[#0A0A0A] text-[#CCFF00] border border-[#CCFF00]/40 hover:bg-[#CCFF00]/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Suite</span>
              </button>
            )}

            {/* Web3 Wallet & Profile Pill with Dropdown */}
            {isConnected ? (
              <div className="relative" ref={dropdownRef}>
                <div
                  id="btn-user-profile-header"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center bg-[#0A0A0A] hover:bg-white/5 border border-white/15 hover:border-[#CCFF00]/60 p-1 pl-2 sm:pl-3 space-x-1.5 sm:space-x-3 shrink-0 cursor-pointer transition select-none"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-white whitespace-nowrap">
                      {(user.balanceOkb || 0).toFixed(3)} <span className="text-[#CCFF00] font-mono">OKB</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-white/50 font-mono tracking-wider truncate max-w-[70px] sm:max-w-[110px]">
                      ${(user.balanceUsdt || user.balanceUsdc || 0).toFixed(2)} USDT
                    </span>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 border border-white/20 overflow-hidden shrink-0">
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Profile & Wallet Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-[#0A0A0A] border border-white/20 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header info */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
                      <img src={user.avatar} alt={user.username} className="w-10 h-10 object-cover border border-[#CCFF00]/60" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-black text-white uppercase tracking-tight truncate">
                            {user.username}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#CCFF00] font-mono font-bold block">
                          Tier: {user.chessTier}
                        </span>
                      </div>
                    </div>

                    {/* Address with Copy */}
                    <div className="bg-black p-2 border border-white/10 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[9px] text-white/40 uppercase block font-mono">Connected Address</span>
                        <span className="text-[11px] font-mono text-white/80 truncate block">
                          {user.walletAddress ? `${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-6)}` : '0x...'}
                        </span>
                      </div>
                      <button
                        onClick={copyAddress}
                        title="Copy Address"
                        className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white transition"
                      >
                        {copiedAddr ? <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Balance stats */}
                    <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                      <div className="bg-black p-2 border border-white/10">
                        <span className="text-[8px] text-white/40 uppercase block font-bold">OKB Gas</span>
                        <span className="text-[11px] font-bold text-[#CCFF00]">{(user.balanceOkb || 0).toFixed(3)}</span>
                      </div>
                      <div className="bg-black p-2 border border-white/10">
                        <span className="text-[8px] text-white/40 uppercase block font-bold">USDT Vault</span>
                        <span className="text-[11px] font-bold text-emerald-400">${(user.balanceUsdt || 0).toFixed(2)}</span>
                      </div>
                      <div className="bg-black p-2 border border-white/10">
                        <span className="text-[8px] text-white/40 uppercase block font-bold">USDC</span>
                        <span className="text-[11px] font-bold text-cyan-400">${(user.balanceUsdc || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Quick navigation links */}
                    <div className="space-y-1.5 pt-1">
                      <button
                        onClick={() => handleNav('profile')}
                        className="w-full py-2 px-3 bg-white/5 hover:bg-white text-white hover:text-black font-bold text-xs uppercase font-mono tracking-wider transition text-left flex items-center justify-between"
                      >
                        <span>View Profile & Stats</span>
                        <span>&rarr;</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleNav('admin')}
                          className="w-full py-2 px-3 bg-[#CCFF00]/10 hover:bg-[#CCFF00] text-[#CCFF00] hover:text-black font-bold text-xs uppercase font-mono tracking-wider transition text-left flex items-center justify-between"
                        >
                          <span>Admin Control Suite</span>
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Prominent Disconnect Button */}
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full py-2.5 px-3 bg-red-950/30 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-bold text-xs uppercase font-mono tracking-wider transition flex items-center justify-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Disconnect Wallet</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-connect-wallet-header"
                onClick={() => setIsWalletModalOpen(true)}
                className="flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition shrink-0"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              id="btn-mobile-menu"
              aria-label="Open Navigation Menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center p-2 sm:p-2.5 bg-black border-2 border-white/30 hover:border-[#CCFF00] text-white hover:text-[#CCFF00] transition shadow-md shrink-0"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#CCFF00]" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#050505] border-b border-white/20 px-4 py-4 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto animate-in slide-in-from-top-3 duration-200 shadow-2xl">
          {/* Social Banner in Mobile Menu */}
          <div className="p-3 bg-[#0A0A0A] border border-white/10 flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#CCFF00]">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <div>
                <span className="text-xs font-black text-white uppercase">X Arena Socials</span>
                <p className="text-[10px] text-white/50 font-mono">Tournament Drops & Twitter Game</p>
              </div>
            </div>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-white text-black font-black text-[10px] uppercase hover:bg-[#CCFF00]"
            >
              Follow
            </a>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase font-bold tracking-wider transition ${
                  isActive
                    ? 'bg-white text-black font-black'
                    : 'text-white/70 hover:bg-white/5 hover:text-[#CCFF00]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-white/40'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 bg-[#CCFF00] text-black font-black uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Admin link in mobile menu (Strictly when isAdmin is true) */}
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase font-bold tracking-wider transition ${
                currentView === 'admin'
                  ? 'bg-[#CCFF00] text-black font-black'
                  : 'text-[#CCFF00] bg-[#CCFF00]/5 border border-[#CCFF00]/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-[#CCFF00]" />
                <span>Admin Suite (Owner)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-[#CCFF00] text-black font-black uppercase">
                ADMIN
              </span>
            </button>
          )}

          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
            {isConnected ? (
              <button
                onClick={() => {
                  disconnectWallet();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-[#0A0A0A] border border-red-500/30 text-red-400 hover:text-white hover:bg-red-950/40 text-xs uppercase font-bold"
              >
                Disconnect Wallet
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsWalletModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-white text-black font-black text-xs uppercase tracking-tight"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
