import { FarmState } from '../simulation/types';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type BadgeCategory = 'soil' | 'water' | 'biodiversity' | 'carbon' | 'mastery';

export interface AchievementBadge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  category: BadgeCategory;
  pointsReward: number;
  scienceInsight: string;
  checkProgress: (farm: FarmState) => {
    current: number;
    max: number;
    isUnlocked: boolean;
    progressPercent: number;
    displayValue: string;
  };
}

export interface AgronomistLevel {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  badge: string;
  description: string;
}

export const AGRONOMIST_LEVELS: AgronomistLevel[] = [
  {
    level: 1,
    title: 'Conventional Novice',
    minPoints: 0,
    maxPoints: 299,
    badge: '🌱',
    description: 'Starting the transition from industrial extraction to living soil stewardship.'
  },
  {
    level: 2,
    title: 'Soil Apprentice',
    minPoints: 300,
    maxPoints: 799,
    badge: '🌿',
    description: 'Mastering cover cropping, organic composting, and active soil armor.'
  },
  {
    level: 3,
    title: 'Permaculture Practitioner',
    minPoints: 800,
    maxPoints: 1599,
    badge: '🌾',
    description: 'Nurturing mycorrhizal fungi, beneficial insect predator belts, and polycultures.'
  },
  {
    level: 4,
    title: 'Biodiversity Steward',
    minPoints: 1600,
    maxPoints: 2999,
    badge: '🐝',
    description: 'Achieving resilient trophic balance and biological pest suppression.'
  },
  {
    level: 5,
    title: 'Agroforestry Pioneer',
    minPoints: 3000,
    maxPoints: 4999,
    badge: '🌳',
    description: 'Integrating deep perennial tree roots, windbreaks, and hydrological sponge retention.'
  },
  {
    level: 6,
    title: 'Watershed Guardian',
    minPoints: 5000,
    maxPoints: 7999,
    badge: '💧',
    description: 'Recharging regional aquifers and operating collaborative watershed management.'
  },
  {
    level: 7,
    title: 'Living Earth Master',
    minPoints: 8000,
    maxPoints: 999999,
    badge: '🌍',
    description: 'A carbon-negative, ecologically abundant closed-loop agricultural ecosystem.'
  }
];

export function getLevelForPoints(points: number): AgronomistLevel {
  for (let i = AGRONOMIST_LEVELS.length - 1; i >= 0; i--) {
    if (points >= AGRONOMIST_LEVELS[i].minPoints) {
      return AGRONOMIST_LEVELS[i];
    }
  }
  return AGRONOMIST_LEVELS[0];
}

export const ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'first_living_root',
    title: 'First Living Root',
    subtitle: 'Foundation of Soil Biology',
    description: 'Plant your first regenerative or cover crop in the ground.',
    icon: '🌱',
    tier: 'bronze',
    category: 'soil',
    pointsReward: 50,
    scienceInsight: 'Living roots feed liquid carbon (photosynthate exudates) directly to rhizosphere bacteria and mycorrhizal fungi.',
    checkProgress: (farm) => {
      const planted = farm.tiles.filter(t => t.crop !== null).length;
      return {
        current: Math.min(1, planted),
        max: 1,
        isUnlocked: planted >= 1,
        progressPercent: planted >= 1 ? 100 : 0,
        displayValue: `${planted >= 1 ? '1/1' : '0/1'} crops`
      };
    }
  },
  {
    id: 'soil_armor_guardian',
    title: 'Soil Armor Guardian',
    subtitle: 'Never Leave Soil Naked',
    description: 'Cover 18 or more sectors with protective organic mulch or living residues.',
    icon: '🛡️',
    tier: 'silver',
    category: 'soil',
    pointsReward: 150,
    scienceInsight: 'Mulch reduces soil surface temperature by up to 15°C, prevents moisture evaporation, and protects soil microbes from UV sterilization.',
    checkProgress: (farm) => {
      const mulchedCount = farm.tiles.filter(t => t.residue === 'mulch' || (t.crop && t.crop.growthStage >= 2)).length;
      const target = 18;
      const percent = Math.min(100, Math.round((mulchedCount / target) * 100));
      return {
        current: mulchedCount,
        max: target,
        isUnlocked: mulchedCount >= target,
        progressPercent: percent,
        displayValue: `${mulchedCount}/${target} tiles`
      };
    }
  },
  {
    id: 'earthworm_haven',
    title: 'Earthworm Haven',
    subtitle: 'Nature’s Living Tillage',
    description: 'Achieve an average earthworm population score above 55 across all sectors.',
    icon: '🪱',
    tier: 'gold',
    category: 'soil',
    pointsReward: 250,
    scienceInsight: 'Earthworm casts contain 5x more available nitrogen, 7x more phosphorus, and 11x more potassium than the surrounding topsoil.',
    checkProgress: (farm) => {
      const avgWorms = Math.round(farm.tiles.reduce((acc, t) => acc + t.earthwormPopulation, 0) / farm.tiles.length);
      const target = 55;
      const percent = Math.min(100, Math.round((avgWorms / target) * 100));
      return {
        current: avgWorms,
        max: target,
        isUnlocked: avgWorms >= target,
        progressPercent: percent,
        displayValue: `${avgWorms}/${target} avg worms`
      };
    }
  },
  {
    id: 'aquifer_recharger',
    title: 'Aquifer Recharger',
    subtitle: 'Hydrological Sponge Effect',
    description: 'Raise the groundwater table by 2m or achieve a Farm Water Index of 70+.',
    icon: '💧',
    tier: 'silver',
    category: 'water',
    pointsReward: 200,
    scienceInsight: 'Every 1% increase in Soil Organic Matter allows soil to hold approximately 27,000 gallons of additional freshwater per acre.',
    checkProgress: (farm) => {
      const avgMoisture = farm.tiles.reduce((acc, t) => acc + t.moisture, 0) / farm.tiles.length;
      const currentWaterIndex = Math.min(100, Math.max(0, Math.round(
        ((30 - farm.groundwaterDepth) / 25 * 50) + (avgMoisture * 0.5)
      )));
      const target = 70;
      const percent = Math.min(100, Math.round((currentWaterIndex / target) * 100));
      return {
        current: currentWaterIndex,
        max: target,
        isUnlocked: currentWaterIndex >= target,
        progressPercent: percent,
        displayValue: `${currentWaterIndex}/${target} Water Index`
      };
    }
  },
  {
    id: 'carbon_vault',
    title: 'Carbon Vault Pioneer',
    subtitle: 'Climate Solutions from Soil',
    description: 'Sequester 5.0 or more metric tons of CO₂ equivalent in the soil profile.',
    icon: '🪵',
    tier: 'gold',
    category: 'carbon',
    pointsReward: 300,
    scienceInsight: 'Humified soil organic carbon has a mean residence time of centuries, safely locking atmospheric greenhouse gases underground.',
    checkProgress: (farm) => {
      const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / farm.tiles.length;
      const totalCarbonSequesteredTons = Math.max(0, parseFloat(((avgSOM - 28) * 0.18 * 3.67).toFixed(1)));
      const target = 5.0;
      const percent = Math.min(100, Math.round((totalCarbonSequesteredTons / target) * 100));
      return {
        current: totalCarbonSequesteredTons,
        max: target,
        isUnlocked: totalCarbonSequesteredTons >= target,
        progressPercent: percent,
        displayValue: `${totalCarbonSequesteredTons}/${target}t CO₂`
      };
    }
  },
  {
    id: 'organic_vanguard',
    title: 'Certified Organic Vanguard',
    subtitle: 'Complete Chemical Independence',
    description: 'Sustain 3 consecutive seasons with zero synthetic chemical inputs and gain Organic Certification.',
    icon: '📜',
    tier: 'platinum',
    category: 'mastery',
    pointsReward: 450,
    scienceInsight: 'Eliminating synthetic pesticides and mineral fertilizers restores the soil microbiome, yielding a 50% price premium in fair trade markets.',
    checkProgress: (farm) => {
      const seasons = farm.consecutiveChemicalFreeSeasons;
      const target = 3;
      const percent = Math.min(100, Math.round((seasons / target) * 100));
      return {
        current: seasons,
        max: target,
        isUnlocked: farm.hasOrganicCertification || seasons >= target,
        progressPercent: percent,
        displayValue: `${seasons}/${target} seasons`
      };
    }
  },
  {
    id: 'polyculture_maestro',
    title: 'Polyculture Maestro',
    subtitle: 'Ecological Stacking',
    description: 'Grow 4 or more distinct crop species across the farm at the same time.',
    icon: '🌽',
    tier: 'silver',
    category: 'biodiversity',
    pointsReward: 200,
    scienceInsight: 'Multi-species plantings mimic natural ecosystems, interrupting pest lifecycles and utilizing different soil nutrient root depths.',
    checkProgress: (farm) => {
      const activeCropTypes = new Set(
        farm.tiles.filter(t => t.crop !== null).map(t => t.crop!.typeId)
      ).size;
      const target = 4;
      const percent = Math.min(100, Math.round((activeCropTypes / target) * 100));
      return {
        current: activeCropTypes,
        max: target,
        isUnlocked: activeCropTypes >= target,
        progressPercent: percent,
        displayValue: `${activeCropTypes}/${target} crop species`
      };
    }
  },
  {
    id: 'beneficial_army',
    title: 'Biological Defense Network',
    subtitle: 'Natural Predator Balance',
    description: 'Raise beneficial insect populations above 65 across all sectors without insecticides.',
    icon: '🐝',
    tier: 'silver',
    category: 'biodiversity',
    pointsReward: 220,
    scienceInsight: 'Hoverflies, ladybugs, and parasitic wasps keep aphids and pests under economic thresholds without harming soil mycorrhizae.',
    checkProgress: (farm) => {
      const avgBeneficials = Math.round(farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / farm.tiles.length);
      const target = 65;
      const percent = Math.min(100, Math.round((avgBeneficials / target) * 100));
      return {
        current: avgBeneficials,
        max: target,
        isUnlocked: avgBeneficials >= target,
        progressPercent: percent,
        displayValue: `${avgBeneficials}/${target} beneficial index`
      };
    }
  },
  {
    id: 'agroforestry_vision',
    title: 'Agroforestry Pioneer',
    subtitle: 'Perennial Canopy Architecture',
    description: 'Install Agroforestry Borders and shelterbelts to shield soil from wind and extreme heat.',
    icon: '🌳',
    tier: 'gold',
    category: 'soil',
    pointsReward: 250,
    scienceInsight: 'Hedgerows and agroforestry borders cut wind erosion by 80%, shade microclimates, and pump deep minerals back into surface leaf litter.',
    checkProgress: (farm) => {
      const installed = farm.unlockedUpgrades.agroforestryBorders ? 1 : 0;
      return {
        current: installed,
        max: 1,
        isUnlocked: farm.unlockedUpgrades.agroforestryBorders,
        progressPercent: installed * 100,
        displayValue: farm.unlockedUpgrades.agroforestryBorders ? 'Installed' : 'Locked'
      };
    }
  },
  {
    id: 'drip_efficiency',
    title: 'Precision Micro-Irrigation',
    subtitle: 'Zero Waste Water Delivery',
    description: 'Equip drip irrigation infrastructure to slash water consumption by 50%.',
    icon: '💧',
    tier: 'silver',
    category: 'water',
    pointsReward: 180,
    scienceInsight: 'Drip systems deliver moisture straight to the rhizosphere, preventing evaporative water loss and surface salinization crusting.',
    checkProgress: (farm) => {
      const installed = farm.unlockedUpgrades.dripSystemInstalled ? 1 : 0;
      return {
        current: installed,
        max: 1,
        isUnlocked: farm.unlockedUpgrades.dripSystemInstalled,
        progressPercent: installed * 100,
        displayValue: farm.unlockedUpgrades.dripSystemInstalled ? 'Installed' : 'Locked'
      };
    }
  },
  {
    id: 'field_chronicler',
    title: 'Master Field Chronicler',
    subtitle: 'Reflective Agronomic Journal',
    description: 'Log 5 or more field notes and observations in the farm journal.',
    icon: '📖',
    tier: 'bronze',
    category: 'mastery',
    pointsReward: 120,
    scienceInsight: 'Systematic observation of phenology and soil moisture trends is the most effective tool in regenerative adaptive management.',
    checkProgress: (farm) => {
      const notesCount = (farm.fieldNotes || []).length;
      const target = 5;
      const percent = Math.min(100, Math.round((notesCount / target) * 100));
      return {
        current: notesCount,
        max: target,
        isUnlocked: notesCount >= target,
        progressPercent: percent,
        displayValue: `${notesCount}/${target} notes`
      };
    }
  },
  {
    id: 'sdg_luminary',
    title: 'UN SDG Luminary',
    subtitle: 'Global Sustainable Goals',
    description: 'Achieve an overall Grade "A" on the UN Sustainable Development Goals scorecard.',
    icon: '🏆',
    tier: 'platinum',
    category: 'mastery',
    pointsReward: 400,
    scienceInsight: 'Regenerative agriculture directly advances 7 UN Sustainable Development Goals, from Zero Hunger to Climate Action and Life on Land.',
    checkProgress: (farm) => {
      const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / farm.tiles.length;
      const avgBeneficials = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / farm.tiles.length;
      const avgPests = farm.tiles.reduce((acc, t) => acc + t.pestPressure, 0) / farm.tiles.length;
      const currentSoilHealth = Math.min(100, Math.max(0, Math.round(
        (avgSOM * 0.45) + ((100 - 25) * 0.25) + ((100 - 10) * 0.15) + (avgBeneficials * 0.15)
      )));
      const target = 75; // Approx for 'A' grade
      const percent = Math.min(100, Math.round((currentSoilHealth / target) * 100));
      return {
        current: currentSoilHealth,
        max: target,
        isUnlocked: currentSoilHealth >= target && farm.consecutiveChemicalFreeSeasons >= 1,
        progressPercent: percent,
        displayValue: `${currentSoilHealth}% Soil Score`
      };
    }
  },
  {
    id: 'regenerative_wealth',
    title: 'Regenerative Harvest Wealth',
    subtitle: 'Ecology Meets Economics',
    description: 'Reach a cash reserve of $8,000+ while sustaining average soil organic matter above 35%.',
    icon: '💰',
    tier: 'platinum',
    category: 'mastery',
    pointsReward: 500,
    scienceInsight: 'Regenerative farms consistently demonstrate higher net farm income than conventional monocultures due to 60-80% lower synthetic input costs.',
    checkProgress: (farm) => {
      const cash = farm.cashBalance;
      const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / farm.tiles.length;
      const target = 8000;
      const percent = Math.min(100, Math.round((cash / target) * 100));
      return {
        current: cash,
        max: target,
        isUnlocked: cash >= target && avgSOM >= 35,
        progressPercent: percent,
        displayValue: `$${cash.toLocaleString()} cash`
      };
    }
  }
];

// Watershed League Simulated Farms (dynamic competition & peer network)
export interface WatershedFarmEntry {
  id: string;
  name: string;
  manager: string;
  avatar: string;
  region: string;
  isPlayer: boolean;
  baseEcoPoints: number;
  baseCarbonTons: number;
  baseSOM: number;
  baseSdgScore: number;
  badgesCount: number;
  specialty: string;
  rankDelta?: number; // e.g. +1, -1, 0
}

export const BASE_WATERSHED_LEAGUE: WatershedFarmEntry[] = [
  {
    id: 'highland_permaculture',
    name: 'Highland Permaculture Institute',
    manager: 'Dr. Elena Rostova',
    avatar: '👩‍🌾',
    region: 'Valley Rim Uplands',
    isPlayer: false,
    baseEcoPoints: 4850,
    baseCarbonTons: 14.8,
    baseSOM: 54,
    baseSdgScore: 94,
    badgesCount: 11,
    specialty: 'Keyline Hydrology & Ancient Grains'
  },
  {
    id: 'green_haven_bio',
    name: 'Green Haven Bio-Farm',
    manager: 'Mateo & Sofia Rossi',
    avatar: '👨‍🌾',
    region: 'Central Alluvial Plain',
    isPlayer: false,
    baseEcoPoints: 3420,
    baseCarbonTons: 9.6,
    baseSOM: 46,
    baseSdgScore: 88,
    badgesCount: 9,
    specialty: 'Agroforestry & Heirloom Legumes'
  },
  {
    id: 'riverbend_regenerative',
    name: 'Riverbend Earth Sanctuary',
    manager: 'Kavita Patel',
    avatar: '🧕',
    region: 'Lower Riparian Basin',
    isPlayer: false,
    baseEcoPoints: 2650,
    baseCarbonTons: 7.2,
    baseSOM: 42,
    baseSdgScore: 82,
    badgesCount: 7,
    specialty: 'Riparian Buffers & Wetland Sponge'
  },
  {
    id: 'sunburst_agro',
    name: 'Sunburst Ecological Acreage',
    manager: 'Lucas Vance',
    avatar: '🧑‍🌾',
    region: 'Eastern Terrace',
    isPlayer: false,
    baseEcoPoints: 1980,
    baseCarbonTons: 5.4,
    baseSOM: 38,
    baseSdgScore: 78,
    badgesCount: 6,
    specialty: 'Solar Pumping & Drip Mulching'
  },
  {
    id: 'arroyo_verde_coop',
    name: 'Arroyo Verde Farmers Collective',
    manager: 'Sisterhood of Seed Savers',
    avatar: '👩‍🌾',
    region: 'Southern Foothills',
    isPlayer: false,
    baseEcoPoints: 1450,
    baseCarbonTons: 3.8,
    baseSOM: 35,
    baseSdgScore: 73,
    badgesCount: 5,
    specialty: 'Biochar Compost & Seed Sovereignty'
  },
  {
    id: 'prairie_wind_ranch',
    name: 'Prairie Wind Mixed Acre',
    manager: 'Cole Albright',
    avatar: '🤠',
    region: 'Western Steppe',
    isPlayer: false,
    baseEcoPoints: 1100,
    baseCarbonTons: 2.9,
    baseSOM: 32,
    baseSdgScore: 68,
    badgesCount: 4,
    specialty: 'Rotational Grazing & Sorghum'
  },
  {
    id: 'solstice_community',
    name: 'Solstice Community Micro-Farm',
    manager: 'Amina & Tariq',
    avatar: '🧑‍🌾',
    region: 'North Watershed Boundary',
    isPlayer: false,
    baseEcoPoints: 850,
    baseCarbonTons: 2.1,
    baseSOM: 30,
    baseSdgScore: 64,
    badgesCount: 3,
    specialty: 'Pollinator Corridors & Herbs'
  },
  {
    id: 'horizon_conventional',
    name: 'Horizon Farm (In Transition)',
    manager: 'Frank Miller',
    avatar: '👨‍🌾',
    region: 'Midland Flats',
    isPlayer: false,
    baseEcoPoints: 520,
    baseCarbonTons: 1.2,
    baseSOM: 27,
    baseSdgScore: 54,
    badgesCount: 2,
    specialty: 'Phasing Out Synthetic NPK'
  },
  {
    id: 'valley_flatlands_ag',
    name: 'Valley Flatlands Commercial',
    manager: 'Industrial AgriCorp',
    avatar: '🚜',
    region: 'Canal District',
    isPlayer: false,
    baseEcoPoints: 210,
    baseCarbonTons: 0.3,
    baseSOM: 22,
    baseSdgScore: 38,
    badgesCount: 1,
    specialty: 'Heavy Tillage Monocropping'
  }
];
