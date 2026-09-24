export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type WeatherType = 
  | 'sunny' 
  | 'rain' 
  | 'drought' 
  | 'heatwave' 
  | 'unseasonal_rain' 
  | 'pest_swarm'
  | 'wind';

export type ResidueState = 'none' | 'stubble' | 'mulch' | 'burnt_ash';

export type IrrigationType = 'none' | 'flood' | 'drip';

export type CropCategory = 'cereal' | 'legume' | 'cover' | 'trap' | 'cash_crop';

export interface CropDefinition {
  id: string;
  name: string;
  category: CropCategory;
  optimalSeasons: Season[];
  seedCost: number;
  baseYieldPerTile: number; // kg
  baseMarketPrice: number; // $ per kg
  organicPremiumPrice: number; // $ per kg
  durationDays: number; // usually 60-75 days (season is 90 days)
  waterDemand: number; // 0-100 scale daily consumption
  nitrogenDemand: number; // per season (negative = consumes N)
  nitrogenFixation: number; // positive = fixes atmospheric N (for legumes)
  organicMatterContribution: number; // +SOM on harvest / residue
  pestVulnerability: number; // baseline pest attraction
  droughtTolerance: number; // 0-100 (higher means less damage in drought)
  description: string;
  benefits: string[];
  isHeirloom?: boolean;
  heirloomOrigin?: string;
  pollinatorBoost?: number;
  compactionRelief?: number;
  mycelialAffinity?: number;
}

export interface ActiveCrop {
  typeId: string;
  growthStage: 0 | 1 | 2 | 3; // 0: Seeded, 1: Sprout, 2: Vegetative, 3: Mature (Ready to Harvest)
  daysPlanted: number;
  health: number; // 0 - 100
  expectedYield: number; // calculated based on soil, water, pests, stress
  stressFactors: {
    drought: number;
    pest: number;
    nutrientDeficiency: number;
    compaction: number;
    salinity: number;
  };
}

export interface TileState {
  id: string;
  x: number;
  y: number;
  // Soil attributes (0-100)
  soilOrganicMatter: number; // 0-100 (SOM). 10 = degraded dust, 80+ = rich black humus
  nitrogen: number; // 0-100
  moisture: number; // 0-100 (cracks appear < 25)
  salinity: number; // 0-100 (rises with excessive synthetic fertilizer and flood irrigation)
  compaction: number; // 0-100 (hardpan, reduced by earthworms & deep roots, increased by heavy tillage/machinery)
  
  // Biology
  pestPressure: number; // 0-100
  beneficialInsects: number; // 0-100 (ladybugs, parasitic wasps, spiders, bees)
  earthwormPopulation: number; // 0-100 (thrives on high SOM, killed by burning and synthetic chemical shock)
  
  // Crop & management
  crop: ActiveCrop | null;
  consecutiveCrops: string[]; // history of last crops to detect monocropping
  residue: ResidueState;
  irrigation: IrrigationType;
  syntheticChemicalCountThisYear: number;
  
  // Visual indicators
  recentActionAnimation?: {
    type: string;
    timestamp: number;
  };
}

export interface WeatherEvent {
  type: WeatherType;
  durationDays: number;
  daysRemaining: number;
  description: string;
  severity: number; // 1-3
}

export interface FarmState {
  // Coordinates & Dimensions
  gridSize: number; // 6
  tiles: TileState[];
  
  // Time progression
  year: number;
  season: Season;
  dayOfSeason: number; // 1 to 90 (Season duration = ~180 sec at 1x speed, 2 sec per day)
  isPaused: boolean;
  gameSpeed: 1 | 2 | 5;
  
  // Macro Farm State
  groundwaterDepth: number; // meters below surface (starts at 14m. >25m is critical drought; <8m is lush)
  cashBalance: number; // currency
  debt: number;
  seasonInputCosts: {
    seeds: number;
    fertilizer: number;
    pesticide: number;
    waterPumping: number;
    labor: number;
    upgrades: number;
  };
  seasonRevenue: number;
  
  // Weather & Atmosphere
  currentWeather: WeatherType;
  activeWeatherEvent: WeatherEvent | null;
  rainfallToday: number; // mm
  temperatureToday: number; // Celsius
  
  // Regional Climate Scenario
  climateZoneId?: string; // 'arid' | 'temperate' | 'tropical' | 'semi_arid' | 'boreal'

  // Long term regenerative tracking
  consecutiveChemicalFreeSeasons: number; // Need 3+ for certified organic contract
  hasOrganicCertification: boolean;
  unlockedUpgrades: {
    dripSystemInstalled: boolean;
    agroforestryBorders: boolean; // trees on borders reducing wind/heat
    compostPit: boolean; // generates free high-grade compost each season
    livestockIntegration: boolean; // cow/goat manure cycle
    farmPond: boolean; // rainwater harvesting aquifer recharge
  };
  
  // Historical telemetry per season
  history: SeasonReportRecord[];

  // Persistent Field Notes Journal & Milestones
  fieldNotes: FieldNoteEntry[];
  unlockedMilestones: string[];
  unlockedCrops?: string[]; // IDs of unlocked crops (standard + heirloom)

  // Agricultural Quizzes & Gamified Rewards
  quizStats?: {
    answeredQuestions: Record<string, { answeredIndex: number; isCorrect: boolean; timestamp: number }>;
    currentStreak: number;
    bestStreak: number;
    totalEarnedEcoPoints: number;
    totalEarnedCash: number;
    claimedStreakMilestones: number[];
  };

  // Gamification: Points, Badges & Leaderboard
  farmName: string;
  ecoPoints: number;
  unlockedBadges: UnlockedBadgeRecord[];
  pointsHistory: PointEventRecord[];
}

export interface UnlockedBadgeRecord {
  badgeId: string;
  unlockedAt: number;
  season: Season;
  year: number;
  pointsEarned: number;
}

export interface PointEventRecord {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
  icon: string;
}

export type FieldNoteCategory = 
  | 'soil_health' 
  | 'weather' 
  | 'biodiversity' 
  | 'milestone' 
  | 'reflection' 
  | 'management';

export interface FieldNoteEntry {
  id: string;
  timestamp: number;
  year: number;
  season: Season;
  dayOfSeason: number;
  category: FieldNoteCategory;
  title: string;
  content: string;
  metricBadge?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
  };
  icon: string;
  importance: 'normal' | 'milestone' | 'alert';
  isUserReflection?: boolean;
  tags: string[];
}

export interface SeasonReportRecord {
  year: number;
  season: Season;
  revenue: number;
  expenses: number;
  netProfit: number;
  cashEnd: number;
  groundwaterDepth: number;
  avgSoilOrganicMatter: number;
  avgBeneficialInsects: number;
  avgPestPressure: number;
  cropYieldHarvestedKg: number;
  syntheticChemicalsUsed: number;
  soilHealthIndex: number; // 0-100 composite
  biodiversityIndex: number; // 0-100 composite
  waterIndex: number; // 0-100 composite
  shadowComparison: ShadowAlternativeOutcome;
}

export interface ShadowAlternativeOutcome {
  alternativeTitle: string;
  description: string;
  netProfitDiff: number; // e.g. +$180 or -$320
  soilOrganicMatterDiff: number; // e.g. +4.5%
  groundwaterDiff: number; // e.g. +1.2m
  pestPressureDiff: number; // e.g. -15%
  insight: string;
}

export type ToolCategory = 
  | 'inspect'
  | 'plant'
  | 'irrigate'
  | 'fertilize'
  | 'pest_control'
  | 'residue'
  | 'harvest'
  | 'special';

export type ToolAction = 
  | { type: 'inspect' }
  | { type: 'plant'; cropId: string }
  | { type: 'irrigate'; method: 'flood' | 'drip' }
  | { type: 'fertilize'; method: 'synthetic_npk' | 'organic_compost' }
  | { type: 'pest_control'; method: 'chemical_spray' | 'biocontrol' | 'trap_border' }
  | { type: 'residue'; method: 'mulch' | 'burn' | 'till' }
  | { type: 'harvest' };
