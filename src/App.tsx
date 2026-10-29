import React, { useEffect, useState } from 'react';
import { useGameStore } from './state/gameStore';
import { Dashboard } from './components/Dashboard';
import { FarmCanvas } from './canvas/FarmCanvas';
import { WaterTableCrossSection } from './components/WaterTableCrossSection';
import { ActionBar } from './components/ActionBar';
import { TileInspector } from './components/TileInspector';
import { SeasonReportModal } from './components/SeasonReportModal';
import { UpgradesModal } from './components/UpgradesModal';
import { NeighborFarmsModal } from './components/NeighborFarmsModal';
import { ContractsModal } from './components/ContractsModal';
import { GmailDeskModal } from './components/GmailDeskModal';
import { AgroAcademyModal } from './components/AgroAcademyModal';
import { EcologicalImpactDashboardModal } from './components/EcologicalImpactDashboardModal';
import { ClimateScenarioModal } from './components/ClimateScenarioModal';
import { FieldNotesModal } from './components/FieldNotesModal';
import { LeaderboardAndBadgesModal } from './components/LeaderboardAndBadgesModal';
import { GameGuideModal } from './components/GameGuideModal';
import { BackgroundOptionsModal } from './components/BackgroundOptionsModal';
import { AgroQuizModal } from './components/AgroQuizModal';
import { CloudDatabaseModal } from './components/CloudDatabaseModal';
import { AuthModal } from './components/AuthModal';
import { subscribeToAuth } from './services/firebase';
import { getActiveBackgroundImage } from './config/backgroundPresets';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function App() {
  const tick = useGameStore((state) => state.tick);
  const isPaused = useGameStore((state) => state.farm.isPaused);
  const gameSpeed = useGameStore((state) => state.farm.gameSpeed);
  const notification = useGameStore((state) => state.notification);
  const backgroundSettings = useGameStore((state) => state.backgroundSettings);
  const farmSeason = useGameStore((state) => state.farm.season);
  const dayOfSeason = useGameStore((state) => state.farm.dayOfSeason);
  const setCurrentUser = useGameStore((state) => state.setCurrentUser);
  const currentUser = useGameStore((state) => state.currentUser);
  const isAutoSaveEnabled = useGameStore((state) => state.isAutoSaveEnabled);
  const saveCurrentProgress = useGameStore((state) => state.saveCurrentProgress);

  // Live Firebase Auth State Sync
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [setCurrentUser]);

  // Automatic Cloud Save at Season Boundary (Day 90 transition)
  useEffect(() => {
    if (dayOfSeason === 90 && isAutoSaveEnabled && currentUser) {
      saveCurrentProgress();
    }
  }, [dayOfSeason, isAutoSaveEnabled, currentUser, saveCurrentProgress]);

  // Core Simulation Heartbeat Loop:
  // Base interval: 1 day = 2000ms at 1x speed.
  // 90 days per season = 180 seconds (~3 minutes of real time per season as requested!)
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = Math.max(100, Math.round(2000 / gameSpeed));
    const timer = setInterval(() => {
      tick();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [tick, isPaused, gameSpeed]);

  // Fullscreen tracking for responsive layout scaling
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Bar Dashboard */}
      <Dashboard />

      {/* Main Simulation Viewport */}
      <main className={`flex-1 w-full mx-auto p-3 sm:p-4 flex flex-col gap-3 transition-all ${
        isFullscreen ? 'max-w-[98vw] 2xl:max-w-[1850px]' : 'max-w-7xl 2xl:max-w-[1680px]'
      }`}>
        {/* Farm Canvas 6x6 Viewport */}
        <div className="flex-1 flex flex-col">
          <FarmCanvas />
        </div>

        {/* Subsurface Water Table & Soil Geological Cross-Section */}
        <WaterTableCrossSection />

        {/* Interactive Action & Agronomic Tool Bar */}
        <ActionBar />
      </main>

      {/* Modals & Inspectors */}
      <TileInspector />
      <SeasonReportModal />
      <UpgradesModal />
      <NeighborFarmsModal />
      <ContractsModal />
      <GmailDeskModal />
      <AgroAcademyModal />
      <EcologicalImpactDashboardModal />
      <ClimateScenarioModal />
      <FieldNotesModal />
      <LeaderboardAndBadgesModal />
      <GameGuideModal />
      <BackgroundOptionsModal />
      <AgroQuizModal />
      <CloudDatabaseModal />
      <AuthModal />

      {/* Global Ambient App Wallpaper */}
      {backgroundSettings.enabled && backgroundSettings.applyToApp && (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
            style={{ 
              backgroundImage: `url(${getActiveBackgroundImage(backgroundSettings, farmSeason)})`,
              opacity: backgroundSettings.appOpacity,
              filter: `blur(${backgroundSettings.blur + 6}px)`
            }}
          />
          <div className="absolute inset-0 bg-stone-950/75" />
        </div>
      )}

      {/* Action Notification Toast */}
      {notification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          <div className={`px-4 py-2 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md border ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              : notification.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border-amber-500/50'
              : 'bg-stone-900/90 text-stone-200 border-stone-700'
          }`}>
            {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />}
            <span>{notification.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
