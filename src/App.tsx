import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LiveTicker } from './components/LiveTicker';
import { Footer } from './components/Footer';
import { XSocialSection } from './components/XSocialSection';
import { WalletModal } from './components/WalletModal';
import { ForfeitModal } from './components/ForfeitModal';
import { HomeView } from './components/views/HomeView';
import { GamesView } from './components/views/GamesView';
import { ChessView } from './components/views/ChessView';
import { Game2048View } from './components/views/Game2048View';
import { RankedView } from './components/views/RankedView';
import { ChallengesView } from './components/views/ChallengesView';
import { EventsView } from './components/views/EventsView';
import { LeaderboardView } from './components/views/LeaderboardView';
import { AiArenaView } from './components/views/AiArenaView';
import { ProfileView } from './components/views/ProfileView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const MainArenaContent: React.FC = () => {
  const { currentView, isAdmin, toasts } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'games':
        return <GamesView />;
      case 'chess':
        return <ChessView />;
      case '2048':
        return <Game2048View />;
      case 'ranked':
        return <RankedView />;
      case 'challenges':
        return <ChallengesView />;
      case 'events':
        return <EventsView />;
      case 'ai-arena':
        return <AiArenaView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'profile':
        return <ProfileView />;
      case 'admin':
        return isAdmin ? <AdminDashboardView /> : <HomeView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#F0F0F0] flex flex-col selection:bg-[#CCFF00] selection:text-black overflow-x-hidden">
      {/* 1. Live Ticker */}
      <LiveTicker />

      {/* 2. Top Header & Nav */}
      <Navbar />

      {/* 3. Main Arena Content */}
      <main className="flex-1 w-full max-w-[98%] 2xl:max-w-[1780px] mx-auto px-3 sm:px-6 lg:px-10 pt-6">
        {renderView()}
      </main>

      {/* 4. Global Web3 Modal */}
      <WalletModal />

      {/* 5. Forfeit & Abandon Match Modal */}
      <ForfeitModal />

      {/* 6. X Arena Socials & Twitter Game */}
      <XSocialSection />

      {/* 7. Footer */}
      <Footer />

      {/* 7. Global Toast Notifications Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm sm:max-w-md w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center space-x-3 px-5 py-3.5 border shadow-2xl text-xs font-bold font-mono uppercase tracking-wider backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'success'
                ? 'bg-black text-[#CCFF00] border-[#CCFF00]'
                : toast.type === 'error'
                ? 'bg-black text-red-400 border-red-500'
                : toast.type === 'warning'
                ? 'bg-black text-amber-300 border-amber-400'
                : 'bg-black text-white border-white/30'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-white shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainArenaContent />
    </AppProvider>
  );
}
