import { FarmState, UnlockedBadgeRecord, PointEventRecord } from './types';
import { 
  ACHIEVEMENTS, 
  AchievementBadge, 
  BASE_WATERSHED_LEAGUE, 
  WatershedFarmEntry, 
  getLevelForPoints,
  AgronomistLevel
} from '../config/achievements';
import { sound } from '../audio/sound';

export interface BadgeUnlockResult {
  newBadges: AchievementBadge[];
  updatedFarm: FarmState;
}

/**
 * Award EcoPoints to the farm, add to points history, and check for new badges.
 */
export function awardEcoPoints(
  farm: FarmState,
  amount: number,
  reason: string,
  icon: string = '⭐'
): FarmState {
  if (amount <= 0) return farm;

  const currentPoints = farm.ecoPoints || 0;
  const newTotal = currentPoints + amount;
  const history = farm.pointsHistory || [];

  const newEvent: PointEventRecord = {
    id: `pts_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    amount,
    reason,
    timestamp: Date.now(),
    icon
  };

  // Keep last 40 point events
  const updatedHistory = [newEvent, ...history].slice(0, 40);

  return {
    ...farm,
    ecoPoints: newTotal,
    pointsHistory: updatedHistory
  };
}

/**
 * Checks all achievement criteria against current farm state and awards newly unlocked badges.
 */
export function checkAndUnlockBadges(farm: FarmState): BadgeUnlockResult {
  const currentUnlockedIds = new Set((farm.unlockedBadges || []).map(b => b.badgeId));
  const newlyUnlocked: AchievementBadge[] = [];
  let pointsBonus = 0;
  const updatedBadgeRecords: UnlockedBadgeRecord[] = [...(farm.unlockedBadges || [])];
  const newHistory = [...(farm.pointsHistory || [])];

  for (const achievement of ACHIEVEMENTS) {
    if (!currentUnlockedIds.has(achievement.id)) {
      const progress = achievement.checkProgress(farm);
      if (progress.isUnlocked) {
        newlyUnlocked.push(achievement);
        pointsBonus += achievement.pointsReward;

        updatedBadgeRecords.push({
          badgeId: achievement.id,
          unlockedAt: Date.now(),
          season: farm.season,
          year: farm.year,
          pointsEarned: achievement.pointsReward
        });

        newHistory.unshift({
          id: `pts_badge_${achievement.id}_${Date.now()}`,
          amount: achievement.pointsReward,
          reason: `Achievement: ${achievement.title}`,
          timestamp: Date.now(),
          icon: achievement.icon
        });
      }
    }
  }

  if (newlyUnlocked.length > 0) {
    sound.playHarvest();
  }

  const updatedFarm: FarmState = {
    ...farm,
    ecoPoints: (farm.ecoPoints || 0) + pointsBonus,
    unlockedBadges: updatedBadgeRecords,
    pointsHistory: newHistory.slice(0, 40)
  };

  return {
    newBadges: newlyUnlocked,
    updatedFarm
  };
}

export type LeaderboardSortCategory = 'points' | 'carbon' | 'som' | 'sdg';

export interface RankedFarmEntry extends WatershedFarmEntry {
  rank: number;
  isPlayer: boolean;
  scoreDisplay: string;
  subStat: string;
}

/**
 * Computes the real-time dynamic Watershed Leaderboard rankings.
 * Simulates subtle seasonal progression among peers while accurately reflecting player metrics.
 */
export function getWatershedLeaderboard(
  farm: FarmState,
  category: LeaderboardSortCategory = 'points'
): {
  rankedList: RankedFarmEntry[];
  playerRank: number;
  playerLevel: AgronomistLevel;
  totalCompetitors: number;
} {
  const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / farm.tiles.length;
  const avgBeneficials = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / farm.tiles.length;
  const carbonTons = Math.max(0, parseFloat(((avgSOM - 28) * 0.18 * 3.67).toFixed(1)));
  const playerEcoPoints = farm.ecoPoints || 0;
  const playerBadgesCount = (farm.unlockedBadges || []).length;
  
  // Composite SDG rating
  const sdgScore = Math.min(100, Math.max(20, Math.round(
    (avgSOM * 0.4) + (avgBeneficials * 0.3) + (farm.consecutiveChemicalFreeSeasons * 8) + 20
  )));

  // Player's entry
  const playerEntry: WatershedFarmEntry = {
    id: 'player_farm',
    name: farm.farmName || 'TerraFarm Pioneer',
    manager: 'You (Head Agronomist)',
    avatar: '🌟',
    region: 'Active Parcel Basin',
    isPlayer: true,
    baseEcoPoints: playerEcoPoints,
    baseCarbonTons: carbonTons,
    baseSOM: Math.round(avgSOM),
    baseSdgScore: sdgScore,
    badgesCount: playerBadgesCount,
    specialty: 'Adaptive Regenerative Agro-Ecology'
  };

  // Seasonal simulation delta for AI competitors
  // As years/seasons progress, peers make modest steady gains
  const seasonalMultiplier = 1 + ((farm.year - 1) * 0.08) + ((farm.dayOfSeason / 90) * 0.02);

  const competitors: WatershedFarmEntry[] = BASE_WATERSHED_LEAGUE.map(comp => {
    return {
      ...comp,
      baseEcoPoints: Math.round(comp.baseEcoPoints * seasonalMultiplier),
      baseCarbonTons: parseFloat((comp.baseCarbonTons * (1 + (farm.year - 1) * 0.05)).toFixed(1)),
      baseSOM: Math.min(65, Math.round(comp.baseSOM + (farm.year - 1) * 0.5)),
      baseSdgScore: Math.min(99, Math.round(comp.baseSdgScore + (farm.year - 1) * 0.4))
    };
  });

  const allEntries = [...competitors, playerEntry];

  // Sort based on chosen category
  allEntries.sort((a, b) => {
    if (category === 'points') {
      return b.baseEcoPoints - a.baseEcoPoints;
    }
    if (category === 'carbon') {
      return b.baseCarbonTons - a.baseCarbonTons;
    }
    if (category === 'som') {
      return b.baseSOM - a.baseSOM;
    }
    if (category === 'sdg') {
      return b.baseSdgScore - a.baseSdgScore;
    }
    return b.baseEcoPoints - a.baseEcoPoints;
  });

  const rankedList: RankedFarmEntry[] = allEntries.map((entry, index) => {
    let scoreDisplay = '';
    let subStat = '';

    if (category === 'points') {
      scoreDisplay = `${entry.baseEcoPoints.toLocaleString()} pts`;
      subStat = `${entry.badgesCount} badges`;
    } else if (category === 'carbon') {
      scoreDisplay = `${entry.baseCarbonTons.toFixed(1)}t CO₂`;
      subStat = `${entry.baseSOM}% SOM`;
    } else if (category === 'som') {
      scoreDisplay = `${entry.baseSOM}% SOM`;
      subStat = `${entry.baseCarbonTons.toFixed(1)}t CO₂`;
    } else {
      scoreDisplay = `${entry.baseSdgScore}/100`;
      subStat = `SDG Rating`;
    }

    return {
      ...entry,
      rank: index + 1,
      scoreDisplay,
      subStat
    };
  });

  const playerRank = rankedList.findIndex(e => e.isPlayer) + 1;
  const playerLevel = getLevelForPoints(playerEcoPoints);

  return {
    rankedList,
    playerRank,
    playerLevel,
    totalCompetitors: rankedList.length
  };
}
