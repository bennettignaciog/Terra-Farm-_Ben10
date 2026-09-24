import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameStore';
import { TRANSLATIONS, Language } from '../config/translations';
import { LongTermTrendsChart } from './LongTermTrendsChart';
import { calculateFarmSdgReport } from '../config/educationalContent';
import { calculateEcologicalImpact } from '../simulation/ecologicalImpact';
import { CLIMATE_ZONES } from '../config/climates';
import { getLevelForPoints } from '../config/achievements';
import { AGRICULTURAL_QUIZZES } from '../config/quizzes';
import { 
  Play, 
  Pause, 
  FastForward, 
  Sun, 
  CloudRain, 
  Flame, 
  Bug, 
  Wind,
  Volume2, 
  VolumeX, 
  Globe, 
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Mail,
  BookOpen,
  Leaf,
  Menu,
  X,
  GraduationCap,
  Wrench,
  Users,
  Trophy,
  HelpCircle,
  Check,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';

const LANGUAGE_OPTIONS: { code: Language; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
];

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  gradientId: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, width = 64, height = 24, gradientId }) => {
  if (!data || data.length < 2) {
    return <div className="text-[10px] text-stone-500 font-mono italic">History: 1 season</div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const firstPoint = `2,${height}`;
  const lastPoint = `${width - 2},${height}`;
  const areaPoints = `${firstPoint} ${points} ${lastPoint}`;

  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 8) - 4;

  return (
    <svg width={width} height={height} className="overflow-visible flex-shrink-0">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Soft gradient fill under sparkline */}
      <polygon fill={`url(#${gradientId})`} points={areaPoints} />
      {/* Crisp line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Glowing end point */}
      <circle
        cx={width - 2}
        cy={lastY}
        r="2.5"
        fill={color}
      />
      <circle
        cx={width - 2}
        cy={lastY}
        r="4.5"
        fill={color}
        opacity="0.3"
        className="animate-ping"
      />
    </svg>
  );
};

export const Dashboard: React.FC = () => {
  const farm = useGameStore((state) => state.farm);
  const language = useGameStore((state) => state.language);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const togglePause = useGameStore((state) => state.togglePause);
  const setGameSpeed = useGameStore((state) => state.setGameSpeed);
  const advanceSeason = useGameStore((state) => state.advanceSeason);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const resetGame = useGameStore((state) => state.resetGame);
  const openModal = useGameStore((state) => state.openModal);
  const activeClimateZone = useGameStore((state) => state.activeClimateZone);
  const backgroundSettings = useGameStore((state) => state.backgroundSettings);
  const [showTrendsChart, setShowTrendsChart] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [menuTab, setMenuTab] = useState<'all' | 'intelligence' | 'operations' | 'community'>('all');
  const menuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsLangMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    if (isMenuOpen || isLangMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isLangMenuOpen]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const activeZone = CLIMATE_ZONES[activeClimateZone] || CLIMATE_ZONES.arid;

  // Real-time averages
  const totalTiles = farm.tiles.length;
  const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / totalTiles;
  const avgBeneficials = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / totalTiles;
  const avgPests = farm.tiles.reduce((acc, t) => acc + t.pestPressure, 0) / totalTiles;
  const avgCompaction = farm.tiles.reduce((acc, t) => acc + t.compaction, 0) / totalTiles;
  const avgSalinity = farm.tiles.reduce((acc, t) => acc + t.salinity, 0) / totalTiles;
  const avgMoisture = farm.tiles.reduce((acc, t) => acc + t.moisture, 0) / totalTiles;

  const currentSoilHealth = Math.min(100, Math.max(0, Math.round(
    (avgSOM * 0.45) + ((100 - avgCompaction) * 0.25) + ((100 - avgSalinity) * 0.15) + (avgBeneficials * 0.15)
  )));

  const currentWaterIndex = Math.min(100, Math.max(0, Math.round(
    ((30 - farm.groundwaterDepth) / 25 * 50) + (avgMoisture * 0.5)
  )));

  const currentBioIndex = Math.min(100, Math.max(0, Math.round(
    (avgBeneficials * 0.5) + ((100 - avgPests) * 0.3) + 
    ((farm.tiles.reduce((acc, t) => acc + t.earthwormPopulation, 0) / totalTiles) * 0.2)
  )));

  // Historical data arrays for sparklines
  const soilHistory = [...farm.history.map(h => h.soilHealthIndex), currentSoilHealth];
  const waterHistory = [...farm.history.map(h => h.waterIndex), currentWaterIndex];
  const bioHistory = [...farm.history.map(h => h.biodiversityIndex), currentBioIndex];
  const cashHistory = [...farm.history.map(h => h.cashEnd), farm.cashBalance];

  const sdgReport = calculateFarmSdgReport(farm);
  const ecoImpact = calculateEcologicalImpact(farm);
  const playerLevel = getLevelForPoints(farm.ecoPoints || 0);
  const unlockedBadgesCount = (farm.unlockedBadges || []).length;

  const quizStats = farm.quizStats || {
    answeredQuestions: {},
    currentStreak: 0,
    bestStreak: 0,
    totalEarnedEcoPoints: 0,
    totalEarnedCash: 0,
    claimedStreakMilestones: []
  };
  const answeredQuizCount = Object.keys(quizStats.answeredQuestions).length;
  const totalQuizCount = AGRICULTURAL_QUIZZES.length;

  const getWeatherIcon = () => {
    switch (farm.currentWeather) {
      case 'rain':
      case 'unseasonal_rain':
        return <CloudRain className="w-4 h-4 text-sky-400 animate-bounce" />;
      case 'heatwave':
      case 'drought':
        return <Flame className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'pest_swarm':
        return <Bug className="w-4 h-4 text-rose-500 animate-pulse" />;
      case 'wind':
        return <Wind className="w-4 h-4 text-teal-300 animate-pulse" />;
      default:
        return <Sun className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <header className="w-full bg-stone-900/90 backdrop-blur-md border-b border-stone-800/90 text-stone-100 px-3.5 sm:px-5 py-2.5 shadow-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left Side: Consolidated Modules Menu Button at Left Corner, Brand, Calendar & Weather */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            {/* Top-Left Consolidated Modules Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md group ${
                  isMenuOpen
                    ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-500/40 shadow-emerald-950/60'
                    : 'bg-stone-950/90 hover:bg-stone-850 text-stone-100 border-stone-700/80 hover:border-emerald-500/60'
                }`}
                title="Open Farm Modules Menu: Eco Impact, Field Notes, Climate Biomes, Academy, Trends, etc."
                aria-label="Open Farm Modules Menu"
              >
                <Menu className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-display tracking-wide">Menu</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-emerald-300' : ''}`} />
              </button>

              {/* Dropdown Menu Container */}
              {isMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-[340px] sm:w-[440px] bg-stone-950/95 border border-stone-700/90 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl overflow-hidden ring-1 ring-emerald-500/20">
                  {/* Menu Top Hero Header */}
                  <div className="p-3.5 bg-gradient-to-r from-emerald-950/90 via-stone-900 to-amber-950/70 border-b border-stone-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-lg shadow-inner shadow-emerald-500/20">
                        🌱
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black tracking-tight text-stone-100 font-display">Agro-Ecology Hub</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            Y{farm.year} · {farm.season}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-amber-400 font-medium">{playerLevel.badge} Lvl {playerLevel.level}</span>
                          <span>•</span>
                          <span className="font-mono text-stone-300">{(farm.ecoPoints || 0).toLocaleString()} pts</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 transition-colors"
                      title="Close menu (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Visual Category Filter Tabs */}
                  <div className="px-3 pt-2.5 pb-2 bg-stone-900/60 border-b border-stone-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => setMenuTab('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                        menuTab === 'all'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      All Modules (12)
                    </button>
                    <button
                      onClick={() => setMenuTab('intelligence')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                        menuTab === 'intelligence'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      <span>🔬</span>
                      <span>Science (5)</span>
                    </button>
                    <button
                      onClick={() => setMenuTab('operations')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                        menuTab === 'operations'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      <span>🚜</span>
                      <span>Farm Ops (4)</span>
                    </button>
                    <button
                      onClick={() => setMenuTab('community')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                        menuTab === 'community'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      <span>🏆</span>
                      <span>Community (3)</span>
                    </button>
                  </div>

                  {/* Menu Options Visual Cards Scroll Area */}
                  <div className="max-h-[68vh] overflow-y-auto p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-stone-700">
                    
                    {/* 1. Field Guide & Almanac (Master Codex) */}
                    {(menuTab === 'all' || menuTab === 'community') && (
                      <button
                        onClick={() => {
                          openModal('guide');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-stone-900 to-stone-900/90 hover:from-emerald-900/80 hover:via-stone-850 hover:to-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 transition-all text-left group shadow-sm hover:shadow-emerald-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner shadow-emerald-500/20 shrink-0">
                            <HelpCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
                                Field Guide & Almanac
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500 text-stone-950 font-black tracking-wider uppercase">
                                CODEX
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Master guide explaining all 36 features, soil metrics & simulation tools
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600/50">
                            Complete Guide
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 2. Watershed League & Badges */}
                    {(menuTab === 'all' || menuTab === 'community') && (
                      <button
                        onClick={() => {
                          openModal('leaderboard');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-stone-900/90 hover:from-amber-900/70 hover:via-stone-850 hover:to-amber-950/50 border border-amber-500/40 hover:border-amber-400 transition-all text-left group shadow-sm hover:shadow-amber-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner shadow-amber-500/20 shrink-0">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                                Watershed League & Badges
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-black tracking-wider uppercase">
                                HONORS
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Leaderboard, {unlockedBadgesCount}/13 Badges & Lvl {playerLevel.level} {playerLevel.title}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/50">
                            {unlockedBadgesCount}/13 Badges
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 3. Eco Impact Dashboard */}
                    {(menuTab === 'all' || menuTab === 'intelligence') && (
                      <button
                        onClick={() => {
                          openModal('eco_impact');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/50 via-stone-900 to-stone-900/90 hover:from-emerald-900/60 hover:via-stone-850 hover:to-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 transition-all text-left group shadow-sm hover:shadow-emerald-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                            <Leaf className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
                                Eco Impact & Carbon Storage
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-700 font-bold uppercase">
                                AUDIT
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Soil organic matter carbon storage, footprint & ecology
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600/50">
                            +{ecoImpact.totalCarbonSequesteredTons}t CO₂
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 4. Field Notes Journal */}
                    {(menuTab === 'all' || menuTab === 'intelligence') && (
                      <button
                        onClick={() => {
                          openModal('field_notes');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900/90 hover:from-amber-900/50 hover:via-stone-850 hover:to-amber-950/30 border border-amber-500/30 hover:border-amber-400 transition-all text-left group shadow-sm hover:shadow-amber-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                                Field Notes & Journal
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-900 text-amber-200 border border-amber-700 font-bold uppercase">
                                LOG
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Soil health milestones, weather alerts & farmer reflections
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/50">
                            {(farm.fieldNotes || []).length} Notes
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 5. Climate Scenario & Evaporation */}
                    {(menuTab === 'all' || menuTab === 'intelligence') && (
                      <button
                        onClick={() => {
                          openModal('climate');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-sky-950/50 via-stone-900 to-stone-900/90 hover:from-sky-900/60 hover:via-stone-850 hover:to-sky-950/40 border border-sky-500/30 hover:border-sky-400 transition-all text-left group shadow-sm hover:shadow-sky-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-sky-300 transition-colors">
                                Climate Biomes & Evaporation
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-sky-900 text-sky-200 border border-sky-700 font-bold uppercase">
                                BIOMES
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Dynamic evaporation physics, rainfall patterns & crop water demand
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-950/90 text-sky-300 border border-sky-600/50">
                            {activeZone.icon} {activeZone.evaporationMultiplier.toFixed(1)}× Evap
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 6. Agro Academy & UN SDGs */}
                    {(menuTab === 'all' || menuTab === 'intelligence') && (
                      <button
                        onClick={() => {
                          openModal('academy');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-purple-950/50 via-stone-900 to-stone-900/90 hover:from-purple-900/60 hover:via-stone-850 hover:to-purple-950/40 border border-purple-500/30 hover:border-purple-400 transition-all text-left group shadow-sm hover:shadow-purple-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-purple-300 transition-colors">
                                Agro Academy & UN SDGs
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-purple-900 text-purple-200 border border-purple-700 font-bold uppercase">
                                SCIENCE
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Living soil science, 7 UN SDGs & agroecology research
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-600/50">
                            Grade {sdgReport.overallGrade}
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* Agricultural Quizzes & Research Grants */}
                    {(menuTab === 'all' || menuTab === 'intelligence') && (
                      <button
                        onClick={() => {
                          openModal('quiz');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-stone-900 to-amber-950/40 hover:from-emerald-900/70 hover:via-stone-850 hover:to-amber-900/50 border border-emerald-500/40 hover:border-emerald-400 transition-all text-left group shadow-sm hover:shadow-emerald-950/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-6 transition-transform shrink-0">
                            🌾
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
                                Agro-Science Quizzes & Grants
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-700 font-bold uppercase">
                                REWARDS
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Soil biology, hydrology, IPM & polyculture quizzes with cash grants
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600/50">
                            {quizStats.currentStreak > 0 ? `${quizStats.currentStreak}🔥 Streak` : `${answeredQuizCount}/${totalQuizCount}`}
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 7. 12-Season Trends Chart */}
                    {(menuTab === 'all' || menuTab === 'intelligence') && (
                      <button
                        onClick={() => {
                          setShowTrendsChart(!showTrendsChart);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-teal-950/50 via-stone-900 to-stone-900/90 hover:from-teal-900/60 hover:via-stone-850 hover:to-teal-950/40 border border-teal-500/30 hover:border-teal-400 transition-all text-left group shadow-sm hover:shadow-teal-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-teal-300 transition-colors">
                                12-Season Trends Chart
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-teal-900 text-teal-200 border border-teal-700 font-bold uppercase">
                                TELEMETRY
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Longitudinal graphs of organic matter, groundwater & profits
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            showTrendsChart
                              ? 'bg-teal-900 text-teal-200 border-teal-500'
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}>
                            {showTrendsChart ? '● Active' : '○ Toggle Graph'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 8. Fair Trade & Organic Contracts */}
                    {(menuTab === 'all' || menuTab === 'operations') && (
                      <button
                        onClick={() => {
                          openModal('contracts');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-950/50 via-stone-900 to-stone-900/90 hover:from-amber-900/60 hover:via-stone-850 hover:to-amber-950/40 border border-amber-500/30 hover:border-amber-400 transition-all text-left group shadow-sm hover:shadow-amber-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                                Contracts & Organic Premiums
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-900 text-amber-200 border border-amber-700 font-bold uppercase">
                                MARKETS
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Forward buyer contracts & chem-free certification for +50% price bonus
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/50">
                            {farm.hasOrganicCertification ? '✓ Organic' : `${farm.consecutiveChemicalFreeSeasons}/3 Chem-Free`}
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 9. Farm Infrastructure Upgrades */}
                    {(menuTab === 'all' || menuTab === 'operations') && (
                      <button
                        onClick={() => {
                          openModal('upgrades');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-blue-950/50 via-stone-900 to-stone-900/90 hover:from-blue-900/60 hover:via-stone-850 hover:to-blue-950/40 border border-blue-500/30 hover:border-blue-400 transition-all text-left group shadow-sm hover:shadow-blue-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                            <Wrench className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-blue-300 transition-colors">
                                Farm Infrastructure & Upgrades
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-900 text-blue-200 border border-blue-700 font-bold uppercase">
                                AGRO-TECH
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Drip lines, biochar kiln, compost bay, farm pond & livestock
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-950/90 text-blue-300 border border-blue-600/50">
                            Equip Hub
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 10. Extension Mail & Dispatches */}
                    {(menuTab === 'all' || menuTab === 'operations') && (
                      <button
                        onClick={() => {
                          openModal('gmail');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-rose-950/50 via-stone-900 to-stone-900/90 hover:from-rose-900/60 hover:via-stone-850 hover:to-rose-950/40 border border-rose-500/30 hover:border-rose-400 transition-all text-left group shadow-sm hover:shadow-rose-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-rose-300 transition-colors">
                                Extension Mail & Letters
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-rose-900 text-rose-200 border border-rose-700 font-bold uppercase">
                                LETTERS
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Research updates & university extension letters
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950/90 text-rose-300 border border-rose-600/50">
                            Advisories
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 11. Watershed Neighbor Network */}
                    {(menuTab === 'all' || menuTab === 'community') && (
                      <button
                        onClick={() => {
                          openModal('neighbors');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/50 via-stone-900 to-stone-900/90 hover:from-indigo-900/60 hover:via-stone-850 hover:to-indigo-950/40 border border-indigo-500/30 hover:border-indigo-400 transition-all text-left group shadow-sm hover:shadow-indigo-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-purple-300 transition-colors">
                                Watershed Neighbor Network
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-900 text-indigo-200 border border-indigo-700 font-bold uppercase">
                                CO-OP
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Community agreements, shared machinery & biodiversity corridors
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-950/90 text-indigo-300 border border-indigo-600/50">
                            Watershed
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}

                    {/* 12. Farm Scenery & Background Images */}
                    {(menuTab === 'all' || menuTab === 'operations') && (
                      <button
                        onClick={() => {
                          openModal('background');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-stone-900 to-stone-900/90 hover:from-emerald-900/70 hover:via-stone-850 hover:to-emerald-950/50 border border-emerald-500/40 hover:border-emerald-400 transition-all text-left group shadow-sm hover:shadow-emerald-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
                                Farm Scenery & Background Options
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-700 font-bold uppercase">
                                VISUALS
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors line-clamp-1">
                              Agroforestry landscape backdrops, ambient wallpaper & custom uploads
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600/50">
                            {backgroundSettings.enabled ? '🖼️ Active' : 'Off'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Menu Footer */}
                  <div className="px-4 py-2.5 bg-stone-950 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">{activeZone.icon}</span>
                      <span className="font-semibold text-stone-300">{activeZone.name}</span>
                      <span className="text-[10px] text-stone-500 font-mono">({activeZone.evaporationMultiplier}x Evap)</span>
                    </span>
                    <span className="font-mono text-stone-500 text-[10px] flex items-center gap-1">
                      <span className="px-1.5 py-0.2 rounded bg-stone-900 border border-stone-800 text-stone-400">Esc</span> to close
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Access Watershed Standings & Points Button */}
            <button
              onClick={() => openModal('leaderboard')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/50 to-stone-900 border border-amber-500/40 hover:border-amber-400 text-stone-200 hover:text-white transition-all shadow-sm active:scale-95 group"
              title="Watershed Standings, Badges & Points"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-xs font-bold text-amber-300">
                {(farm.ecoPoints || 0).toLocaleString()} <span className="text-[10px] text-amber-400/80 font-normal">pts</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-200 border border-amber-500/30">
                <span>{playerLevel.badge}</span>
                <span>Lvl {playerLevel.level}</span>
              </span>
            </button>

            {/* Brand Logo & Title */}
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
                  🌱
                </div>
                <h1 className="text-base font-extrabold tracking-tight text-stone-100 flex items-center gap-2">
                  <span className="text-emerald-400 font-display">TerraFarm</span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 uppercase tracking-widest hidden sm:inline">
                    Agro-Ecology Sim
                  </span>
                </h1>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-mono text-stone-300 mt-1">
                <span className="font-bold text-amber-300">Y{farm.year} {farm.season}</span>
                <span className="text-stone-600">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-300">Day {farm.dayOfSeason}/90</span>
                  <div className="w-12 h-1.5 bg-stone-800 rounded-full overflow-hidden inline-block" title={`Season Progress: ${Math.round((farm.dayOfSeason / 90) * 100)}%`}>
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
                      style={{ width: `${(farm.dayOfSeason / 90) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-stone-600">•</span>
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-800/80 border border-stone-700/60">
                  {getWeatherIcon()}
                  <span className="font-semibold text-stone-200">{farm.temperatureToday}°C</span>
                  {farm.rainfallToday > 0 && <span className="text-sky-300 font-semibold">+{farm.rainfallToday}mm</span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Dynamic Metric Sparklines (The True Health Feedback) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
          {/* 1. Cash Balance */}
          <div className="bg-stone-950/80 border border-stone-800/90 hover:border-emerald-500/40 transition-colors rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2.5 shadow-sm">
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">{t.cash}</div>
              <div className="text-sm font-bold font-mono text-emerald-300">${farm.cashBalance.toLocaleString()}</div>
            </div>
            <Sparkline data={cashHistory} color="#10b981" gradientId="spark-cash" />
          </div>

          {/* 2. Soil Health Index */}
          <div className="bg-stone-950/80 border border-stone-800/90 hover:border-amber-500/40 transition-colors rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2.5 shadow-sm">
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">{t.soilHealth}</div>
              <div className="text-sm font-bold font-mono text-amber-300">{currentSoilHealth}<span className="text-[10px] text-stone-500 font-normal">/100</span></div>
            </div>
            <Sparkline data={soilHistory} color="#f59e0b" gradientId="spark-soil" />
          </div>

          {/* 3. Water Table Index */}
          <div className="bg-stone-950/80 border border-stone-800/90 hover:border-sky-500/40 transition-colors rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2.5 shadow-sm">
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Water Index</div>
              <div className="text-sm font-bold font-mono text-sky-300">{currentWaterIndex}<span className="text-[10px] text-stone-500 font-normal">/100</span></div>
            </div>
            <Sparkline data={waterHistory} color="#38bdf8" gradientId="spark-water" />
          </div>

          {/* 4. Biodiversity Index */}
          <div 
            onClick={() => openModal('eco_impact')}
            className="bg-stone-950/80 border border-stone-800/90 hover:border-purple-500/60 hover:bg-stone-900 transition-all rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2.5 shadow-sm cursor-pointer group"
            title="Click to open Ecological Impact Dashboard & Biodiversity Breakdown"
          >
            <div>
              <div className="text-[10px] text-stone-400 group-hover:text-purple-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                {t.biodiversity}
                <Sparkles className="w-2.5 h-2.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-sm font-bold font-mono text-purple-300">{currentBioIndex}<span className="text-[10px] text-stone-500 font-normal">/100</span></div>
            </div>
            <Sparkline data={bioHistory} color="#c084fc" gradientId="spark-bio" />
          </div>
        </div>

        {/* Right Side: Simulation Time & Speed Controls, Audio & Language */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap sm:flex-nowrap">
          {/* Time & Speed Controls */}
          <div className="flex items-center gap-1 bg-stone-950/90 p-1 rounded-xl border border-stone-800 shadow-inner">
            <button
              onClick={togglePause}
              className={`p-1.5 rounded-lg transition-all ${
                farm.isPaused 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'hover:bg-stone-800 text-stone-300 active:scale-95'
              }`}
              title={farm.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            >
              {farm.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={() => setGameSpeed(1)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                farm.gameSpeed === 1 && !farm.isPaused 
                  ? 'bg-emerald-600 text-white font-bold shadow-sm' 
                  : 'hover:bg-stone-800 text-stone-400 active:scale-95'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setGameSpeed(2)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                farm.gameSpeed === 2 && !farm.isPaused 
                  ? 'bg-emerald-600 text-white font-bold shadow-sm' 
                  : 'hover:bg-stone-800 text-stone-400 active:scale-95'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => setGameSpeed(5)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                farm.gameSpeed === 5 && !farm.isPaused 
                  ? 'bg-emerald-600 text-white font-bold shadow-sm' 
                  : 'hover:bg-stone-800 text-stone-400 active:scale-95'
              }`}
            >
              5x
            </button>

            <button
              onClick={advanceSeason}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-800/90 hover:bg-stone-700 text-amber-200 border border-stone-700/60 transition-all active:scale-95 shadow-sm"
              title="Fast forward to harvest & season report"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Next Season</span>
            </button>
          </div>

          {/* Organic Status Quick Badge */}
          {farm.hasOrganicCertification ? (
            <div 
              onClick={() => openModal('contracts')}
              className="cursor-pointer bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1.5 hover:bg-emerald-900 transition-colors shadow-sm"
              title="Certified Organic: +50% Market Premium"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Organic (+50%)</span>
            </div>
          ) : (
            <div 
              onClick={() => openModal('contracts')}
              className="cursor-pointer bg-stone-950 border border-stone-800 text-stone-400 text-[11px] px-2 py-1 rounded-lg flex items-center gap-1.5 hover:text-stone-200 hover:bg-stone-900 transition-colors"
              title="Chemical-Free Seasons Progress toward Organic Certification"
            >
              <span className="hidden sm:inline">Chem-Free:</span>
              <span className="font-mono text-stone-300">{farm.consecutiveChemicalFreeSeasons}/3</span>
            </div>
          )}

          {/* Top-Right Farm Scenery & Backgrounds Button */}
          <button
            onClick={() => openModal('background')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all active:scale-95 shadow-sm group ${
              backgroundSettings.enabled
                ? 'bg-stone-900 border-stone-700/80 hover:border-emerald-500 text-stone-200 hover:text-white hover:bg-stone-850'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-300'
            }`}
            title="Farm Landscape Scenery & Background Image Options"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold hidden sm:inline">Scenery</span>
            {backgroundSettings.enabled ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">Off</span>
            )}
          </button>

          {/* Top-Right Game Guide / Feature Almanac Button */}
          <button
            onClick={() => openModal('guide')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-950 border border-emerald-500/60 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 transition-all active:scale-95 shadow-sm hover:bg-emerald-900 group"
            title="Game Guide & Almanac: Complete explanation of every feature, tool, and mechanic in TerraFarm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold">Game Guide</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-800 text-emerald-200 hidden sm:inline">?</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Language Selector Dropdown (Single Icon) */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className={`px-2 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                isLangMenuOpen
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-stone-950 border-stone-800 hover:bg-stone-800 text-stone-300 hover:text-white'
              }`}
              title="Select Language"
              aria-label="Select language"
              aria-expanded={isLangMenuOpen}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase">
                {language}
              </span>
              <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-150 ${isLangMenuOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-stone-950/95 border border-stone-700/90 shadow-2xl overflow-hidden z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl ring-1 ring-emerald-500/20">
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-stone-400 tracking-wider border-b border-stone-800/80 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Language / भाषा</span>
                  </span>
                  <span className="text-[9px] font-mono text-stone-500">6 Locales</span>
                </div>
                <div className="space-y-1">
                  {LANGUAGE_OPTIONS.map((opt) => {
                    const isSelected = language === opt.code;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => {
                          setLanguage(opt.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all text-left group ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold shadow-md shadow-emerald-950/50'
                            : 'text-stone-300 hover:bg-stone-850 hover:text-white border border-transparent hover:border-stone-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base group-hover:scale-115 transition-transform">{opt.flag}</span>
                          <div>
                            <div className="leading-tight font-semibold text-stone-100">{opt.native}</div>
                            <div className={`text-[10px] font-mono leading-none ${isSelected ? 'text-emerald-100' : 'text-stone-400 group-hover:text-stone-300'}`}>
                              {opt.label}
                            </div>
                          </div>
                        </div>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-stone-500 uppercase">{opt.code}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Topmost Right Corner: Agricultural Science Quiz & Rewards */}
          <button
            onClick={() => openModal('quiz')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/60 border border-emerald-400/60 hover:border-emerald-300 transition-all active:scale-95 group shrink-0"
            title="Agricultural Science Quizzes & Research Grants: Test your knowledge to win Cash Grants & EcoPoints!"
          >
            <span className="text-sm group-hover:scale-110 group-hover:rotate-12 transition-transform">🌾</span>
            <span className="font-extrabold tracking-wide">Agro-Quiz</span>
            {quizStats.currentStreak > 0 ? (
              <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 flex items-center gap-0.5 animate-pulse">
                <span>{quizStats.currentStreak}</span>
                <span>🔥</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-200 border border-emerald-500/40">
                {answeredQuizCount}/{totalQuizCount}
              </span>
            )}
            {quizStats.totalEarnedCash > 0 && (
              <span className="text-[10px] font-mono font-bold text-amber-200 hidden xl:inline">
                +${quizStats.totalEarnedCash.toLocaleString()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable 12-Season Recharts Long-Term Trends Chart */}
      {showTrendsChart && (
        <div className="max-w-7xl mx-auto mt-2.5">
          <LongTermTrendsChart />
        </div>
      )}
    </header>
  );
};
