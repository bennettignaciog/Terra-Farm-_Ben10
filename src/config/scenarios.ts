import { FarmState } from '../simulation/types';
import { createInitialFarmState } from '../simulation/engine';

export interface AgroScenario {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master Agronomist';
  climateZone: string;
  briefing: string;
  learningGoal: string;
  realWorldContext: string;
  sdgFocus: string[];
  targetCriteria: {
    somTarget: number;
    groundwaterMaxDepth: number;
    minEarthworms: number;
    targetCash: number;
  };
  applyState: () => FarmState;
}

export const AGRO_SCENARIOS: AgroScenario[] = [
  {
    id: 'dust_bowl',
    title: 'The Dust Bowl Recovery',
    subtitle: 'Reversing Soil Degradation & Hardpan Compaction',
    difficulty: 'Intermediate',
    climateZone: 'semi_arid',
    briefing: 'Decades of heavy tractor tilling and residue burning have stripped the topsoil. Soil Organic Matter has collapsed to 12%, hardpan compaction is 72%, and earthworms have vanished. Any rain simply runs off the baked surface crust.',
    learningGoal: 'Learn how multi-species cover crops (tillage radish & clover), surface mulching, and zero residue burning re-activate biological life, break compaction naturally, and rebuild organic matter.',
    realWorldContext: 'Mirrors the 1930s North American Dust Bowl and modern desertification across the African Sahel and degraded Mediterranean plains.',
    sdgFocus: ['SDG 2: Zero Hunger', 'SDG 13: Climate Action', 'SDG 15: Life on Land'],
    targetCriteria: {
      somTarget: 35,
      groundwaterMaxDepth: 18,
      minEarthworms: 15,
      targetCash: 1200
    },
    applyState: () => {
      const state = createInitialFarmState('semi_arid');
      state.year = 1;
      state.season = 'Spring';
      state.dayOfSeason = 1;
      state.cashBalance = 750;
      state.groundwaterDepth = 17.5;
      state.tiles = state.tiles.map(t => ({
        ...t,
        soilOrganicMatter: 11 + Math.floor(Math.random() * 4),
        nitrogen: 18,
        moisture: 22,
        compaction: 70 + Math.floor(Math.random() * 8),
        salinity: 28,
        pestPressure: 20,
        beneficialInsects: 6,
        earthwormPopulation: 0,
        residue: 'burnt_ash',
        irrigation: 'none'
      }));
      return state;
    }
  },
  {
    id: 'aquifer_rescue',
    title: 'The Aquifer Rescue',
    subtitle: 'Surviving Severe Groundwater Table Depletion',
    difficulty: 'Intermediate',
    climateZone: 'semi_arid',
    briefing: 'Unchecked flood irrigation and thirsty monocultures have drained the regional aquifer to 23.5 meters. At 25 meters, farm tube-wells will run completely dry, triggering total crop failure and bankruptcy.',
    learningGoal: 'Learn water-smart agronomy: transition from wasteful flood irrigation to high-efficiency micro-drip networks, build a rainwater harvesting farm pond, and sow drought-resilient legumes.',
    realWorldContext: 'Reflects the critical groundwater depletion occurring in northwest India (Punjab), the California Central Valley, and the Ogallala Aquifer in the US Great Plains.',
    sdgFocus: ['SDG 6: Clean Water', 'SDG 12: Responsible Consumption', 'SDG 13: Climate Action'],
    targetCriteria: {
      somTarget: 30,
      groundwaterMaxDepth: 16,
      minEarthworms: 10,
      targetCash: 1000
    },
    applyState: () => {
      const state = createInitialFarmState('semi_arid');
      state.year = 1;
      state.season = 'Summer';
      state.dayOfSeason = 1;
      state.cashBalance = 650;
      state.groundwaterDepth = 23.2; // Critical!
      state.tiles = state.tiles.map(t => ({
        ...t,
        soilOrganicMatter: 24,
        nitrogen: 30,
        moisture: 28,
        salinity: 32,
        compaction: 35,
        pestPressure: 22,
        beneficialInsects: 15,
        earthwormPopulation: 8,
        irrigation: 'flood', // Inefficient default
        residue: 'stubble'
      }));
      return state;
    }
  },
  {
    id: 'pesticide_treadmill',
    title: 'Breaking the Chemical Treadmill',
    subtitle: 'Overcoming Predator Collapse & Secondary Pest Surges',
    difficulty: 'Master Agronomist',
    climateZone: 'temperate',
    briefing: 'Repeated applications of broad-spectrum synthetic insecticides eradicated beneficial predators (ladybugs, predatory wasps, spiders). Resistant secondary pests exploded to 88% pressure, devastating crops despite heavy spending.',
    learningGoal: 'Experience Integrated Pest Management (IPM): halt broad-spectrum poisons, plant sunflower trap borders, release targeted biological controls, and install agroforestry tree windbreaks to provide predator habitats.',
    realWorldContext: 'Classic ecological "pesticide treadmill" documented by Rachel Carson in Silent Spring and continually experienced across cotton and monoculture fruit basins worldwide.',
    sdgFocus: ['SDG 12: Responsible Production', 'SDG 15: Life on Land', 'SDG 2: Zero Hunger'],
    targetCriteria: {
      somTarget: 32,
      groundwaterMaxDepth: 16,
      minEarthworms: 18,
      targetCash: 1100
    },
    applyState: () => {
      const state = createInitialFarmState('temperate');
      state.year = 1;
      state.season = 'Summer';
      state.dayOfSeason = 1;
      state.cashBalance = 550;
      state.groundwaterDepth = 14.0;
      state.tiles = state.tiles.map(t => ({
        ...t,
        soilOrganicMatter: 26,
        nitrogen: 40,
        moisture: 42,
        compaction: 30,
        salinity: 24,
        pestPressure: 86, // Outbreak!
        beneficialInsects: 2, // Collapsed ecology
        earthwormPopulation: 5,
        irrigation: 'none',
        residue: 'none',
        syntheticChemicalCountThisYear: 3
      }));
      return state;
    }
  },
  {
    id: 'organic_transition',
    title: 'The Organic Co-op Transition',
    subtitle: 'Navigating the 3-Season Chemical-Free Bridge',
    difficulty: 'Beginner',
    climateZone: 'temperate',
    briefing: 'Your cooperative offers a +50% price premium for Certified Organic grain, but requires 3 full consecutive seasons with zero synthetic fertilizers or chemical pesticides. Can you maintain profitability without chemical crutches?',
    learningGoal: 'Master crop rotation, legume nitrogen-fixation, and compost cycling to maintain crop yields and cashflow during the biological transition period.',
    realWorldContext: 'The standard regulatory transition required by USDA Organic, EU Organic Certification, and regenerative cooperatives globally.',
    sdgFocus: ['SDG 2: Zero Hunger', 'SDG 12: Circular Economy', 'SDG 15: Biodiversity'],
    targetCriteria: {
      somTarget: 38,
      groundwaterMaxDepth: 15,
      minEarthworms: 25,
      targetCash: 1500
    },
    applyState: () => {
      const state = createInitialFarmState('temperate');
      state.year = 1;
      state.season = 'Spring';
      state.dayOfSeason = 1;
      state.cashBalance = 800;
      state.groundwaterDepth = 13.5;
      state.consecutiveChemicalFreeSeasons = 0;
      state.hasOrganicCertification = false;
      return state;
    }
  }
];
