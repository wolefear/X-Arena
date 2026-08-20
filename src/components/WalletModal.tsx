import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { MetaMaskNeonFox } from './icons/MetaMaskNeonFox';

export const WalletModal: React.FC = () => {
  const { isWalletModalOpen, setIsWalletModalOpen, connectWallet, isConnected, disconnectWallet, user, isAdmin } = useApp();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  if (!isWalletModalOpen) return null;

  const walletProviders = [
    {
      id: 'okx',
      name: 'OKX Connect',
      description: 'Primary native gateway on X Layer (zkEVM L2). Instant gasless connection.',
      badge: 'OKX CONNECT',
      renderIcon: () => (
        <div className="w-10 h-10 bg-black border border-white/30 flex items-center justify-center p-2 shrink-0">
          <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current">
            <path d="M4 4h4v4H4zm12 0h4v4h-4zm-6 6h4v4h-4zm-6 6h4v4H4zm12 0h4v4h-4z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect via MetaMask extension or mobile dApp browser.',
      badge: 'METAMASK',
      renderIcon: () => (
        <div className="w-10 h-10 bg-black border border-[#FF6A00]/50 flex items-center justify-center p-1 shrink-0 overflow-hidden">
          <MetaMaskNeonFox className="w-full h-full" />
        </div>
      ),
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      description: 'Scan QR code with any mobile crypto wallet to connect instantly.',
      badge: 'UNIVERSAL',
      renderIcon: () => (
        <div className="w-10 h-10 bg-[#3B99FC]/10 border border-[#3B99FC]/50 flex items-center justify-center p-2 shrink-0">
          <svg viewBox="0 0 24 24" className="w-full h-full fill-[#3B99FC]">
            <path d="M4.9 7.4c3.9-3.8 10.3-3.8 14.2 0l.5.5c.2.2.2.5 0 .7l-1.6 1.6c-.1.1-.3.1-.4 0l-.7-.7c-2.7-2.7-7.2-2.7-10 0l-.8.7c-.1.1-.3.1-.4 0L4.1 8.6c-.2-.2-.2-.5 0-.7l.8-.5zm17.6 3.9l1.4 1.4c.2.2.2.5 0 .7l-6.4 6.4c-.2.2-.5.2-.7 0l-4.5-4.5c-.1-.1-.3-.1-.4 0l-4.5 4.5c-.2.2-.5.2-.7 0L.1 13.4c-.2-.2-.2-.5 0-.7l1.4-1.4c.2-.2.5-.2.7 0l4.5 4.5c.1.1.3.1.4 0l4.5-4.5c.2-.2.5-.2.7 0l4.5 4.5c.1.1.3.1.4 0l4.5-4.5c.3-.2.6-.2.8 0z" />
          </svg>
        </div>
      ),
    },
  ];

  const handleSelectWallet = async (walletId: string) => {
    sound.playClick();
    setConnectingId(walletId);
    await connectWallet(walletId);
    setConnectingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#080808] border border-white/20 p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black border border-[#CCFF00] flex items-center justify-center font-black text-[#CCFF00] text-base sm:text-lg shrink-0">
              X
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-display">
                {isConnected ? 'Wallet Connected' : 'Connect Web3 Wallet'}
              </h2>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em]">
                X Layer • OKB Gas
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isConnected ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#0A0A0A] border border-[#CCFF00]/40 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <CheckCircle2 className="w-6 h-6 text-[#CCFF00] shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-white uppercase">Status: Active</span>
                    {isAdmin && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#CCFF00] text-black font-black uppercase">
                        OWNER ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-white/60 truncate">{user.walletAddress}</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#CCFF00] text-black shrink-0">
                On-Chain
              </span>
            </div>

            {/* Real On-Chain Balances */}
            <div className="grid grid-cols-2 gap-2.5 font-mono">
              <div className="p-3 bg-black border border-white/10">
                <span className="text-[9px] text-white/40 uppercase block font-bold">X Layer OKB Gas</span>
                <span className="text-sm font-black text-[#CCFF00]">{user.balanceOkb.toFixed(4)} OKB</span>
              </div>
              <div className="p-3 bg-black border border-white/10">
                <span className="text-[9px] text-white/40 uppercase block font-bold">USDC Vault</span>
                <span className="text-sm font-black text-white">{user.balanceUsdc.toFixed(2)} USDC</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  disconnectWallet();
                  setIsWalletModalOpen(false);
                }}
                className="w-full sm:flex-1 py-3 bg-[#0A0A0A] hover:bg-red-950/40 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition"
              >
                Disconnect Wallet
              </button>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="w-full sm:flex-1 py-3 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight transition"
              >
                Return to Arena
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Standard Wallet Providers */}
            <div className="space-y-2">
              {walletProviders.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleSelectWallet(w.id)}
                  disabled={connectingId !== null}
                  className="w-full flex items-center justify-between p-3 sm:p-3.5 bg-[#0D0D0D] hover:bg-white/5 border border-white/10 hover:border-[#CCFF00] transition group text-left"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {w.renderIcon()}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm font-black text-white uppercase tracking-tight group-hover:text-[#CCFF00] transition truncate">
                          {w.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 font-black uppercase bg-white/10 text-white/70 border border-white/10 font-mono shrink-0">
                          {w.badge}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-white/40 leading-snug mt-0.5 truncate">{w.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {connectingId === w.id ? (
                      <div className="w-4 h-4 border-2 border-[#CCFF00] border-t-transparent animate-spin" />
                    ) : (
                      <span className="text-xs text-white/30 group-hover:text-[#CCFF00] font-mono font-bold">
                        &rarr;
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

