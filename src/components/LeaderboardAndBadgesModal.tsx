import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  X, 
  CheckCircle2, 
  Lock, 
  Edit2, 
  Check, 
  Sparkles, 
  Globe, 
  Droplet, 
  ShieldAlert, 
  Layers, 
  Flame, 
  Info,
  ChevronRight,
  Star,
  Database,
  Cloud
} from 'lucide-react';
import { 
  ACHIEVEMENTS, 
  AGRONOMIST_LEVELS, 
  getLevelForPoints, 
  BadgeCategory, 
  BadgeTier 
} from '../config/achievements';
import { getWatershedLeaderboard, LeaderboardSortCategory } from '../simulation/gamification';
import { fetchCloudLeaderboard, CloudLeaderboardItem } from '../services/firebase';

export const LeaderboardAndBadgesModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const openModal = useGameStore((state) => state.openModal);
  const farm = useGameStore((state) => state.farm);
  const setFarmName = useGameStore((state) => state.setFarmName);

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'cloud' | 'badges' | 'levels'>('leaderboard');
  const [leaderboardCategory, setLeaderboardCategory] = useState<LeaderboardSortCategory>('points');
  const [cloudScores, setCloudScores] = useState<CloudLeaderboardItem[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState<BadgeCategory | 'all'>('all');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempFarmName, setTempFarmName] = useState(farm.farmName || 'TerraFarm Pioneer');

  useEffect(() => {
    if (activeTab === 'cloud' && activeModal === 'leaderboard') {
      setIsLoadingCloud(true);
      fetchCloudLeaderboard(25)
        .then(setCloudScores)
        .catch(console.error)
        .finally(() => setIsLoadingCloud(false));
    }
  }, [activeTab, activeModal]);

  if (activeModal !== 'leaderboard') return null;

  const currentLevel = getLevelForPoints(farm.ecoPoints || 0);
  const nextLevel = AGRONOMIST_LEVELS.find(l => l.level === currentLevel.level + 1);
  const pointsInCurrentLevel = (farm.ecoPoints || 0) - currentLevel.minPoints;
  const pointsLevelSpan = nextLevel ? nextLevel.minPoints - currentLevel.minPoints : 1000;
  const levelProgressPercent = nextLevel 
    ? Math.min(100, Math.max(0, Math.round((pointsInCurrentLevel / pointsLevelSpan) * 100))) 
    : 100;

  const { rankedList, playerRank } = getWatershedLeaderboard(farm, leaderboardCategory);
  const unlockedBadgeMap = new Map((farm.unlockedBadges || []).map(b => [b.badgeId, b]));

  const filteredBadges = ACHIEVEMENTS.filter(b => {
    if (selectedBadgeCategory === 'all') return true;
    return b.category === selectedBadgeCategory;
  });

  const unlockedCount = (farm.unlockedBadges || []).length;
  const totalBadgesCount = ACHIEVEMENTS.length;
  const badgeCompletionPercent = Math.round((unlockedCount / totalBadgesCount) * 100);

  const handleSaveFarmName = () => {
    if (tempFarmName.trim()) {
      setFarmName(tempFarmName.trim());
    }
    setIsEditingName(false);
  };

  const getTierColor = (tier: BadgeTier) => {
    switch (tier) {
      case 'platinum':
        return 'text-cyan-300 border-cyan-500/50 bg-cyan-950/40';
      case 'gold':
        return 'text-amber-300 border-amber-500/50 bg-amber-950/40';
      case 'silver':
        return 'text-slate-200 border-slate-400/50 bg-slate-800/40';
      case 'bronze':
      default:
        return 'text-amber-500 border-amber-700/50 bg-amber-950/30';
    }
  };

  const topThree = rankedList.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950/70 p-4 sm:p-5 border-b border-stone-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-inner">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-stone-100 flex items-center gap-2">
                    Watershed League & Achievements
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300">
                      Season {farm.season} • Y{farm.year}
                    </span>
                  </h2>
                  <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>Active Watershed Basin</span>
                    <span>•</span>
                    <span className="text-emerald-300 font-medium">Rank #{playerRank} of {rankedList.length}</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">{(farm.ecoPoints || 0).toLocaleString()} EcoPoints</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Player Agronomist Card & Level Progression Bar */}
          <div className="mt-4 p-3 rounded-xl bg-stone-950/70 border border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                {currentLevel.badge}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text" 
                        value={tempFarmName}
                        onChange={(e) => setTempFarmName(e.target.value)}
                        className="bg-stone-900 border border-emerald-500/60 rounded px-2 py-0.5 text-xs text-stone-100 focus:outline-none"
                        maxLength={28}
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveFarmName}
                        className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-stone-100 truncate">{farm.farmName || 'TerraFarm Pioneer'}</span>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="text-stone-400 hover:text-stone-200 transition-colors"
                        title="Rename Farm"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-mono">
                    Lvl {currentLevel.level}
                  </span>
                </div>
                <div className="text-xs text-emerald-400 font-semibold truncate">
                  {currentLevel.title}
                </div>
                <div className="text-[11px] text-stone-400 line-clamp-1">
                  {currentLevel.description}
                </div>
              </div>
            </div>

            {/* Level XP Meter */}
            <div className="w-full sm:w-64 shrink-0">
              <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                <span className="text-stone-400">Level Progress</span>
                <span className="text-amber-300 font-semibold">
                  {(farm.ecoPoints || 0).toLocaleString()} {nextLevel ? `/ ${nextLevel.minPoints.toLocaleString()} pts` : 'MAX'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 transition-all duration-500 rounded-full"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-stone-400 text-right mt-0.5">
                {nextLevel ? `${(nextLevel.minPoints - (farm.ecoPoints || 0)).toLocaleString()} pts to Level ${nextLevel.level}` : 'Highest Master Tier Reached'}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 border border-transparent'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Watershed Standings</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-300 font-mono">
                #{playerRank}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cloud')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'cloud'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 border border-transparent'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Global Cloud DB</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>

            <button
              onClick={() => setActiveTab('badges')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'badges'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 border border-transparent'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Badges & Milestones</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 font-mono">
                {unlockedCount}/{totalBadgesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('levels')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'levels'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 border border-transparent'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Agronomist Ranks</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Watershed Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-xs text-stone-400 font-semibold">Rank Basin By:</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setLeaderboardCategory('points')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    leaderboardCategory === 'points'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  ⭐ EcoPoints
                </button>
                <button
                  onClick={() => setLeaderboardCategory('carbon')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    leaderboardCategory === 'carbon'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  🪵 Carbon Stored (CO₂)
                </button>
                <button
                  onClick={() => setLeaderboardCategory('som')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    leaderboardCategory === 'som'
                      ? 'bg-amber-700 text-white font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  🪱 Soil Organic Matter
                </button>
                <button
                  onClick={() => setLeaderboardCategory('sdg')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    leaderboardCategory === 'sdg'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  🌐 UN SDG Rating
                </button>
              </div>
            </div>

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topThree.map((farmEntry, idx) => {
                const podiumMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                const borderClass = idx === 0 
                  ? 'border-amber-400/60 bg-gradient-to-b from-amber-950/40 to-stone-900' 
                  : idx === 1 
                  ? 'border-slate-400/50 bg-gradient-to-b from-slate-900/60 to-stone-900' 
                  : 'border-amber-700/50 bg-gradient-to-b from-amber-950/20 to-stone-900';

                return (
                  <div 
                    key={farmEntry.id}
                    className={`relative p-3.5 rounded-xl border ${borderClass} flex flex-col justify-between shadow-lg ${
                      farmEntry.isPlayer ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-stone-950' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{podiumMedal}</span>
                        <div>
                          <div className="text-xs font-bold text-stone-100 flex items-center gap-1">
                            {farmEntry.name}
                            {farmEntry.isPlayer && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1 py-0.2 rounded font-mono">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400">{farmEntry.manager}</div>
                        </div>
                      </div>
                      <div className="text-lg">{farmEntry.avatar}</div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-mono">{farmEntry.specialty}</div>
                        <div className="text-xs text-stone-300">{farmEntry.region}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold font-mono text-amber-300">
                          {farmEntry.scoreDisplay}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {farmEntry.subStat}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complete Watershed Standings Table */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl overflow-hidden shadow-inner">
              <div className="px-3.5 py-2.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-xs font-semibold text-stone-300">
                <span>Watershed Basin Farm Standings</span>
                <span className="text-[11px] text-stone-400 font-mono">10 Agricultural Parcels</span>
              </div>

              <div className="divide-y divide-stone-800/60">
                {rankedList.map((entry) => {
                  const isPlayerRow = entry.isPlayer;

                  return (
                    <div 
                      key={entry.id}
                      className={`px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                        isPlayerRow 
                          ? 'bg-emerald-950/50 border-l-4 border-l-emerald-400 hover:bg-emerald-950/70 font-semibold' 
                          : 'hover:bg-stone-900/70'
                      }`}
                    >
                      {/* Left: Rank & Farm Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 text-center font-mono font-bold text-stone-300">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </div>
                        <div className="text-xl shrink-0">{entry.avatar}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`truncate ${isPlayerRow ? 'text-emerald-200 font-bold' : 'text-stone-200'}`}>
                              {entry.name}
                            </span>
                            {isPlayerRow && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300 border border-emerald-500/40 uppercase tracking-widest font-mono">
                                Your Farm
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate flex items-center gap-1.5">
                            <span>{entry.manager}</span>
                            <span>•</span>
                            <span className="text-stone-400">{entry.specialty}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Scores & Badges */}
                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <div className="hidden sm:block">
                          <div className="text-stone-300 font-mono text-xs">{entry.subStat}</div>
                          <div className="text-[10px] text-stone-400">{entry.region}</div>
                        </div>

                        <div className="w-24 text-right">
                          <div className={`font-mono text-sm font-extrabold ${isPlayerRow ? 'text-emerald-300' : 'text-amber-300'}`}>
                            {entry.scoreDisplay}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {entry.badgesCount} badges
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scientific Agronomic Context Note */}
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-[11px] text-stone-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-stone-200 font-semibold">How Watershed Standings Work:</span>{' '}
                Unlike conventional industrial agricultural metrics that only reward short-term extraction, the Watershed League rewards regenerative soil building, subterranean carbon storage, biodiversity indices, and groundwater recharge. Every compost application, companion crop, and chemical-free season boosts your rank.
              </div>
            </div>
          </div>
        )}

        {/* Tab: Global Firestore Cloud Leaderboard */}
        {activeTab === 'cloud' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-cyan-950/70 via-stone-900 to-emerald-950/70 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Global Firestore Cloud Standings</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Live Database Sync
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Regenerative farmers worldwide synced to the Firestore database
                  </p>
                </div>
              </div>
              <button
                onClick={() => openModal('database')}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Open Cloud DB</span>
              </button>
            </div>

            {isLoadingCloud ? (
              <div className="p-12 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading global rankings from Firestore...</span>
              </div>
            ) : cloudScores.length === 0 ? (
              <div className="p-8 text-center bg-stone-950/60 border border-stone-800 rounded-xl space-y-3">
                <Trophy className="w-10 h-10 text-stone-600 mx-auto opacity-50" />
                <div className="text-stone-300 text-sm font-bold">No global farm records published yet!</div>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Be the first agroecological pioneer to establish the benchmark on the global Firestore leaderboard.
                </p>
                <button
                  onClick={() => openModal('database')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-md transition-all"
                >
                  <Cloud className="w-4 h-4" />
                  Publish Current Farm to Cloud
                </button>
              </div>
            ) : (
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl overflow-hidden shadow-md">
                <div className="px-3.5 py-2.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-xs font-semibold text-stone-300">
                  <span>Global Regenerative Farms</span>
                  <span className="text-[11px] text-stone-400 font-mono">{cloudScores.length} Records</span>
                </div>
                <div className="divide-y divide-stone-800/60">
                  {cloudScores.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-stone-900/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 text-center font-mono font-bold text-stone-300">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">{entry.farmName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 font-mono capitalize">
                              {entry.climateZone}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-400 truncate flex items-center gap-1.5">
                            <span>{entry.farmerName}</span>
                            <span>•</span>
                            <span>Year {entry.year} ({entry.seasonName})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-right font-mono">
                        <div>
                          <div className="text-amber-400 font-bold text-xs">{entry.ecoPoints.toLocaleString()} pts</div>
                          <div className="text-[10px] text-stone-500">{entry.biodiversityScore}% bio · {entry.soilHealthAverage}% soil</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Badges & Achievements */}
        {activeTab === 'badges' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            {/* Badges Progress Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-950/80 border border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                  🎖️
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-200">
                    Regenerative Milestone Badges
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Earn permanent EcoPoints and unlock prestigious agro-ecological honors
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-36 h-2.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${badgeCompletionPercent}%` }}
                  />
                </div>
                <div className="text-xs font-mono font-bold text-emerald-300 shrink-0">
                  {unlockedCount} / {totalBadgesCount} ({badgeCompletionPercent}%)
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'soil', 'water', 'biodiversity', 'carbon', 'mastery'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedBadgeCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                    selectedBadgeCategory === cat 
                      ? 'bg-emerald-600 text-white font-semibold' 
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {cat === 'all' ? 'All Badges' : cat}
                </button>
              ))}
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredBadges.map((badge) => {
                const unlockedRecord = unlockedBadgeMap.get(badge.id);
                const isUnlocked = !!unlockedRecord;
                const progress = badge.checkProgress(farm);
                const tierClass = getTierColor(badge.tier);

                return (
                  <div 
                    key={badge.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isUnlocked 
                        ? 'bg-stone-950/80 border-emerald-500/50 shadow-md shadow-emerald-950/20' 
                        : 'bg-stone-950/40 border-stone-800/80 opacity-90'
                    }`}
                  >
                    <div>
                      {/* Badge Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                            isUnlocked 
                              ? 'bg-emerald-950/80 border-emerald-500/40 shadow-inner' 
                              : 'bg-stone-900 border-stone-800 grayscale'
                          }`}>
                            {badge.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className={`text-xs font-bold ${isUnlocked ? 'text-stone-100' : 'text-stone-300'}`}>
                                {badge.title}
                              </h4>
                              {isUnlocked ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Lock className="w-3 h-3 text-stone-400" />
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400 font-medium">
                              {badge.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold border ${tierClass}`}>
                            {badge.tier}
                          </span>
                          <span className="text-[10px] font-mono text-amber-300 font-bold">
                            +{badge.pointsReward} pts
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-stone-300 mt-2.5 leading-relaxed">
                        {badge.description}
                      </p>

                      {/* Science Insight */}
                      <div className="mt-2.5 p-2 rounded-lg bg-stone-900/80 border border-stone-800/80 text-[11px] text-stone-400 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="italic">{badge.scienceInsight}</span>
                      </div>
                    </div>

                    {/* Progress Bar / Unlock Date Footer */}
                    <div className="mt-3 pt-2.5 border-t border-stone-800/80">
                      {isUnlocked ? (
                        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                          <span>Status: Completed</span>
                          <span>Unlocked {unlockedRecord.season} Y{unlockedRecord.year}</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 mb-1">
                            <span>Progress</span>
                            <span className="text-stone-300 font-semibold">{progress.displayValue} ({progress.progressPercent}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${progress.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Agronomist Ranks & Levels Roadmap */}
        {activeTab === 'levels' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800">
              <div className="text-xs font-bold text-stone-200">
                Agronomist Career Tier Roadmap
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                Each regenerative practice awards EcoPoints that elevate your professional standing from industrial novice to Living Earth Master.
              </div>
            </div>

            {/* Level Steps */}
            <div className="space-y-2.5">
              {AGRONOMIST_LEVELS.map((lvl) => {
                const isCurrent = lvl.level === currentLevel.level;
                const isPassed = (farm.ecoPoints || 0) >= lvl.maxPoints;

                return (
                  <div 
                    key={lvl.level}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isCurrent 
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50' 
                        : isPassed 
                        ? 'bg-stone-950/60 border-stone-800' 
                        : 'bg-stone-950/20 border-stone-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                        isCurrent 
                          ? 'bg-emerald-900/80 border-emerald-400 text-2xl' 
                          : isPassed 
                          ? 'bg-stone-900 border-stone-700' 
                          : 'bg-stone-900/40 border-stone-800 grayscale'
                      }`}>
                        {lvl.badge}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-100">
                            Level {lvl.level}: {lvl.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500 text-stone-950 font-bold font-mono">
                              Current Rank
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-400">
                          {lvl.description}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-amber-300">
                        {lvl.minPoints.toLocaleString()} - {lvl.maxPoints > 50000 ? '∞' : lvl.maxPoints.toLocaleString()} pts
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {isPassed ? 'Achieved' : isCurrent ? `${pointsInCurrentLevel} / ${pointsLevelSpan} pts` : 'Locked'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Point Events History Stream */}
            <div className="mt-2 bg-stone-950/70 border border-stone-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  Recent Point Award Log
                </span>
                <span className="text-[10px] font-mono text-stone-400">Live Telemetry</span>
              </div>

              <div className="divide-y divide-stone-850 max-h-48 overflow-y-auto">
                {(farm.pointsHistory && farm.pointsHistory.length > 0) ? (
                  farm.pointsHistory.slice(0, 10).map((evt) => (
                    <div key={evt.id} className="py-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>{evt.icon}</span>
                        <span className="text-stone-300">{evt.reason}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">
                        +{evt.amount} pts
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-stone-400">
                    No recent point events logged yet. Perform regenerative practices to earn points!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span>🌟 Total Points:</span>
            <span className="font-mono font-bold text-amber-300">{(farm.ecoPoints || 0).toLocaleString()}</span>
            <span>•</span>
            <span>Badges Unlocked:</span>
            <span className="font-mono font-bold text-emerald-300">{unlockedCount} / {totalBadgesCount}</span>
          </div>

          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
