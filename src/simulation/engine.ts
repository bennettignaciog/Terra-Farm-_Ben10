import { 
  FarmState, 
  TileState, 
  Season, 
  WeatherType, 
  WeatherEvent, 
  SeasonReportRecord,
  ShadowAlternativeOutcome,
  ToolAction
} from './types';
import { CROPS } from '../config/crops';
import { CLIMATE_ZONES, AgroClimateZone } from '../config/climates';
import { checkMilestonesAndWeather, createSeasonTransitionJournalNote } from './fieldNotesManager';
import { awardEcoPoints, checkAndUnlockBadges } from './gamification';

export const GRID_SIZE = 6;
export const SEASON_DAYS = 90;

export function createInitialFarmState(zoneKey: string = 'arid'): FarmState {
  const zone = CLIMATE_ZONES[zoneKey] || CLIMATE_ZONES.arid;
  const tiles: TileState[] = [];
  const [minSom, maxSom] = zone.baselineSOMRange || [30, 36];
  const [minMoist, maxMoist] = zone.baselineMoistureRange || [38, 48];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      tiles.push({
        id: `tile_${x}_${y}`,
        x,
        y,
        // Start with authentic regional baseline soil conditions for this climate zone
        soilOrganicMatter: minSom + Math.floor(Math.random() * Math.max(1, maxSom - minSom + 1)),
        nitrogen: Math.round(minSom * 1.1 + Math.random() * 6),
        moisture: minMoist + Math.floor(Math.random() * Math.max(1, maxMoist - minMoist + 1)),
        salinity: zone.id === 'arid' ? 14 : 8,
        compaction: 25,
        pestPressure: zone.regionCategory === 'Tropical' ? 24 : 15,
        beneficialInsects: 25,
        earthwormPopulation: zone.id === 'arid' ? 14 : 22,
        crop: null,
        consecutiveCrops: [],
        residue: 'none',
        irrigation: 'none',
        syntheticChemicalCountThisYear: 0,
      });
    }
  }

  return {
    gridSize: GRID_SIZE,
    tiles,
    year: 1,
    season: 'Spring',
    dayOfSeason: 1,
    isPaused: false,
    gameSpeed: 1,
    groundwaterDepth: zone.baselineGroundwaterDepth,
    cashBalance: 3200,
    debt: 0,
    seasonInputCosts: {
      seeds: 0,
      fertilizer: 0,
      pesticide: 0,
      waterPumping: 0,
      labor: 0,
      upgrades: 0,
    },
    seasonRevenue: 0,
    currentWeather: 'sunny',
    activeWeatherEvent: null,
    rainfallToday: 0,
    temperatureToday: zone.seasons.Spring.avgTemp,
    climateZoneId: zone.id,
    consecutiveChemicalFreeSeasons: 0,
    hasOrganicCertification: false,
    unlockedUpgrades: {
      dripSystemInstalled: false,
      agroforestryBorders: false,
      compostPit: false,
      livestockIntegration: false,
      farmPond: false,
    },
    history: [],
    fieldNotes: [
      {
        id: `note_init_${Date.now()}`,
        timestamp: Date.now(),
        year: 1,
        season: 'Spring',
        dayOfSeason: 1,
        category: 'management',
        title: `Field Log Initiated: ${zone.name}`,
        content: `Acquired 36-sector agricultural land parcel under ${zone.name} climate (${zone.regionCategory}). Baseline soil organic matter is ~${Math.round((minSom + maxSom) / 2)}%, aquifer rests at ${zone.baselineGroundwaterDepth}m, and daily evaporation scales at ${zone.evaporationMultiplier.toFixed(2)}×. Key agronomic vulnerability: ${zone.climateChallenge}. Priority: establish soil armor and maintain living root exudates.`,
        metricBadge: {
          label: 'Baseline SOM',
          value: `${Math.round((minSom + maxSom) / 2)}%`,
          trend: 'neutral'
        },
        icon: '📋',
        importance: 'milestone',
        tags: ['Orientation', 'Hydrology', zone.regionCategory]
      }
    ],
    unlockedMilestones: [],
    unlockedCrops: ['wheat', 'legume', 'corn', 'cover_crop', 'trap_crop', 'sunflower', 'millet'],
    quizStats: {
      answeredQuestions: {},
      currentStreak: 0,
      bestStreak: 0,
      totalEarnedEcoPoints: 0,
      totalEarnedCash: 0,
      claimedStreakMilestones: []
    },
    farmName: 'TerraFarm Pioneer',
    ecoPoints: 120,
    unlockedBadges: [],
    pointsHistory: [
      {
        id: `pts_init_${Date.now()}`,
        amount: 120,
        reason: 'Eco-Transition Welcome Seed Grant',
        timestamp: Date.now(),
        icon: '🌱'
      }
    ]
  };
}

export function tickDay(farm: FarmState, zone: AgroClimateZone): FarmState {
  if (farm.isPaused) return farm;

  const nextDay = farm.dayOfSeason + 1;
  const isEndOfSeason = nextDay > SEASON_DAYS;

  // Clone state
  const state: FarmState = {
    ...farm,
    dayOfSeason: isEndOfSeason ? farm.dayOfSeason : nextDay,
    tiles: farm.tiles.map(t => ({ ...t, crop: t.crop ? { ...t.crop, stressFactors: { ...t.crop.stressFactors } } : null }))
  };

  // Weather calculation
  const seasonCfg = zone.seasons[state.season];
  let currentWeather: WeatherType = 'sunny';
  let rainfallToday = 0;
  let tempToday = seasonCfg.avgTemp + (Math.sin(nextDay / 10) * 4);

  // Weather Event Lifecycle
  if (state.activeWeatherEvent) {
    state.activeWeatherEvent = {
      ...state.activeWeatherEvent,
      daysRemaining: state.activeWeatherEvent.daysRemaining - 1
    };
    if (state.activeWeatherEvent.daysRemaining <= 0) {
      state.activeWeatherEvent = null;
    }
  }

  // Roll for new weather event if none active
  if (!state.activeWeatherEvent && Math.random() < 0.05) {
    const roll = Math.random();
    if (roll < seasonCfg.droughtRisk) {
      state.activeWeatherEvent = {
        type: 'drought',
        durationDays: 14,
        daysRemaining: 14,
        severity: 2,
        description: 'Severe heat & dry spell. Soil moisture evaporating rapidly!'
      };
    } else if (roll < seasonCfg.droughtRisk + seasonCfg.pestSwarmRisk) {
      state.activeWeatherEvent = {
        type: 'pest_swarm',
        durationDays: 10,
        daysRemaining: 10,
        severity: 2,
        description: 'Locust & caterpillar outbreak arriving from neighboring degraded land!'
      };
    } else if (roll < seasonCfg.droughtRisk + seasonCfg.pestSwarmRisk + seasonCfg.heatwaveRisk) {
      state.activeWeatherEvent = {
        type: 'heatwave',
        durationDays: 7,
        daysRemaining: 7,
        severity: 3,
        description: 'Blistering temperature spike! Crop transpiration at peak.'
      };
    } else if (roll < seasonCfg.droughtRisk + seasonCfg.pestSwarmRisk + seasonCfg.heatwaveRisk + seasonCfg.unseasonalRainRisk) {
      state.activeWeatherEvent = {
        type: 'unseasonal_rain',
        durationDays: 5,
        daysRemaining: 5,
        severity: 2,
        description: 'Sudden intense cloudburst! Risk of topsoil erosion on bare plots.'
      };
    } else {
      state.activeWeatherEvent = {
        type: 'wind',
        durationDays: 6,
        daysRemaining: 6,
        severity: 2,
        description: 'Dry gale-force winds! Topsoil moisture evaporates unless sheltered by agroforestry tree windbreaks.'
      };
    }
  }

  // Determine current weather
  if (state.activeWeatherEvent) {
    currentWeather = state.activeWeatherEvent.type;
    if (currentWeather === 'drought' || currentWeather === 'heatwave') {
      tempToday += 6;
      rainfallToday = 0;
    } else if (currentWeather === 'unseasonal_rain') {
      tempToday -= 4;
      rainfallToday = 35;
    } else if (currentWeather === 'wind') {
      tempToday += 2;
      rainfallToday = 0;
    }
  } else {
    // Normal day rain chance
    if (Math.random() < seasonCfg.rainChancePerDay) {
      currentWeather = 'rain';
      rainfallToday = 8 + Math.floor(Math.random() * 16);
      tempToday -= 3;
    } else if (Math.random() < 0.12) {
      currentWeather = 'wind';
    }
  }

  state.currentWeather = currentWeather;
  state.rainfallToday = rainfallToday;
  state.temperatureToday = Math.round(tempToday);

  // Groundwater natural recharge or draw
  let groundwaterDelta = 0;
  if (rainfallToday > 20) {
    // Healthy recharge, boosted if farm pond or agroforestry
    const pondBonus = state.unlockedUpgrades.farmPond ? 0.08 : 0.02;
    groundwaterDelta -= pondBonus; // negative means water table rises (shallower depth)
  }

  // Per-Tile agronomic tick
  state.tiles = state.tiles.map(tile => {
    let som = tile.soilOrganicMatter;
    let n = tile.nitrogen;
    let moist = tile.moisture;
    let salinity = tile.salinity;
    let comp = tile.compaction;
    let pests = tile.pestPressure;
    let beneficials = tile.beneficialInsects;
    let worms = tile.earthwormPopulation;
    let crop = tile.crop;

    // 1. Rain moisture absorption
    if (rainfallToday > 0) {
      // Sponge effect: high SOM soil absorbs significantly more water; low SOM loses it to runoff
      // Scaled by climate rain infiltration factor (e.g. crusted arid soils have higher surface runoff)
      const infiltrationMult = zone.rainInfiltrationFactor ?? 1.0;
      const spongeFactor = (0.5 + (som / 100) * 0.9) * infiltrationMult;
      const mulchBonus = tile.residue === 'mulch' ? 1.3 : 1.0;
      moist = Math.min(100, moist + (rainfallToday * spongeFactor * mulchBonus * 0.8));

      // Erosion penalty on bare/burnt degraded soil during intense rain
      if (rainfallToday > 25 && (tile.residue === 'none' || tile.residue === 'burnt_ash') && !crop) {
        if (som < 30) {
          som = Math.max(5, som - 0.2); // topsoil washed away
        }
      }
    }

    // 2. Moisture Evaporation (Dynamically scaled by Regional Climate Scenario!)
    // Arid: 1.90×, Semi-Arid: 1.45×, Tropical: 1.20×, Temperate: 1.00×, Boreal: 0.70×
    const climateEvapMult = zone.evaporationMultiplier ?? 1.0;
    let evapRate = (0.8 + (tempToday / 40)) * climateEvapMult;

    // Mulch and cover crops drastically reduce evaporation (teaches soil armor in dry climates)
    if (tile.residue === 'mulch') evapRate *= 0.38; // 62% reduction via mulch!
    if (crop && crop.typeId === 'cover_crop') evapRate *= 0.45;
    // Agroforestry shade reduction
    if (state.unlockedUpgrades.agroforestryBorders) evapRate *= 0.82;
    // High SOM acts like a sponge, retaining moisture longer
    evapRate *= (1.4 - (som / 100) * 0.6);

    moist = Math.max(0, moist - evapRate);

    // 3. Automated Drip / Irrigation upkeep
    if (tile.irrigation === 'drip' && moist < 45) {
      // Drip automatically feeds gentle water directly to root zone
      moist = Math.min(80, moist + 15);
      state.seasonInputCosts.waterPumping += 0.15;
      groundwaterDelta += 0.003; // minimal groundwater draw
    }

    // 4. Earthworm & Biological Cycle
    if (som > 35 && moist >= 30 && moist <= 80 && tile.residue !== 'burnt_ash') {
      // Biology thrives
      worms = Math.min(100, worms + 0.12);
      // Earthworms drill biotunnels, reducing compaction
      comp = Math.max(5, comp - 0.08);
      // Earthworm castings mineralize nitrogen
      n = Math.min(100, n + 0.04);
    } else if (moist < 15 || tile.residue === 'burnt_ash' || salinity > 40) {
      // Worms die off in arid or saline/ashy conditions
      worms = Math.max(0, worms - 0.25);
    }

    // 5. Pest & Beneficial dynamics
    const climatePestMult = zone.pestPressureMultiplier ?? 1.0;
    if (state.currentWeather === 'pest_swarm') {
      pests = Math.min(100, pests + (3.0 * climatePestMult));
    } else {
      // Natural baseline fluctuation
      pests = Math.max(5, pests + (0.1 * climatePestMult));
    }

    // Beneficial insect predation (natural biological control)
    if (beneficials > 20) {
      const predation = (beneficials / 100) * 0.8;
      pests = Math.max(5, pests - predation);
    }

    // Trap crops or agroforestry shelter beneficials
    if (crop && crop.typeId === 'trap_crop') {
      beneficials = Math.min(100, beneficials + 0.4);
      pests = Math.max(0, pests - 0.5); // absorbs pests
    }
    if (state.unlockedUpgrades.agroforestryBorders) {
      beneficials = Math.min(100, beneficials + 0.05);
    }

    // 6. Crop Growth Dynamics
    if (crop) {
      const cropDef = CROPS[crop.typeId];
      if (cropDef) {
        crop.daysPlanted += 1;

        // Daily water consumption (Dynamically scaled by Regional Climate Scenario!)
        // Arid: 1.45×, Semi-Arid: 1.25×, Tropical: 1.10×, Temperate: 1.00×, Boreal: 0.80×
        const climateWaterMult = zone.cropWaterDemandMultiplier ?? 1.0;
        const dailyWater = (cropDef.waterDemand / cropDef.durationDays) * 1.5 * climateWaterMult;
        moist = Math.max(0, moist - dailyWater);

        // Daily nitrogen consumption
        const dailyN = (cropDef.nitrogenDemand / cropDef.durationDays) * 1.2;
        if (dailyN > 0) {
          n = Math.max(0, n - dailyN);
        } else if (dailyN < 0) {
          // Cover crop or legume fixing N during growth
          n = Math.min(100, n + Math.abs(dailyN));
        }

        // Stress factor evaluations
        let dStress = 0;
        if (moist < 22) {
          dStress = (22 - moist) / 22 * (100 - cropDef.droughtTolerance) / 100;
        }

        let pStress = 0;
        if (pests > 35) {
          pStress = (pests - 35) / 65 * (cropDef.pestVulnerability / 50);
        }

        let nStress = 0;
        if (n < 20 && cropDef.nitrogenDemand > 0) {
          nStress = (20 - n) / 20 * 0.8;
        }

        let cStress = 0;
        if (comp > 55) {
          // Hardpan restricts root growth
          cStress = (comp - 55) / 45 * 0.7;
        }

        crop.stressFactors = {
          drought: Math.min(100, Math.round(dStress * 100)),
          pest: Math.min(100, Math.round(pStress * 100)),
          nutrientDeficiency: Math.min(100, Math.round(nStress * 100)),
          compaction: Math.min(100, Math.round(cStress * 100)),
          salinity: Math.min(100, Math.round((salinity / 100) * 50))
        };

        // Monocropping penalty check
        const consecutiveSameCrop = countConsecutive(tile.consecutiveCrops, crop.typeId);
        let monocropYieldPenalty = 1.0;
        if (consecutiveSameCrop >= 3) {
          monocropYieldPenalty = 0.55; // severe 45% drop!
          pests = Math.min(100, pests + 0.4); // pest spike from monoculture
        } else if (consecutiveSameCrop === 2) {
          monocropYieldPenalty = 0.82; // 18% drop
        }

        // Health adjustment
        const totalStressAvg = (dStress + pStress + nStress + cStress) / 4;
        crop.health = Math.max(10, Math.min(100, crop.health - (totalStressAvg * 0.8) + (n > 50 && moist > 40 ? 0.3 : 0)));

        // Growth stage
        const progress = crop.daysPlanted / cropDef.durationDays;
        if (progress >= 1.0) {
          crop.growthStage = 3; // Ready to harvest!
        } else if (progress >= 0.65) {
          crop.growthStage = 2; // Vegetative / blooming
        } else if (progress >= 0.25) {
          crop.growthStage = 1; // Sprout
        } else {
          crop.growthStage = 0; // Seeded
        }

        // Expected Yield calculation
        // High SOM boosts yield potential sustainably
        const somYieldMultiplier = 0.7 + (som / 100) * 0.6; // at SOM 30 = 0.88, at SOM 80 = 1.18
        const healthMultiplier = crop.health / 100;
        crop.expectedYield = Math.max(
          2, 
          Math.round(cropDef.baseYieldPerTile * somYieldMultiplier * healthMultiplier * monocropYieldPenalty)
        );
      }
    }

    return {
      ...tile,
      soilOrganicMatter: Number(som.toFixed(1)),
      nitrogen: Number(n.toFixed(1)),
      moisture: Number(moist.toFixed(1)),
      salinity: Number(salinity.toFixed(1)),
      compaction: Number(comp.toFixed(1)),
      pestPressure: Number(pests.toFixed(1)),
      beneficialInsects: Number(beneficials.toFixed(1)),
      earthwormPopulation: Number(worms.toFixed(1)),
      crop
    };
  });

  // Apply groundwater table changes
  state.groundwaterDepth = Math.max(5, Math.min(30, Number((state.groundwaterDepth + groundwaterDelta).toFixed(2))));

  // Automatically check and log significant soil health milestones & weather observations
  const { newNotes, updatedMilestones } = checkMilestonesAndWeather(
    state,
    zone,
    farm.activeWeatherEvent
  );

  state.unlockedMilestones = updatedMilestones;
  if (newNotes.length > 0) {
    state.fieldNotes = [...newNotes, ...(farm.fieldNotes || [])];
  } else {
    state.fieldNotes = farm.fieldNotes || [];
  }

  // Automatic achievement & badge checking
  const { updatedFarm } = checkAndUnlockBadges(state);
  return updatedFarm;
}

function countConsecutive(history: string[], cropId: string): number {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i] === cropId) count++;
    else break;
  }
  return count;
}

export function executeToolAction(farm: FarmState, tileId: string, action: ToolAction): { newState: FarmState; message: string; success: boolean } {
  const tileIndex = farm.tiles.findIndex(t => t.id === tileId);
  if (tileIndex === -1) return { newState: farm, message: 'Invalid tile', success: false };

  const tile = { ...farm.tiles[tileIndex] };
  const newState = { 
    ...farm, 
    tiles: [...farm.tiles],
    seasonInputCosts: { ...farm.seasonInputCosts }
  };

  switch (action.type) {
    case 'plant': {
      const cropDef = CROPS[action.cropId];
      if (!cropDef) return { newState: farm, message: 'Unknown crop', success: false };
      if (tile.crop) return { newState: farm, message: 'Tile already has an active crop', success: false };
      if (newState.cashBalance < cropDef.seedCost) {
        return { newState: farm, message: `Insufficient cash for ${cropDef.name} seeds ($${cropDef.seedCost})`, success: false };
      }

      newState.cashBalance -= cropDef.seedCost;
      newState.seasonInputCosts.seeds += cropDef.seedCost;

      tile.crop = {
        typeId: action.cropId,
        growthStage: 0,
        daysPlanted: 0,
        health: 100,
        expectedYield: cropDef.baseYieldPerTile,
        stressFactors: {
          drought: 0,
          pest: 0,
          nutrientDeficiency: 0,
          compaction: 0,
          salinity: 0
        }
      };
      tile.consecutiveCrops = [...tile.consecutiveCrops, action.cropId];
      tile.residue = 'none'; // planting clears or incorporates remaining residue

      newState.tiles[tileIndex] = tile;
      const pts = (cropDef.category === 'legume' || cropDef.category === 'cover') ? 20 : 10;
      const stateWithPoints = awardEcoPoints(newState, pts, `Planted ${cropDef.name} (${cropDef.category})`, '🌱');
      const { updatedFarm } = checkAndUnlockBadges(stateWithPoints);
      return { newState: updatedFarm, message: `Planted ${cropDef.name} (+${pts} EcoPoints)`, success: true };
    }

    case 'irrigate': {
      if (action.method === 'flood') {
        const cost = 2.0;
        if (newState.cashBalance < cost) return { newState: farm, message: 'Not enough cash for diesel pumping fee', success: false };
        newState.cashBalance -= cost;
        newState.seasonInputCosts.waterPumping += cost;

        // Flood irrigation: lots of water, leaches N, rises salinity, drops aquifer
        tile.moisture = Math.min(100, tile.moisture + 55);
        tile.nitrogen = Math.max(0, tile.nitrogen - 4); // leaching
        tile.salinity = Math.min(100, tile.salinity + 1.2);
        newState.groundwaterDepth = Math.min(30, Number((newState.groundwaterDepth + 0.06).toFixed(2))); // aquifer depleted!

        newState.tiles[tileIndex] = tile;
        return { newState, message: 'Flood irrigated tile (Heavy water consumption & leaching)', success: true };
      } else {
        // Drip irrigation
        const cost = 0.60;
        if (newState.cashBalance < cost) return { newState: farm, message: 'Not enough cash for drip pumping fee', success: false };
        newState.cashBalance -= cost;
        newState.seasonInputCosts.waterPumping += cost;

        tile.moisture = Math.min(100, tile.moisture + 35);
        tile.irrigation = 'drip';
        newState.groundwaterDepth = Math.min(30, Number((newState.groundwaterDepth + 0.015).toFixed(2))); // minimal aquifer impact

        newState.tiles[tileIndex] = tile;
        const stateWithPoints = awardEcoPoints(newState, 5, 'Drip Water Conservation', '💧');
        const { updatedFarm } = checkAndUnlockBadges(stateWithPoints);
        return { newState: updatedFarm, message: 'Drip irrigated root zone (Efficient & groundwater-safe) [+5 pts]', success: true };
      }
    }

    case 'fertilize': {
      if (action.method === 'synthetic_npk') {
        const cost = 12.0;
        if (newState.cashBalance < cost) return { newState: farm, message: 'Not enough cash for synthetic chemical fertilizer', success: false };
        newState.cashBalance -= cost;
        newState.seasonInputCosts.fertilizer += cost;

        // Immediate massive N boost, but burns SOM and raises salinity!
        tile.nitrogen = Math.min(100, tile.nitrogen + 45);
        tile.soilOrganicMatter = Math.max(5, tile.soilOrganicMatter - 1.2); // chemical oxidation of carbon
        tile.salinity = Math.min(100, tile.salinity + 2.5);
        tile.earthwormPopulation = Math.max(0, tile.earthwormPopulation - 8); // salt/ammonia burn
        tile.syntheticChemicalCountThisYear += 1;
        newState.consecutiveChemicalFreeSeasons = 0; // resets organic certification streak!

        if (tile.crop) {
          tile.crop.health = Math.min(100, tile.crop.health + 10);
        }

        newState.tiles[tileIndex] = tile;
        return { newState, message: 'Applied Synthetic NPK (+45 Nitrogen, but degrades SOM and kills earthworms)', success: true };
      } else {
        // Organic Compost / Farmyard Manure
        const cost = (newState.unlockedUpgrades.compostPit || newState.unlockedUpgrades.livestockIntegration) ? 1.0 : 6.0;
        if (newState.cashBalance < cost) return { newState: farm, message: 'Not enough cash for compost', success: false };
        newState.cashBalance -= cost;
        newState.seasonInputCosts.fertilizer += cost;

        // Slow release: modest immediate N, steady long-term SOM and microbial biology
        tile.nitrogen = Math.min(100, tile.nitrogen + 16);
        tile.soilOrganicMatter = Math.min(100, tile.soilOrganicMatter + 4.5);
        tile.compaction = Math.max(5, tile.compaction - 3.5); // humus loosens soil
        tile.earthwormPopulation = Math.min(100, tile.earthwormPopulation + 6); // feeds worms!
        tile.beneficialInsects = Math.min(100, tile.beneficialInsects + 4);

        newState.tiles[tileIndex] = tile;
        const stateWithPoints = awardEcoPoints(newState, 15, 'Applied Living Organic Compost', '🪱');
        const { updatedFarm } = checkAndUnlockBadges(stateWithPoints);
        return { newState: updatedFarm, message: 'Applied Organic Compost (+4.5 SOM, feeds biology and decompaction) [+15 pts]', success: true };
      }
    }

    case 'pest_control': {
      if (action.method === 'chemical_spray') {
        const cost = 16.0;
        if (newState.cashBalance < cost) return { newState: farm, message: 'Not enough cash for pesticide spray', success: false };
        newState.cashBalance -= cost;
        newState.seasonInputCosts.pesticide += cost;

        // Wipes out pests today (95%), BUT wipes out 92% of beneficial predators!
        tile.pestPressure = Math.max(2, tile.pestPressure * 0.05);
        tile.beneficialInsects = Math.max(1, tile.beneficialInsects * 0.08);
        tile.earthwormPopulation = Math.max(0, tile.earthwormPopulation - 12);
        tile.syntheticChemicalCountThisYear += 1;
        newState.consecutiveChemicalFreeSeasons = 0; // resets organic certification

        newState.tiles[tileIndex] = tile;
        return { newState, message: 'Chemical pesticide sprayed: Pests cleared, but beneficial insects & worms eliminated!', success: true };
      } else {
        // Biocontrol / Neem
        const cost = 7.0;
        if (newState.cashBalance < cost) return { newState: farm, message: 'Not enough cash for botanical biocontrol', success: false };
        newState.cashBalance -= cost;
        newState.seasonInputCosts.pesticide += cost;

        // Moderately controls pests, preserves beneficial insects
        tile.pestPressure = Math.max(8, tile.pestPressure * 0.45);
        tile.beneficialInsects = Math.min(100, tile.beneficialInsects + 12); // builds predator habitat

        newState.tiles[tileIndex] = tile;
        const stateWithPoints = awardEcoPoints(newState, 15, 'Botanical Biocontrol Protection', '🐝');
        const { updatedFarm } = checkAndUnlockBadges(stateWithPoints);
        return { newState: updatedFarm, message: 'Applied Botanical Biocontrol: Suppressed pests while protecting beneficial predators [+15 pts]', success: true };
      }
    }

    case 'residue': {
      if (tile.residue === 'none' && !tile.crop) {
        return { newState: farm, message: 'No residue present to manage', success: false };
      }

      if (action.method === 'burn') {
        // Fast & free, but destroys organic matter and kills surface biology
        tile.residue = 'burnt_ash';
        tile.soilOrganicMatter = Math.max(5, tile.soilOrganicMatter - 4.5);
        tile.earthwormPopulation = Math.max(0, tile.earthwormPopulation - 15);
        tile.beneficialInsects = Math.max(2, tile.beneficialInsects - 10);
        newState.tiles[tileIndex] = tile;
        return { newState, message: 'Burned crop residue: Destroyed organic matter (-4.5 SOM) and killed beneficial organisms', success: true };
      } else if (action.method === 'mulch') {
        const cost = 1.5;
        if (newState.cashBalance < cost) return { newState: farm, message: 'Not enough cash for mulching labor', success: false };
        newState.cashBalance -= cost;
        newState.seasonInputCosts.labor += cost;

        tile.residue = 'mulch';
        tile.soilOrganicMatter = Math.min(100, tile.soilOrganicMatter + 3.0);
        tile.moisture = Math.min(100, tile.moisture + 15); // retained moisture
        tile.earthwormPopulation = Math.min(100, tile.earthwormPopulation + 8);
        newState.tiles[tileIndex] = tile;
        const stateWithPoints = awardEcoPoints(newState, 15, 'Established Soil Armor Mulch', '🛡️');
        const { updatedFarm } = checkAndUnlockBadges(stateWithPoints);
        return { newState: updatedFarm, message: 'Mulched residue on surface: Shields soil, retains moisture, and feeds earthworms [+15 pts]', success: true };
      } else {
        // Till
        const cost = 3.0;
        if (newState.cashBalance < cost) return { newState: farm, message: 'Not enough cash for tillage fuel', success: false };
        newState.cashBalance -= cost;
        newState.seasonInputCosts.labor += cost;

        tile.residue = 'none';
        tile.soilOrganicMatter = Math.max(5, tile.soilOrganicMatter - 1.0); // aeration oxidation
        tile.compaction = Math.min(100, tile.compaction + 3.5); // subsoil hardpan
        tile.nitrogen = Math.min(100, tile.nitrogen + 5); // temporary mineralization flush
        newState.tiles[tileIndex] = tile;
        return { newState, message: 'Tilled residue under: Temporary mineral flush, but causes subsoil compaction and carbon loss', success: true };
      }
    }

    case 'harvest': {
      if (!tile.crop) return { newState: farm, message: 'No crop on this tile to harvest', success: false };
      const cropDef = CROPS[tile.crop.typeId];
      if (!cropDef) return { newState: farm, message: 'Unknown crop', success: false };

      const isMature = tile.crop.growthStage === 3;
      const maturityMultiplier = isMature ? 1.0 : (tile.crop.daysPlanted / cropDef.durationDays);
      const actualYield = Math.max(1, Math.round(tile.crop.expectedYield * maturityMultiplier));

      const pricePerKg = newState.hasOrganicCertification ? cropDef.organicPremiumPrice : cropDef.baseMarketPrice;
      const revenue = Math.round(actualYield * pricePerKg);

      newState.cashBalance += revenue;
      newState.seasonRevenue += revenue;

      // Agronomic aftermath of harvest
      if (cropDef.category === 'legume') {
        tile.nitrogen = Math.min(100, tile.nitrogen + cropDef.nitrogenFixation);
        tile.soilOrganicMatter = Math.min(100, tile.soilOrganicMatter + cropDef.organicMatterContribution);
      } else if (cropDef.category === 'cover') {
        // Cover crop plowed or crimped
        tile.soilOrganicMatter = Math.min(100, tile.soilOrganicMatter + cropDef.organicMatterContribution);
        tile.compaction = Math.max(5, tile.compaction - 8);
      } else {
        tile.soilOrganicMatter = Math.min(100, tile.soilOrganicMatter + cropDef.organicMatterContribution);
      }

      tile.residue = 'stubble';
      tile.crop = null;

      newState.tiles[tileIndex] = tile;
      const stateWithPoints = awardEcoPoints(newState, 20, `Harvested ${cropDef.name}`, '🌾');
      const { updatedFarm } = checkAndUnlockBadges(stateWithPoints);
      return { 
        newState: updatedFarm, 
        message: `Harvested ${cropDef.name}: Yield ${actualYield}kg (+ $${revenue}) [+20 pts]`, 
        success: true 
      };
    }

    case 'inspect':
    default:
      return { newState: farm, message: 'Inspected tile', success: true };
  }
}

export function endSeasonTransition(farm: FarmState): { newState: FarmState; report: SeasonReportRecord } {
  // Aggregate farm metrics
  const totalTiles = farm.tiles.length;
  const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / totalTiles;
  const avgBeneficials = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / totalTiles;
  const avgPests = farm.tiles.reduce((acc, t) => acc + t.pestPressure, 0) / totalTiles;
  const avgMoisture = farm.tiles.reduce((acc, t) => acc + t.moisture, 0) / totalTiles;
  const avgSalinity = farm.tiles.reduce((acc, t) => acc + t.salinity, 0) / totalTiles;
  const avgCompaction = farm.tiles.reduce((acc, t) => acc + t.compaction, 0) / totalTiles;

  const totalExpenses = 
    farm.seasonInputCosts.seeds + 
    farm.seasonInputCosts.fertilizer + 
    farm.seasonInputCosts.pesticide + 
    farm.seasonInputCosts.waterPumping + 
    farm.seasonInputCosts.labor + 
    farm.seasonInputCosts.upgrades;

  const netProfit = farm.seasonRevenue - totalExpenses;

  // Calculate composite indices (0-100)
  const soilHealthIndex = Math.min(100, Math.max(0, Math.round(
    (avgSOM * 0.45) + 
    ((100 - avgCompaction) * 0.25) + 
    ((100 - avgSalinity) * 0.15) + 
    (avgBeneficials * 0.15)
  )));

  const biodiversityIndex = Math.min(100, Math.max(0, Math.round(
    (avgBeneficials * 0.5) + 
    ((100 - avgPests) * 0.3) + 
    ((farm.tiles.reduce((acc, t) => acc + t.earthwormPopulation, 0) / totalTiles) * 0.2)
  )));

  const waterIndex = Math.min(100, Math.max(0, Math.round(
    ((30 - farm.groundwaterDepth) / 25 * 50) + 
    (avgMoisture * 0.5)
  )));

  // Chemical check for organic certification tracking
  const totalSyntheticUsed = farm.tiles.reduce((acc, t) => acc + t.syntheticChemicalCountThisYear, 0);
  let consecutiveChemFree = farm.consecutiveChemicalFreeSeasons;
  if (totalSyntheticUsed === 0) {
    consecutiveChemFree += 1;
  } else {
    consecutiveChemFree = 0;
  }
  const hasOrganicCertification = consecutiveChemFree >= 3;

  // Generate Shadow Counterfactual Simulation ("What if you had farmed differently?")
  const shadowComparison = generateShadowCounterfactual(farm, totalSyntheticUsed, avgSOM);

  const report: SeasonReportRecord = {
    year: farm.year,
    season: farm.season,
    revenue: farm.seasonRevenue,
    expenses: totalExpenses,
    netProfit,
    cashEnd: farm.cashBalance,
    groundwaterDepth: farm.groundwaterDepth,
    avgSoilOrganicMatter: Number(avgSOM.toFixed(1)),
    avgBeneficialInsects: Number(avgBeneficials.toFixed(1)),
    avgPestPressure: Number(avgPests.toFixed(1)),
    cropYieldHarvestedKg: Math.round(farm.seasonRevenue / 1.5),
    syntheticChemicalsUsed: totalSyntheticUsed,
    soilHealthIndex,
    biodiversityIndex,
    waterIndex,
    shadowComparison
  };

  // Next season advancement
  const seasonCycle: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
  const currentIndex = seasonCycle.indexOf(farm.season);
  const nextSeason = seasonCycle[(currentIndex + 1) % 4];
  const nextYear = nextSeason === 'Spring' ? farm.year + 1 : farm.year;

  // Reset tile seasonal counters
  const nextTiles = farm.tiles.map(t => ({
    ...t,
    syntheticChemicalCountThisYear: 0,
    // Natural inter-season decomposition of mulch and residue
    soilOrganicMatter: t.residue === 'mulch' 
      ? Math.min(100, Number((t.soilOrganicMatter + 1.8).toFixed(1))) 
      : t.soilOrganicMatter,
    residue: t.residue === 'burnt_ash' ? 'none' : t.residue
  }));

  // Generate end of season field notes entry
  const seasonNote = createSeasonTransitionJournalNote(report, farm);
  const nextFieldNotes = [seasonNote, ...(farm.fieldNotes || [])];

  const newState: FarmState = {
    ...farm,
    year: nextYear,
    season: nextSeason,
    dayOfSeason: 1,
    isPaused: true, // pause to let player review report card
    consecutiveChemicalFreeSeasons: consecutiveChemFree,
    hasOrganicCertification,
    seasonRevenue: 0,
    seasonInputCosts: {
      seeds: 0,
      fertilizer: 0,
      pesticide: 0,
      waterPumping: 0,
      labor: 0,
      upgrades: 0,
    },
    tiles: nextTiles,
    fieldNotes: nextFieldNotes,
    unlockedMilestones: farm.unlockedMilestones || [],
    history: [...farm.history, report],
    farmName: farm.farmName || 'TerraFarm Pioneer',
    ecoPoints: farm.ecoPoints || 0,
    unlockedBadges: farm.unlockedBadges || [],
    pointsHistory: farm.pointsHistory || []
  };

  // Calculate seasonal regenerative bonus EcoPoints
  let seasonalBonus = 0;
  const bonusReasons: string[] = [];

  if (totalSyntheticUsed === 0) {
    seasonalBonus += 150;
    bonusReasons.push('+150 Chem-Free Season');
  }

  if (soilHealthIndex >= 70) {
    seasonalBonus += 120;
    bonusReasons.push('+120 Living Soil Sponge');
  }

  if (biodiversityIndex >= 65) {
    seasonalBonus += 100;
    bonusReasons.push('+100 Biodiversity Sanctuary');
  }

  if (farm.groundwaterDepth <= 14) {
    seasonalBonus += 80;
    bonusReasons.push('+80 Aquifer Recharge');
  }

  if (seasonalBonus === 0) {
    seasonalBonus = 40;
    bonusReasons.push('+40 Seasonal Harvest Completion');
  }

  const stateWithBonus = awardEcoPoints(
    newState, 
    seasonalBonus, 
    `Season End: ${bonusReasons.join(' | ')}`, 
    '🏆'
  );

  const { updatedFarm } = checkAndUnlockBadges(stateWithBonus);

  return { newState: updatedFarm, report };
}

function generateShadowCounterfactual(farm: FarmState, syntheticCount: number, avgSOM: number): ShadowAlternativeOutcome {
  // Synthesize an actionable counterfactual based on player choices
  if (syntheticCount > 6) {
    return {
      alternativeTitle: 'Counterfactual: Organic Compost & Biocontrol Strategy',
      description: 'Had you substituted synthetic fertilizers and chemical sprays with on-farm compost and botanical biocontrol...',
      netProfitDiff: -120, // slightly less profit in year 1-2, but massive long-term gain
      soilOrganicMatterDiff: +5.2,
      groundwaterDiff: +0.8,
      pestPressureDiff: -18,
      insight: 'Synthetic chemicals gave a quick boost this season, but burned 5.2% organic matter and destroyed natural predators. In Year 3+, the organic plot sustains higher yields at zero chemical cost.'
    };
  } else if (farm.tiles.some(t => t.residue === 'burnt_ash')) {
    return {
      alternativeTitle: 'Counterfactual: Stubble Mulching Instead of Burning',
      description: 'Had you mulched crop residues rather than burning them to clear land...',
      netProfitDiff: +45,
      soilOrganicMatterDiff: +4.0,
      groundwaterDiff: +0.4,
      pestPressureDiff: -8,
      insight: 'Mulching would have insulated the soil surface, conserving 28mm of soil moisture and saving $65 in emergency irrigation pumping fees.'
    };
  } else if (farm.tiles.some(t => countConsecutive(t.consecutiveCrops, 'corn') >= 2)) {
    return {
      alternativeTitle: 'Counterfactual: Legume Crop Rotation (Chickpea/Soybean)',
      description: 'Had you rotated monocropped cereal plots with a nitrogen-fixing legume...',
      netProfitDiff: +180,
      soilOrganicMatterDiff: +3.5,
      groundwaterDiff: +0.2,
      pestPressureDiff: -25,
      insight: 'Legume root nodules fix 35 units of atmospheric nitrogen naturally, breaking pest cycles and eliminating the need for expensive top-dressing.'
    };
  } else {
    return {
      alternativeTitle: 'Counterfactual: Cover Cropping in Fallow Season',
      description: 'Had you planted a winter Rye-Vetch cover crop instead of leaving soil bare...',
      netProfitDiff: +90,
      soilOrganicMatterDiff: +6.5,
      groundwaterDiff: +0.9,
      pestPressureDiff: -12,
      insight: 'Cover crops prevent seasonal topsoil wind erosion, feed earthworm colonies continuously, and create a spongy porous soil structure.'
    };
  }
}
