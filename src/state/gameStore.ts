import { create } from 'zustand';
import { 
  FarmState, 
  ToolAction, 
  SeasonReportRecord,
  FieldNoteCategory,
  FieldNoteEntry
} from '../simulation/types';
import { 
  createInitialFarmState, 
  tickDay, 
  executeToolAction, 
  endSeasonTransition 
} from '../simulation/engine';
import { awardEcoPoints, checkAndUnlockBadges } from '../simulation/gamification';
import { CLIMATE_ZONES } from '../config/climates';
import { Language } from '../config/translations';
import { sound } from '../audio/sound';
import { AGRO_SCENARIOS } from '../config/scenarios';
import { CROPS } from '../config/crops';
import { 
  BackgroundSettings, 
  loadBackgroundSettings, 
  saveBackgroundSettings, 
  DEFAULT_BACKGROUND_SETTINGS,
  BACKGROUND_PRESETS 
} from '../config/backgroundPresets';
import { 
  AGRICULTURAL_QUIZZES, 
  QUIZ_STREAK_REWARDS, 
  QuizQuestion, 
  QuizStreakReward 
} from '../config/quizzes';

export type ModalType = null | 'report' | 'upgrades' | 'neighbors' | 'contracts' | 'zones' | 'gmail' | 'academy' | 'eco_impact' | 'climate' | 'field_notes' | 'leaderboard' | 'guide' | 'background' | 'quiz' | 'database';

export interface HarvestLootEvent {
  id: string;
  tileIndex: number;
  cropTypeId: string;
  cropName: string;
  revenue: number;
  points: number;
  timestamp: number;
}

interface GameStore {
  farm: FarmState;
  activeClimateZone: string;
  selectedTileId: string | null;
  activeTool: ToolAction;
  language: Language;
  activeModal: ModalType;
  latestReport: SeasonReportRecord | null;
  notification: { text: string; type: 'success' | 'warning' | 'info'; id: number } | null;
  soundEnabled: boolean;
  backgroundSettings: BackgroundSettings;
  soilXRayMode: boolean;
  harvestLootEvents: HarvestLootEvent[];
  neighborReputation: Record<string, number>;

  // Actions
  tick: () => void;
  setGameSpeed: (speed: 1 | 2 | 5) => void;
  togglePause: () => void;
  setSelectedTileId: (id: string | null) => void;
  setActiveTool: (tool: ToolAction) => void;
  setLanguage: (lang: Language) => void;
  setClimateZone: (zoneKey: string) => void;
  applyCurrentTool: (tileId: string) => boolean;
  batchApplyTool: (tileIds: string[]) => void;
  advanceSeason: () => void;
  unlockUpgrade: (upgradeKey: keyof FarmState['unlockedUpgrades'], cost: number) => boolean;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  toggleSound: () => void;
  resetGame: () => void;
  loadScenario: (scenarioId: string) => boolean;
  showNotification: (text: string, type?: 'success' | 'warning' | 'info') => void;
  setFarmName: (name: string) => void;
  addEcoPoints: (amount: number, reason: string, icon?: string) => void;
  updateBackgroundSettings: (partial: Partial<BackgroundSettings>) => void;
  cycleNextBackground: () => void;
  toggleSoilXRayMode: () => void;
  clearLootEvent: (id: string) => void;
  unlockCropSeed: (cropId: string) => boolean;
  performHeirloomSeedSwap: (neighborId: string, heirloomCropId: string, costEcoPoints: number) => boolean;
  addFieldNote: (note: { 
    category: FieldNoteCategory; 
    title: string; 
    content: string; 
    tags?: string[]; 
    metricBadge?: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' } 
  }) => void;
  deleteFieldNote: (noteId: string) => void;
  submitQuizAnswer: (questionId: string, selectedIndex: number) => {
    isCorrect: boolean;
    reward: { ecoPoints: number; cash: number };
    newStreak: number;
    milestoneClaimed?: QuizStreakReward | null;
  };
  resetQuizProgress: () => void;
  claimStreakReward: (streak: number) => boolean;
  loadCloudFarmState: (farm: FarmState, climateZone?: string) => void;
}

const STORAGE_KEY = 'terrafarm_save_v1';

function loadSavedState(): FarmState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.tiles && parsed.tiles.length === 36) {
        if (!parsed.fieldNotes) {
          parsed.fieldNotes = [];
        }
        if (!parsed.unlockedMilestones) {
          parsed.unlockedMilestones = [];
        }
        if (parsed.ecoPoints === undefined) {
          parsed.ecoPoints = 120;
        }
        if (!parsed.unlockedBadges) {
          parsed.unlockedBadges = [];
        }
        if (!parsed.farmName) {
          parsed.farmName = 'TerraFarm Pioneer';
        }
        if (!parsed.pointsHistory) {
          parsed.pointsHistory = [];
        }
        if (!parsed.unlockedCrops || !Array.isArray(parsed.unlockedCrops)) {
          parsed.unlockedCrops = ['wheat', 'legume', 'corn', 'cover_crop', 'trap_crop', 'sunflower', 'millet'];
        }
        if (!parsed.quizStats) {
          parsed.quizStats = {
            answeredQuestions: {},
            currentStreak: 0,
            bestStreak: 0,
            totalEarnedEcoPoints: 0,
            totalEarnedCash: 0,
            claimedStreakMilestones: []
          };
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved state', e);
  }
  return createInitialFarmState('arid');
}

export const useGameStore = create<GameStore>((set, get) => ({
  farm: loadSavedState(),
  activeClimateZone: 'semi_arid',
  selectedTileId: null,
  activeTool: { type: 'inspect' },
  language: 'en',
  activeModal: null,
  latestReport: null,
  notification: null,
  soundEnabled: true,
  backgroundSettings: loadBackgroundSettings(),
  soilXRayMode: false,
  harvestLootEvents: [],
  neighborReputation: { suresh: 15, priya: 30, abena: 20, mateo: 25 },

  tick: () => {
    const { farm, activeClimateZone, advanceSeason } = get();
    if (farm.isPaused) return;

    if (farm.dayOfSeason >= 90) {
      advanceSeason();
      return;
    }

    const zone = CLIMATE_ZONES[activeClimateZone] || CLIMATE_ZONES.semi_arid;
    const nextFarm = tickDay(farm, zone);

    // Occasional ambient nature sounds
    if (Math.random() < 0.04 && nextFarm.history.length > 0) {
      const lastBio = nextFarm.history[nextFarm.history.length - 1]?.biodiversityIndex ?? 30;
      if (lastBio > 50) {
        sound.playBirdChirp();
      }
    }

    set({ farm: nextFarm });
    // Autosave occasionally
    if (nextFarm.dayOfSeason % 15 === 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFarm));
      } catch (e) {
        // quota ignore
      }
    }
  },

  setGameSpeed: (speed) => {
    set((state) => ({ farm: { ...state.farm, gameSpeed: speed } }));
  },

  togglePause: () => {
    set((state) => ({ farm: { ...state.farm, isPaused: !state.farm.isPaused } }));
  },

  setSelectedTileId: (id) => {
    set({ selectedTileId: id });
  },

  setActiveTool: (tool) => {
    set({ activeTool: tool });
  },

  setLanguage: (lang) => {
    set({ language: lang });
  },

  setClimateZone: (zoneKey) => {
    const newFarm = createInitialFarmState(zoneKey);
    set({ 
      activeClimateZone: zoneKey, 
      farm: newFarm,
      selectedTileId: null,
      latestReport: null,
      activeModal: null
    });
    localStorage.removeItem(STORAGE_KEY);
    get().showNotification(`Switched climate zone to ${CLIMATE_ZONES[zoneKey]?.name ?? zoneKey}`, 'info');
  },

  applyCurrentTool: (tileId: string) => {
    const { farm, activeTool, showNotification } = get();

    // Check if harvest to spawn loot effects
    if (activeTool.type === 'harvest') {
      const targetTile = farm.tiles.find(t => t.id === tileId);
      const targetIndex = farm.tiles.findIndex(t => t.id === tileId);
      if (targetTile?.crop) {
        const cropDef = CROPS[targetTile.crop.typeId];
        const isMature = targetTile.crop.growthStage === 3;
        const yieldMult = isMature ? 1.0 : (targetTile.crop.daysPlanted / (cropDef?.durationDays || 60));
        const expectedYield = Math.max(1, Math.round((targetTile.crop.expectedYield || 20) * yieldMult));
        const price = farm.hasOrganicCertification ? (cropDef?.organicPremiumPrice || 2) : (cropDef?.baseMarketPrice || 1.5);
        const revenue = Math.round(expectedYield * price);

        const newLoot: HarvestLootEvent = {
          id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          tileIndex: targetIndex,
          cropTypeId: targetTile.crop.typeId,
          cropName: cropDef?.name || 'Produce',
          revenue,
          points: 20,
          timestamp: Date.now()
        };
        sound.playLootPop();
        setTimeout(() => sound.playLootCoin(), 250);
        set((s) => ({ harvestLootEvents: [...s.harvestLootEvents, newLoot] }));
      }
    }

    const result = executeToolAction(farm, tileId, activeTool);

    if (result.success) {
      // Trigger sound
      if (activeTool.type === 'plant') sound.playPlant();
      else if (activeTool.type === 'irrigate') sound.playWater();
      else if (activeTool.type === 'fertilize') sound.playFertilize();
      else if (activeTool.type === 'harvest') sound.playHarvest();

      set({ farm: result.newState });
      if (activeTool.type !== 'inspect') {
        showNotification(result.message, 'success');
      }
      return true;
    } else {
      showNotification(result.message, 'warning');
      return false;
    }
  },

  batchApplyTool: (tileIds: string[]) => {
    const { farm, activeTool, showNotification } = get();
    let currentFarm = farm;
    let appliedCount = 0;
    const newLootList: HarvestLootEvent[] = [];

    for (const id of tileIds) {
      if (activeTool.type === 'harvest') {
        const targetTile = currentFarm.tiles.find(t => t.id === id);
        const targetIndex = currentFarm.tiles.findIndex(t => t.id === id);
        if (targetTile?.crop) {
          const cropDef = CROPS[targetTile.crop.typeId];
          const isMature = targetTile.crop.growthStage === 3;
          const yieldMult = isMature ? 1.0 : (targetTile.crop.daysPlanted / (cropDef?.durationDays || 60));
          const expectedYield = Math.max(1, Math.round((targetTile.crop.expectedYield || 20) * yieldMult));
          const price = currentFarm.hasOrganicCertification ? (cropDef?.organicPremiumPrice || 2) : (cropDef?.baseMarketPrice || 1.5);
          const revenue = Math.round(expectedYield * price);

          newLootList.push({
            id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            tileIndex: targetIndex,
            cropTypeId: targetTile.crop.typeId,
            cropName: cropDef?.name || 'Produce',
            revenue,
            points: 20,
            timestamp: Date.now()
          });
        }
      }

      const res = executeToolAction(currentFarm, id, activeTool);
      if (res.success) {
        currentFarm = res.newState;
        appliedCount++;
      }
    }

    if (appliedCount > 0) {
      if (activeTool.type === 'plant') sound.playPlant();
      else if (activeTool.type === 'irrigate') sound.playWater();
      else if (activeTool.type === 'fertilize') sound.playFertilize();
      else if (activeTool.type === 'harvest') {
        sound.playHarvest();
        sound.playLootPop();
        setTimeout(() => sound.playLootCoin(), 250);
      }

      if (newLootList.length > 0) {
        set((s) => ({
          farm: currentFarm,
          harvestLootEvents: [...s.harvestLootEvents, ...newLootList]
        }));
      } else {
        set({ farm: currentFarm });
      }

      showNotification(`Applied action to ${appliedCount} tile(s)`, 'success');
    }
  },

  toggleSoilXRayMode: () => {
    const current = get().soilXRayMode;
    if (!current) {
      sound.playSubterraneanHum();
    }
    set({ soilXRayMode: !current });
    get().showNotification(
      !current 
        ? '🔬 Soil X-Ray Active: Viewing underground roots, mycelial fungi & earthworms' 
        : '🌿 Switched to Field Surface View', 
      'info'
    );
  },

  clearLootEvent: (id: string) => {
    set((s) => ({ harvestLootEvents: s.harvestLootEvents.filter(e => e.id !== id) }));
  },

  unlockCropSeed: (cropId: string) => {
    const { farm, showNotification } = get();
    const currentCrops = farm.unlockedCrops || ['wheat', 'legume', 'corn', 'cover_crop', 'trap_crop', 'sunflower', 'millet'];
    if (currentCrops.includes(cropId)) return false;
    const nextCrops = [...currentCrops, cropId];
    set({ farm: { ...farm, unlockedCrops: nextCrops } });
    sound.playSeedSwap();
    showNotification(`Acquired heirloom seed: ${CROPS[cropId]?.name || cropId}! Available in seed palette.`, 'success');
    return true;
  },

  performHeirloomSeedSwap: (neighborId: string, heirloomCropId: string, costEcoPoints: number) => {
    const { farm, neighborReputation, showNotification } = get();
    if (farm.ecoPoints < costEcoPoints) {
      showNotification(`Need ${costEcoPoints} EcoPoints for this heirloom swap (You have ${farm.ecoPoints})`, 'warning');
      return false;
    }
    const currentCrops = farm.unlockedCrops || ['wheat', 'legume', 'corn', 'cover_crop', 'trap_crop', 'sunflower', 'millet'];
    if (currentCrops.includes(heirloomCropId)) {
      showNotification(`You already possess ${CROPS[heirloomCropId]?.name || heirloomCropId} seeds in your collection!`, 'info');
      return false;
    }

    const updatedFarm: FarmState = {
      ...farm,
      ecoPoints: farm.ecoPoints - costEcoPoints,
      unlockedCrops: [...currentCrops, heirloomCropId]
    };
    const updatedRep = {
      ...neighborReputation,
      [neighborId]: (neighborReputation[neighborId] || 0) + 20
    };

    set({ farm: updatedFarm, neighborReputation: updatedRep });
    sound.playSeedSwap();
    showNotification(`🤝 Seed swap successful! Unlocked ${CROPS[heirloomCropId]?.name} (+20 Neighbor Trust)`, 'success');
    return true;
  },

  advanceSeason: () => {
    const { farm, showNotification } = get();
    const { newState, report } = endSeasonTransition(farm);
    
    set({ 
      farm: newState, 
      latestReport: report, 
      activeModal: 'report',
      selectedTileId: null 
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      // ignore
    }

    showNotification(`Season ended! Reviewing Season ${farm.season} report card.`, 'info');
  },

  unlockUpgrade: (upgradeKey, cost) => {
    const { farm, showNotification } = get();
    if (farm.cashBalance < cost) {
      showNotification(`Need $${cost} to unlock upgrade. Cash is $${farm.cashBalance}`, 'warning');
      return false;
    }

    const newFarm: FarmState = {
      ...farm,
      cashBalance: farm.cashBalance - cost,
      seasonInputCosts: {
        ...farm.seasonInputCosts,
        upgrades: farm.seasonInputCosts.upgrades + cost
      },
      unlockedUpgrades: {
        ...farm.unlockedUpgrades,
        [upgradeKey]: true
      }
    };

    // Award EcoPoints for installing sustainable infrastructure
    const stateWithPoints = awardEcoPoints(newFarm, 120, `Installed Farm Infrastructure Upgrade`, '🛠️');
    const { newBadges, updatedFarm } = checkAndUnlockBadges(stateWithPoints);

    set({ farm: updatedFarm });
    sound.playHarvest();
    showNotification(`Unlocked upgrade! (+120 EcoPoints)`, 'success');
    return true;
  },

  setFarmName: (name: string) => {
    const trimmed = name.trim() || 'TerraFarm Pioneer';
    const updatedFarm = { ...get().farm, farmName: trimmed };
    set({ farm: updatedFarm });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFarm));
    } catch (e) {
      console.error(e);
    }
    get().showNotification(`Farm name updated to "${trimmed}"`, 'success');
  },

  addEcoPoints: (amount: number, reason: string, icon = '⭐') => {
    const { farm, showNotification } = get();
    const stateWithPoints = awardEcoPoints(farm, amount, reason, icon);
    const { newBadges, updatedFarm } = checkAndUnlockBadges(stateWithPoints);
    set({ farm: updatedFarm });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFarm));
    } catch (e) {
      console.error(e);
    }
    if (newBadges.length > 0) {
      newBadges.forEach(b => {
        showNotification(`🏆 Badge Unlocked: ${b.title}! (+${b.pointsReward} pts)`, 'success');
      });
    } else {
      showNotification(`+${amount} EcoPoints: ${reason}`, 'success');
    }
  },

  openModal: (modal) => {
    set({ activeModal: modal });
  },

  closeModal: () => {
    set({ activeModal: null });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    sound.isMuted = !next;
    set({ soundEnabled: next });
  },

  resetGame: () => {
    localStorage.removeItem(STORAGE_KEY);
    const newFarm = createInitialFarmState(get().activeClimateZone);
    set({
      farm: newFarm,
      selectedTileId: null,
      latestReport: null,
      activeModal: null,
      activeTool: { type: 'inspect' }
    });
    get().showNotification('Farm reset to Year 1 baseline.', 'info');
  },

  loadScenario: (scenarioId: string) => {
    const scenario = AGRO_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return false;

    const newFarm = scenario.applyState();
    set({
      farm: newFarm,
      activeClimateZone: scenario.climateZone,
      selectedTileId: null,
      latestReport: null,
      activeModal: null,
      activeTool: { type: 'inspect' }
    });
    sound.playLevelUp();
    get().showNotification(`Loaded Challenge: "${scenario.title}"`, 'success');
    return true;
  },

  showNotification: (text, type = 'info') => {
    const id = Date.now();
    set({ notification: { text, type, id } });
    setTimeout(() => {
      const current = get().notification;
      if (current && current.id === id) {
        set({ notification: null });
      }
    }, 3500);
  },

  addFieldNote: (note) => {
    const { farm } = get();
    const newEntry: FieldNoteEntry = {
      id: `user_note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      year: farm.year,
      season: farm.season,
      dayOfSeason: farm.dayOfSeason,
      category: note.category,
      title: note.title.trim() || 'Field Reflection',
      content: note.content.trim(),
      metricBadge: note.metricBadge,
      icon: note.category === 'soil_health' ? '🌱' : note.category === 'weather' ? '🌦️' : note.category === 'reflection' ? '📝' : '🌾',
      importance: 'normal',
      isUserReflection: true,
      tags: note.tags && note.tags.length > 0 ? note.tags : ['Reflection', `Year${farm.year}`]
    };

    const updatedNotes = [newEntry, ...(farm.fieldNotes || [])];
    const updatedFarmWithNotes = { ...farm, fieldNotes: updatedNotes };
    
    // Award reflection EcoPoints and check for chronicler badge
    const stateWithPoints = awardEcoPoints(updatedFarmWithNotes, 30, 'Recorded Agronomic Reflection', '📖');
    const { updatedFarm } = checkAndUnlockBadges(stateWithPoints);

    set({ farm: updatedFarm });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFarm));
    } catch (e) {
      console.error(e);
    }
    sound.playLevelUp();
    get().showNotification('Field reflection recorded in journal (+30 EcoPoints)', 'success');
  },

  deleteFieldNote: (noteId: string) => {
    const { farm } = get();
    const updatedNotes = (farm.fieldNotes || []).filter(n => n.id !== noteId);
    const updatedFarm = { ...farm, fieldNotes: updatedNotes };
    set({ farm: updatedFarm });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFarm));
    } catch (e) {
      console.error(e);
    }
    get().showNotification('Note removed from journal.', 'info');
  },

  updateBackgroundSettings: (partial) => {
    const current = get().backgroundSettings;
    const next = { ...current, ...partial };
    set({ backgroundSettings: next });
    saveBackgroundSettings(next);
  },

  cycleNextBackground: () => {
    const current = get().backgroundSettings;
    const presetIds = BACKGROUND_PRESETS.map(p => p.id);
    const currentIndex = presetIds.indexOf(current.selectedPresetId);
    const nextIndex = (currentIndex + 1) % presetIds.length;
    const nextPreset = BACKGROUND_PRESETS[nextIndex];
    const nextSettings = { 
      ...current, 
      enabled: true, 
      selectedPresetId: nextPreset.id 
    };
    set({ backgroundSettings: nextSettings });
    saveBackgroundSettings(nextSettings);
    get().showNotification(`Backdrop: ${nextPreset.name}`, 'info');
  },

  submitQuizAnswer: (questionId: string, selectedIndex: number) => {
    const { farm } = get();
    const question = AGRICULTURAL_QUIZZES.find(q => q.id === questionId);
    if (!question) {
      return { isCorrect: false, reward: { ecoPoints: 0, cash: 0 }, newStreak: 0 };
    }

    const isCorrect = selectedIndex === question.correctIndex;
    const currentStats = farm.quizStats || {
      answeredQuestions: {},
      currentStreak: 0,
      bestStreak: 0,
      totalEarnedEcoPoints: 0,
      totalEarnedCash: 0,
      claimedStreakMilestones: []
    };

    const alreadyAnswered = !!currentStats.answeredQuestions[questionId];
    // If answered correctly for the first time, award full rewards; if repeating, award practice bonus
    const ecoAward = isCorrect ? (alreadyAnswered ? Math.max(10, Math.round(question.reward.ecoPoints * 0.25)) : question.reward.ecoPoints) : 0;
    const cashAward = isCorrect ? (alreadyAnswered ? Math.max(25, Math.round(question.reward.cash * 0.25)) : question.reward.cash) : 0;

    const newStreak = isCorrect ? currentStats.currentStreak + 1 : 0;
    const newBestStreak = Math.max(currentStats.bestStreak, newStreak);

    // Check for streak milestone award
    let milestoneClaimed: QuizStreakReward | null = null;
    let streakBonusCash = 0;
    let streakBonusPoints = 0;

    if (isCorrect) {
      const reachedMilestone = QUIZ_STREAK_REWARDS.find(
        r => newStreak >= r.streak && !currentStats.claimedStreakMilestones.includes(r.streak)
      );
      if (reachedMilestone) {
        milestoneClaimed = reachedMilestone;
        streakBonusCash = reachedMilestone.cashBonus;
        streakBonusPoints = reachedMilestone.ecoPointsBonus;
      }
    }

    const updatedClaimed = milestoneClaimed 
      ? [...currentStats.claimedStreakMilestones, milestoneClaimed.streak]
      : currentStats.claimedStreakMilestones;

    const updatedQuizStats = {
      ...currentStats,
      answeredQuestions: {
        ...currentStats.answeredQuestions,
        [questionId]: {
          answeredIndex: selectedIndex,
          isCorrect,
          timestamp: Date.now()
        }
      },
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      totalEarnedEcoPoints: currentStats.totalEarnedEcoPoints + ecoAward + streakBonusPoints,
      totalEarnedCash: currentStats.totalEarnedCash + cashAward + streakBonusCash,
      claimedStreakMilestones: updatedClaimed
    };

    let updatedFarm: FarmState = {
      ...farm,
      cashBalance: farm.cashBalance + cashAward + streakBonusCash,
      seasonRevenue: farm.seasonRevenue + cashAward + streakBonusCash,
      quizStats: updatedQuizStats
    };

    if (ecoAward + streakBonusPoints > 0) {
      updatedFarm = awardEcoPoints(
        updatedFarm,
        ecoAward + streakBonusPoints,
        milestoneClaimed 
          ? `Quiz Streak Bonus: ${milestoneClaimed.title}` 
          : `Agro-Quiz: ${question.agronomicPrinciple}`,
        '🌾'
      );
      const checked = checkAndUnlockBadges(updatedFarm);
      updatedFarm = checked.updatedFarm;
    }

    set({ farm: updatedFarm });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFarm));
    } catch (e) {
      console.error(e);
    }

    if (isCorrect) {
      if (milestoneClaimed) {
        sound.playQuizStreak();
        get().showNotification(
          `🔥 ${milestoneClaimed.title}! +$${streakBonusCash} & +${streakBonusPoints} EcoPoints Streak Bonus!`,
          'success'
        );
      } else {
        sound.playQuizCorrect();
        get().showNotification(
          `Correct! +$${cashAward} research grant & +${ecoAward} EcoPoints (${question.agronomicPrinciple})`,
          'success'
        );
      }
    } else {
      sound.playQuizWrong();
      get().showNotification(
        `Incorrect. Review the scientific explanation to master this principle.`,
        'warning'
      );
    }

    return {
      isCorrect,
      reward: { ecoPoints: ecoAward + streakBonusPoints, cash: cashAward + streakBonusCash },
      newStreak,
      milestoneClaimed
    };
  },

  resetQuizProgress: () => {
    const { farm } = get();
    const freshStats = {
      answeredQuestions: {},
      currentStreak: 0,
      bestStreak: farm.quizStats?.bestStreak || 0,
      totalEarnedEcoPoints: farm.quizStats?.totalEarnedEcoPoints || 0,
      totalEarnedCash: farm.quizStats?.totalEarnedCash || 0,
      claimedStreakMilestones: []
    };
    const updatedFarm = { ...farm, quizStats: freshStats };
    set({ farm: updatedFarm });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFarm));
    } catch (e) {
      console.error(e);
    }
    get().showNotification('Quiz practice history reset.', 'info');
  },

  claimStreakReward: (streak: number) => {
    const { farm } = get();
    const currentStats = farm.quizStats;
    if (!currentStats) return false;
    const reward = QUIZ_STREAK_REWARDS.find(r => r.streak === streak);
    if (!reward || currentStats.claimedStreakMilestones.includes(streak)) return false;
    if (currentStats.bestStreak < streak) return false;

    const updatedClaimed = [...currentStats.claimedStreakMilestones, streak];
    let updatedFarm: FarmState = {
      ...farm,
      cashBalance: farm.cashBalance + reward.cashBonus,
      seasonRevenue: farm.seasonRevenue + reward.cashBonus,
      quizStats: {
        ...currentStats,
        claimedStreakMilestones: updatedClaimed,
        totalEarnedCash: currentStats.totalEarnedCash + reward.cashBonus,
        totalEarnedEcoPoints: currentStats.totalEarnedEcoPoints + reward.ecoPointsBonus
      }
    };
    updatedFarm = awardEcoPoints(updatedFarm, reward.ecoPointsBonus, `Claimed Quiz Reward: ${reward.title}`, '🏅');
    const checked = checkAndUnlockBadges(updatedFarm);
    updatedFarm = checked.updatedFarm;

    set({ farm: updatedFarm });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFarm));
    } catch (e) {
      console.error(e);
    }
    sound.playQuizStreak();
    get().showNotification(`Claimed ${reward.title}: +$${reward.cashBonus} & +${reward.ecoPointsBonus} EcoPoints!`, 'success');
    return true;
  },

  loadCloudFarmState: (farm: FarmState, climateZone?: string) => {
    set({
      farm,
      ...(climateZone ? { activeClimateZone: climateZone } : {})
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(farm));
    } catch (e) {
      console.error(e);
    }
    get().showNotification('Farm restored from Cloud Database!', 'success');
  }
}));
