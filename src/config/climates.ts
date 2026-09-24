import { Season } from '../simulation/types';

export type ClimateCategory = 'Arid' | 'Temperate' | 'Tropical' | 'Mediterranean' | 'Boreal';

export interface AgroClimateZone {
  id: string;
  name: string;
  regionCategory: ClimateCategory;
  subtitle: string;
  description: string;
  badgeColor: string;
  icon: string;
  
  // Dynamic biophysical scaling factors
  evaporationMultiplier: number; // Scale factor for daily soil moisture evaporation (e.g. 1.90 = +90%)
  cropWaterDemandMultiplier: number; // Scale factor for crop daily water draw (e.g. 1.45 = +45%)
  rainInfiltrationFactor: number; // Infiltration vs surface runoff factor
  pestPressureMultiplier: number; // Pest multiplication baseline
  baselineGroundwaterDepth: number; // Meters below surface
  baselineSOMRange: [number, number]; // [min, max] starting Soil Organic Matter %
  baselineMoistureRange: [number, number]; // [min, max] starting soil moisture %
  
  // Pedagogical & agronomic curriculum
  climateChallenge: string;
  keyRegenerativeStrategy: string;
  recommendedCrops: string[];
  recommendedPractices: {
    title: string;
    impact: string;
    whyItWorks: string;
  }[];
  realWorldAnalog: string;
  scientificFacts: string[];
  
  seasons: {
    [key in Season]: {
      name: string;
      avgTemp: number; // Celsius
      avgRainfallPerSeason: number; // mm
      rainChancePerDay: number; // 0-1
      droughtRisk: number; // 0-1
      heatwaveRisk: number; // 0-1
      pestSwarmRisk: number; // 0-1
      unseasonalRainRisk: number; // 0-1
      sunlightLevel: number; // 1-5
    };
  };
}

export const CLIMATE_ZONES: Record<string, AgroClimateZone> = {
  arid: {
    id: 'arid',
    name: 'Arid & Dryland Basin',
    regionCategory: 'Arid',
    subtitle: 'Hyper-evaporation, deep groundwater, extreme heat waves',
    description: 'High vapor pressure deficit (VPD) and relentless sun dry unprotected topsoil in days. Flood irrigation creates toxic salt crusts; only organic mulch armor and drip irrigation can sustain life.',
    badgeColor: 'amber',
    icon: '🏜️',
    evaporationMultiplier: 1.90, // +90% evaporation
    cropWaterDemandMultiplier: 1.45, // +45% crop transpiration draw
    rainInfiltrationFactor: 0.75, // Crusted bare soils suffer high runoff
    pestPressureMultiplier: 0.85, // Lower pest diversity, but locust/drought pests
    baselineGroundwaterDepth: 18.5,
    baselineSOMRange: [18, 25],
    baselineMoistureRange: [28, 38],
    climateChallenge: 'Extreme evaporative demand rapidly desiccates unarmored topsoil (<4 days). Capillary evaporation draws subsoil salts, causing salinity toxicity if flood-irrigated.',
    keyRegenerativeStrategy: '100% soil armor (mulching/stubble) to slash evaporation by 62%, sub-canopy drip lines, and agroforestry shelterbelts to deflect parched desert winds.',
    recommendedCrops: ['Pearl Millet', 'Sorghum', 'Cowpea', 'Sunflower', 'Cover Crop'],
    recommendedPractices: [
      {
        title: 'Continuous Organic Mulching (Soil Armor)',
        impact: 'Cuts surface evaporation by up to 62%',
        whyItWorks: 'Acts as an insulating thermal barrier that drops soil surface temperature by 8-12°C and prevents solar radiation from vaporizing capillary water.'
      },
      {
        title: 'Micro-Drip Over Flood Irrigation',
        impact: 'Saves 70% groundwater & eliminates salinity crusts',
        whyItWorks: 'Flood irrigation saturates surface soil where heat causes flash-evaporation, leaving mineral salt deposits. Drip delivers water directly to root zones without surface puddles.'
      },
      {
        title: 'Agroforestry Windbreak Borders',
        impact: 'Reduces evapotranspiration by 18-25%',
        whyItWorks: 'Tall perimeter trees deflect desiccating thermal gales, lowering boundary-layer wind speed across crop plots and preserving relative humidity.'
      }
    ],
    realWorldAnalog: 'Sahelian Sub-Sahara, Thar Desert fringes, Great Basin, Australian interior',
    scientificFacts: [
      'In arid climates, bare soil can lose up to 12-16mm of water daily to atmosphere purely from solar irradiance.',
      'A 1% increase in Soil Organic Matter (SOM) in drylands holds approximately 27,000 gallons of additional soil water per acre.',
      'Flood irrigation in hyper-arid zones is a primary global driver of agricultural desertification due to secondary salinization.'
    ],
    seasons: {
      Spring: {
        name: 'Early Hot Season',
        avgTemp: 31,
        avgRainfallPerSeason: 15,
        rainChancePerDay: 0.05,
        droughtRisk: 0.35,
        heatwaveRisk: 0.40,
        pestSwarmRisk: 0.12,
        unseasonalRainRisk: 0.02,
        sunlightLevel: 5
      },
      Summer: {
        name: 'Peak Scorch Summer',
        avgTemp: 38,
        avgRainfallPerSeason: 25,
        rainChancePerDay: 0.08,
        droughtRisk: 0.45,
        heatwaveRisk: 0.50,
        pestSwarmRisk: 0.20,
        unseasonalRainRisk: 0.05,
        sunlightLevel: 5
      },
      Autumn: {
        name: 'Dry Autumn',
        avgTemp: 28,
        avgRainfallPerSeason: 10,
        rainChancePerDay: 0.04,
        droughtRisk: 0.30,
        heatwaveRisk: 0.15,
        pestSwarmRisk: 0.10,
        unseasonalRainRisk: 0.02,
        sunlightLevel: 4
      },
      Winter: {
        name: 'Cool Crisp Winter',
        avgTemp: 19,
        avgRainfallPerSeason: 20,
        rainChancePerDay: 0.06,
        droughtRisk: 0.15,
        heatwaveRisk: 0.0,
        pestSwarmRisk: 0.05,
        unseasonalRainRisk: 0.02,
        sunlightLevel: 4
      }
    }
  },

  temperate: {
    id: 'temperate',
    name: 'Temperate Continental Plains',
    regionCategory: 'Temperate',
    subtitle: 'Four distinct seasons, moderate rainfall, winter freeze',
    description: 'Classic agricultural breadbasket with freezing winters, moist spring thaws, and warm productive summers. The primary challenge is maintaining living roots year-round to stop winter erosion.',
    badgeColor: 'emerald',
    icon: '🌾',
    evaporationMultiplier: 1.0, // Baseline standard
    cropWaterDemandMultiplier: 1.0, // Baseline standard
    rainInfiltrationFactor: 1.0,
    pestPressureMultiplier: 1.0,
    baselineGroundwaterDepth: 11.0,
    baselineSOMRange: [34, 42],
    baselineMoistureRange: [42, 54],
    climateChallenge: 'Winter soil bareness after autumn harvest leaves soil exposed to freeze-thaw erosion; sudden summer heatwaves can deplete soil moisture if SOM sponge is degraded.',
    keyRegenerativeStrategy: 'Overwintering cover crops (rye, vetch) to hold nitrogen, multi-crop rotation to break pest cycles, and no-till residue retention.',
    recommendedCrops: ['Wheat', 'Legume (Chickpea/Soy)', 'Maize (Corn)', 'Rye-Vetch Cover Crop', 'Mustard / Marigold'],
    recommendedPractices: [
      {
        title: 'Overwintering Cover Cropping',
        impact: 'Prevents 90% of winter nitrate leaching',
        whyItWorks: 'Living roots in late autumn and early spring scavenge loose mineral nitrogen, preventing winter rains and snowmelt from flushing fertilizer into rivers.'
      },
      {
        title: 'Diverse 4-Year Crop Rotation',
        impact: 'Reduces pest pressure by 40% naturally',
        whyItWorks: 'Alternating between cereals (heavy N feeders) and legumes (N fixers) interrupts host-specific insect pupae and pathogenic fungi.'
      },
      {
        title: 'Compost Pit Soil Sponge Building',
        impact: 'Expands root-zone water capacity by 35%',
        whyItWorks: 'Humus-rich compost binds soil particles into resilient aggregates, allowing temperate soils to absorb heavy thunderstorms without puddling.'
      }
    ],
    realWorldAnalog: 'North American Corn/Wheat Belt, Paris Basin, Ukrainian Chernozem, Northern China Plain',
    scientificFacts: [
      'In temperate soils, tilling in autumn speeds microbial respiration, releasing up to 1.5 tons of carbon dioxide per hectare into the atmosphere.',
      'A dense rye-vetch cover crop can scavenge up to 120 kg of residual nitrogen per hectare over winter.',
      'Temperate earthworm populations can produce 40 tons of biological casting aggregates per hectare annually if unplowed.'
    ],
    seasons: {
      Spring: {
        name: 'Spring Thaw & Awakening',
        avgTemp: 16,
        avgRainfallPerSeason: 120,
        rainChancePerDay: 0.25,
        droughtRisk: 0.05,
        heatwaveRisk: 0.05,
        pestSwarmRisk: 0.10,
        unseasonalRainRisk: 0.15,
        sunlightLevel: 3
      },
      Summer: {
        name: 'Warm Productive Summer',
        avgTemp: 27,
        avgRainfallPerSeason: 90,
        rainChancePerDay: 0.18,
        droughtRisk: 0.25,
        heatwaveRisk: 0.20,
        pestSwarmRisk: 0.25,
        unseasonalRainRisk: 0.08,
        sunlightLevel: 5
      },
      Autumn: {
        name: 'Golden Autumn Harvest',
        avgTemp: 14,
        avgRainfallPerSeason: 100,
        rainChancePerDay: 0.22,
        droughtRisk: 0.10,
        heatwaveRisk: 0.0,
        pestSwarmRisk: 0.12,
        unseasonalRainRisk: 0.12,
        sunlightLevel: 3
      },
      Winter: {
        name: 'Cold Winter Dormancy',
        avgTemp: 4,
        avgRainfallPerSeason: 60,
        rainChancePerDay: 0.15,
        droughtRisk: 0.05,
        heatwaveRisk: 0.0,
        pestSwarmRisk: 0.02,
        unseasonalRainRisk: 0.05,
        sunlightLevel: 2
      }
    }
  },

  tropical: {
    id: 'tropical',
    name: 'Humid Tropical & Monsoon Rainforest',
    regionCategory: 'Tropical',
    subtitle: 'Warm humidity, torrential downpours, explosive pest biology',
    description: 'Year-round warmth accelerates biological turnover. Intense monsoon cloudbursts wash away unprotected topsoil in hours, while insect swarms and fungal pathogens flourish in the humid air.',
    badgeColor: 'teal',
    icon: '🌴',
    evaporationMultiplier: 1.20, // High temperature causes steady evaporation despite humidity
    cropWaterDemandMultiplier: 1.10, // Fast vegetative growth cycles
    rainInfiltrationFactor: 1.20, // Highly weathered tropical soils need continuous cover to absorb
    pestPressureMultiplier: 1.50, // Pests reproduce year-round without winter kill
    baselineGroundwaterDepth: 7.2,
    baselineSOMRange: [25, 33], // Organic matter decomposes rapidly in warm moisture
    baselineMoistureRange: [50, 75],
    climateChallenge: 'Torrential rains inflict massive kinetic erosion on bare soil. Microbial activity burns through organic matter 3x faster than temperate zones, leaching soluble nutrients.',
    keyRegenerativeStrategy: 'Multi-strata agroforestry canopy to shatter raindrop kinetic energy, continuous living groundcover, and abundant trap-crop biocontrol borders to manage rampant pests.',
    recommendedCrops: ['Legume', 'Maize (Corn)', 'Sunflower', 'Trap Crop (Mustard/Marigold)', 'Cover Crop'],
    recommendedPractices: [
      {
        title: 'Multi-Tier Agroforestry Canopy',
        impact: 'Cuts rainfall impact velocity by 85%',
        whyItWorks: 'High tree crowns break massive raindrops into a gentle mist, preventing soil compaction and catastrophic topsoil mud washouts.'
      },
      {
        title: 'Trap Crops & Flowering Corridors',
        impact: 'Maintains predator-to-pest balance without chemical spirals',
        whyItWorks: 'Tropical warmth enables continuous insect breeding; chemical sprays trigger rapid pest resistance and destroy predator populations.'
      },
      {
        title: 'Continuous High-Biomass Green Manure',
        impact: 'Replenishes rapidly mineralized humus',
        whyItWorks: 'Soil microbes consume organic carbon rapidly in warm wet soils; continuous green manure cycling keeps soil microbiology continuously nourished.'
      }
    ],
    realWorldAnalog: 'Mekong River Basin, Brazilian Cerrado, Western Ghats of India, Sub-Saharan Guinea Savanna',
    scientificFacts: [
      'A single tropical cloudburst can deliver 60mm of rain in 40 minutes, carrying away up to 15 tons of topsoil per hectare if left bare.',
      'Because tropical climates have no killing winter frost, insect pests can produce 8 to 12 generations per calendar year.',
      'Agroforestry systems in humid tropics store up to 300% more total ecosystem carbon than monoculture open fields.'
    ],
    seasons: {
      Spring: {
        name: 'Hot Pre-Monsoon',
        avgTemp: 33,
        avgRainfallPerSeason: 80,
        rainChancePerDay: 0.15,
        droughtRisk: 0.20,
        heatwaveRisk: 0.35,
        pestSwarmRisk: 0.30,
        unseasonalRainRisk: 0.10,
        sunlightLevel: 5
      },
      Summer: {
        name: 'Monsoon Deluge',
        avgTemp: 29,
        avgRainfallPerSeason: 380,
        rainChancePerDay: 0.65,
        droughtRisk: 0.02,
        heatwaveRisk: 0.05,
        pestSwarmRisk: 0.45,
        unseasonalRainRisk: 0.35,
        sunlightLevel: 2
      },
      Autumn: {
        name: 'Post-Monsoon Humid Sun',
        avgTemp: 28,
        avgRainfallPerSeason: 140,
        rainChancePerDay: 0.28,
        droughtRisk: 0.08,
        heatwaveRisk: 0.10,
        pestSwarmRisk: 0.35,
        unseasonalRainRisk: 0.15,
        sunlightLevel: 4
      },
      Winter: {
        name: 'Mild Dry Tropical Winter',
        avgTemp: 24,
        avgRainfallPerSeason: 40,
        rainChancePerDay: 0.10,
        droughtRisk: 0.15,
        heatwaveRisk: 0.02,
        pestSwarmRisk: 0.20,
        unseasonalRainRisk: 0.05,
        sunlightLevel: 4
      }
    }
  },

  semi_arid: {
    id: 'semi_arid',
    name: 'Semi-Arid Monsoon Mediterranean',
    regionCategory: 'Mediterranean',
    subtitle: 'Long scorching dry season punctuated by brief torrential monsoons',
    description: 'A delicate hydrologic balance: 9 months of intense evaporation and parched soils followed by a brief deluge. Rainwater retention ponds and aquifer recharge are crucial for survival.',
    badgeColor: 'orange',
    icon: '🫒',
    evaporationMultiplier: 1.45, // +45% evaporation
    cropWaterDemandMultiplier: 1.25, // +25% water demand
    rainInfiltrationFactor: 0.90,
    pestPressureMultiplier: 1.10,
    baselineGroundwaterDepth: 14.5,
    baselineSOMRange: [29, 36],
    baselineMoistureRange: [38, 48],
    climateChallenge: 'Acute seasonal groundwater overdraft during the long dry spell, followed by flash runoff loss during sudden monsoon thunderstorms.',
    keyRegenerativeStrategy: 'Rainwater harvesting farm ponds to recharge aquifers, mulch to survive the 90-day dry heat, and drought-tolerant legumes in rotation.',
    recommendedCrops: ['Wheat', 'Legume (Chickpea)', 'Sunflower', 'Cover Crop', 'Trap Crop'],
    recommendedPractices: [
      {
        title: 'Rainwater Retention Pond & Aquifer Recharging',
        impact: 'Boosts water table rise by +300% during rains',
        whyItWorks: 'Traps surface flash-floods and slowly infiltrates excess runoff into deep underground sub-surface aquifers rather than losing it to downstream gutters.'
      },
      {
        title: 'Deep-Taproot Crop Rotations',
        impact: 'Punches through subsoil hardpan without tillage',
        whyItWorks: 'Sunflowers and deep-rooted legumes penetrate compact subsoil layers, opening vertical moisture channels down into the water table.'
      },
      {
        title: 'Mulch Armor Before Dry Season',
        impact: 'Conserves 50% more residual monsoon moisture',
        whyItWorks: 'Locking in moisture immediately after the final autumn rains allows cover crops and winter crops to mature without excessive irrigation pumping.'
      }
    ],
    realWorldAnalog: 'Deccan Plateau, Mediterranean Andalucia, California Central Valley, Southern Africa',
    scientificFacts: [
      'In semi-arid regions, unlined flood canals lose up to 45% of pumped water directly to evaporation before it reaches the crop root zone.',
      'Farm ponds with vegetative perimeter borders reduce surface water evaporation by up to 20% compared to barren concrete reservoirs.',
      'Replacing fallow land with drought-tolerant cover crops actually increases net soil moisture by improving infiltration during erratic rainfall.'
    ],
    seasons: {
      Spring: {
        name: 'Spring / Pre-Monsoon Heat',
        avgTemp: 29,
        avgRainfallPerSeason: 45,
        rainChancePerDay: 0.10,
        droughtRisk: 0.25,
        heatwaveRisk: 0.35,
        pestSwarmRisk: 0.15,
        unseasonalRainRisk: 0.05,
        sunlightLevel: 4
      },
      Summer: {
        name: 'Monsoon / Wet Season',
        avgTemp: 32,
        avgRainfallPerSeason: 280,
        rainChancePerDay: 0.45,
        droughtRisk: 0.05,
        heatwaveRisk: 0.10,
        pestSwarmRisk: 0.30,
        unseasonalRainRisk: 0.20,
        sunlightLevel: 3
      },
      Autumn: {
        name: 'Post-Monsoon Harvest',
        avgTemp: 24,
        avgRainfallPerSeason: 70,
        rainChancePerDay: 0.15,
        droughtRisk: 0.15,
        heatwaveRisk: 0.05,
        pestSwarmRisk: 0.20,
        unseasonalRainRisk: 0.10,
        sunlightLevel: 4
      },
      Winter: {
        name: 'Mild Winter Rabi',
        avgTemp: 18,
        avgRainfallPerSeason: 30,
        rainChancePerDay: 0.08,
        droughtRisk: 0.20,
        heatwaveRisk: 0.0,
        pestSwarmRisk: 0.08,
        unseasonalRainRisk: 0.05,
        sunlightLevel: 3
      }
    }
  },

  boreal: {
    id: 'boreal',
    name: 'Boreal & Sub-Alpine Highland',
    regionCategory: 'Boreal',
    subtitle: 'Short cool growing season, low evaporation, sluggish biological turnover',
    description: 'Cold soils slow microbial mineralization and earthworm activity. While soil evaporation is minimal, the window for heat-loving crops is narrow, demanding cold-resilient cultivars.',
    badgeColor: 'sky',
    icon: '❄️',
    evaporationMultiplier: 0.70, // 30% less evaporation than temperate
    cropWaterDemandMultiplier: 0.80, // Lower transpiration draw due to cool ambient air
    rainInfiltrationFactor: 1.05,
    pestPressureMultiplier: 0.65, // Frost suppressive effects on insect populations
    baselineGroundwaterDepth: 8.5,
    baselineSOMRange: [42, 50], // Slow decomposition yields high organic accumulation
    baselineMoistureRange: [50, 65],
    climateChallenge: 'Short thermal growing degree-days; cold subsoils delay seed germination and reduce early season phosphorus uptake.',
    keyRegenerativeStrategy: 'Dark compost topdressings to warm cold spring topsoils, cold-hardy winter cereals (wheat/rye), and frost-tolerant legumes.',
    recommendedCrops: ['Wheat', 'Legume', 'Cover Crop', 'Trap Crop'],
    recommendedPractices: [
      {
        title: 'Dark Compost Topdressing for Thermal Gain',
        impact: 'Warms spring soil temperature by +3-5°C',
        whyItWorks: 'Dark organic matter absorbs solar radiation rapidly in early spring, triggering early mycorrhizal activity and seed emergence.'
      },
      {
        title: 'Cold-Tolerant Winter Cereals',
        impact: 'Capitalizes on cool spring moisture without irrigation',
        whyItWorks: 'Winter cereals establish deep roots before winter freeze and surge in early spring long before annual weeds emerge.'
      },
      {
        title: 'Aggressive Residue Preservation',
        impact: 'Protects fragile soil aggregates from freeze-thaw cracking',
        whyItWorks: 'Insulating stubble cushions soil microbes against deep soil freezing, preserving earthworm burrows for spring drainage.'
      }
    ],
    realWorldAnalog: 'Scandinavian agricultural valleys, Canadian Prairies, Scottish Highlands, Andean valleys',
    scientificFacts: [
      'Every 10°C decrease in soil temperature cuts microbial organic matter mineralization rates in half.',
      'Cold soils can hold significantly higher baseline organic matter because carbon decomposition is slowed by winter dormancy.',
      'Sub-zero winter freezes naturally kill up to 80% of overwintering insect larvae in topsoil.'
    ],
    seasons: {
      Spring: {
        name: 'Cool Thaw & Mud Season',
        avgTemp: 9,
        avgRainfallPerSeason: 75,
        rainChancePerDay: 0.22,
        droughtRisk: 0.02,
        heatwaveRisk: 0.0,
        pestSwarmRisk: 0.04,
        unseasonalRainRisk: 0.08,
        sunlightLevel: 3
      },
      Summer: {
        name: 'Cool Crisp Summer (Peak Growth)',
        avgTemp: 21,
        avgRainfallPerSeason: 85,
        rainChancePerDay: 0.20,
        droughtRisk: 0.10,
        heatwaveRisk: 0.05,
        pestSwarmRisk: 0.12,
        unseasonalRainRisk: 0.06,
        sunlightLevel: 5
      },
      Autumn: {
        name: 'Brisk Early Frost Autumn',
        avgTemp: 8,
        avgRainfallPerSeason: 70,
        rainChancePerDay: 0.20,
        droughtRisk: 0.05,
        heatwaveRisk: 0.0,
        pestSwarmRisk: 0.05,
        unseasonalRainRisk: 0.08,
        sunlightLevel: 3
      },
      Winter: {
        name: 'Deep Frozen Winter',
        avgTemp: -3,
        avgRainfallPerSeason: 50,
        rainChancePerDay: 0.18,
        droughtRisk: 0.0,
        heatwaveRisk: 0.0,
        pestSwarmRisk: 0.0,
        unseasonalRainRisk: 0.02,
        sunlightLevel: 1
      }
    }
  }
};

