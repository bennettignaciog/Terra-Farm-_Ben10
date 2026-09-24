import { FarmState } from '../simulation/types';

export interface SdgGoalMetric {
  id: string;
  goalNumber: number;
  title: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  score: number; // 0 - 100
  targetStatus: 'Transformational' | 'Good Progress' | 'Needs Attention' | 'Critical Warning';
  primaryMetric: string;
  headlineExplanation: string;
  realWorldContext: string;
  actionsToImprove: string[];
}

export interface FarmSdgReport {
  overallScore: number;
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  totalCarbonSequesteredTons: number;
  waterSavedMeters: number;
  chemicalsAvoidedScore: number;
  goals: SdgGoalMetric[];
}

export function calculateFarmSdgReport(farm: FarmState): FarmSdgReport {
  const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / farm.tiles.length;
  const avgWorms = farm.tiles.reduce((acc, t) => acc + t.earthwormPopulation, 0) / farm.tiles.length;
  const avgBeneficials = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / farm.tiles.length;
  const avgPests = farm.tiles.reduce((acc, t) => acc + t.pestPressure, 0) / farm.tiles.length;
  const avgCompaction = farm.tiles.reduce((acc, t) => acc + t.compaction, 0) / farm.tiles.length;
  const dripCount = farm.tiles.filter(t => t.irrigation === 'drip').length;
  const floodCount = farm.tiles.filter(t => t.irrigation === 'flood').length;

  // Carbon calculation:
  // Baseline SOM is ~30%. Each 1% SOM increase above 25% on a 36-tile farm (scaled as a smallholder hectare)
  // sequesters approx 0.85 metric tons of organic soil carbon (CO2 equivalent)
  const somGain = Math.max(0, avgSOM - 25);
  const carbonTons = Number((somGain * 0.85).toFixed(2));

  // SDG 2: Zero Hunger (Sustainable Agriculture)
  // Evaluated by soil nutrient capacity, absence of monocrop exhaustion, and organic yield potential
  let sdg2Score = Math.min(100, Math.max(0, 
    (avgSOM * 0.5) + (farm.hasOrganicCertification ? 25 : farm.consecutiveChemicalFreeSeasons * 6) + (100 - avgCompaction) * 0.25
  ));

  // SDG 6: Clean Water & Aquifer Stewardship
  // Evaluated by groundwater depth (14m baseline, <10m excellent, >22m critical) and non-leaching irrigation
  let depthScore = Math.max(0, 100 - ((farm.groundwaterDepth - 8) / (25 - 8)) * 100);
  let irrigationEfficiencyBonus = (dripCount * 2) - (floodCount * 1.5) + (farm.unlockedUpgrades.farmPond ? 15 : 0);
  let sdg6Score = Math.min(100, Math.max(0, depthScore * 0.7 + irrigationEfficiencyBonus + 15));

  // SDG 12: Responsible Consumption & Production (Circular Inputs)
  // Evaluated by organic compost vs synthetic chemicals, mulch vs burning
  let burnedTiles = farm.tiles.filter(t => t.residue === 'burnt_ash').length;
  let mulchedTiles = farm.tiles.filter(t => t.residue === 'mulch').length;
  let compostBonus = farm.unlockedUpgrades.compostPit ? 15 : 0;
  let sdg12Score = Math.min(100, Math.max(0, 
    40 + (mulchedTiles * 1.5) - (burnedTiles * 4) + (farm.hasOrganicCertification ? 30 : farm.consecutiveChemicalFreeSeasons * 8) + compostBonus
  ));

  // SDG 13: Climate Action (Carbon Sequestration & Resilience)
  // High SOM acts as massive carbon sponge; cover crops & agroforestry prevent thermal heating
  let agroforestryBonus = farm.unlockedUpgrades.agroforestryBorders ? 20 : 0;
  let sdg13Score = Math.min(100, Math.max(0, 
    (avgSOM * 0.7) + agroforestryBonus + (mulchedTiles * 0.5)
  ));

  // SDG 15: Life on Land (Biodiversity & Soil Food Web)
  // Earthworms, beneficial predators, absence of pesticide shock
  let sdg15Score = Math.min(100, Math.max(0, 
    (avgWorms * 0.4) + (avgBeneficials * 0.4) + (100 - avgPests) * 0.2 + (farm.unlockedUpgrades.agroforestryBorders ? 15 : 0)
  ));

  const goals: SdgGoalMetric[] = [
    {
      id: 'sdg_2',
      goalNumber: 2,
      title: 'Zero Hunger & Sustainable Food Systems',
      shortName: 'Food Sovereignty',
      color: '#d97706', // amber-600
      bgColor: 'rgba(217, 119, 6, 0.12)',
      borderColor: 'rgba(217, 119, 6, 0.4)',
      iconName: 'Sprout',
      score: Math.round(sdg2Score),
      targetStatus: sdg2Score >= 75 ? 'Transformational' : sdg2Score >= 50 ? 'Good Progress' : sdg2Score >= 30 ? 'Needs Attention' : 'Critical Warning',
      primaryMetric: `${avgSOM.toFixed(1)}% Soil Organic Matter`,
      headlineExplanation: 'Promotes agricultural practices that maintain soil ecosystem vitality and produce nutrient-rich food without exhausting future seasons.',
      realWorldContext: 'According to the FAO, 33% of the world’s agricultural soils are moderately to highly degraded due to erosion, nutrient depletion, and chemical salinization.',
      actionsToImprove: [
        'Rotate with nitrogen-fixing chickpeas or soybeans to break pest cycles',
        'Add organic compost to restore macro-nutrient bioavailability',
        'Avoid uninterrupted monocropping of heavy feeders like maize'
      ]
    },
    {
      id: 'sdg_6',
      goalNumber: 6,
      title: 'Clean Water & Aquifer Stewardship',
      shortName: 'Water & Aquifer',
      color: '#0284c7', // sky-600
      bgColor: 'rgba(2, 132, 199, 0.12)',
      borderColor: 'rgba(2, 132, 199, 0.4)',
      iconName: 'Droplet',
      score: Math.round(sdg6Score),
      targetStatus: sdg6Score >= 75 ? 'Transformational' : sdg6Score >= 50 ? 'Good Progress' : sdg6Score >= 30 ? 'Needs Attention' : 'Critical Warning',
      primaryMetric: `${farm.groundwaterDepth.toFixed(1)}m Aquifer Depth`,
      headlineExplanation: 'Conserves precious groundwater tables and prevents fertilizer runoff and nitrate leaching into communal water bodies.',
      realWorldContext: 'Over 70% of global freshwater withdrawals are consumed by agriculture. Unregulated flood irrigation is rapidly depleting critical aquifers across California, Spain, and South Asia.',
      actionsToImprove: [
        'Upgrade open flood trenches to precision micro-drip emitters',
        'Excavate a rainwater harvesting farm pond to replenish the sub-surface water table',
        'Maintain living mulch on the soil surface to reduce evaporation by up to 50%'
      ]
    },
    {
      id: 'sdg_12',
      goalNumber: 12,
      title: 'Responsible Consumption & Circular Production',
      shortName: 'Circular Inputs',
      color: '#eab308', // yellow-500
      bgColor: 'rgba(234, 179, 8, 0.12)',
      borderColor: 'rgba(234, 179, 8, 0.4)',
      iconName: 'RefreshCw',
      score: Math.round(sdg12Score),
      targetStatus: sdg12Score >= 75 ? 'Transformational' : sdg12Score >= 50 ? 'Good Progress' : sdg12Score >= 30 ? 'Needs Attention' : 'Critical Warning',
      primaryMetric: farm.hasOrganicCertification ? '100% Certified Organic' : `${farm.consecutiveChemicalFreeSeasons}/3 Clean Seasons`,
      headlineExplanation: 'Eliminates reliance on finite fossil-fuel derived fertilizers and persistent chemical biocides in favor of closed-loop on-farm biological cycles.',
      realWorldContext: 'Synthetic nitrogen fertilizer production via the Haber-Bosch process consumes 1-2% of the world’s total energy supply and generates significant greenhouse gas emissions.',
      actionsToImprove: [
        'Halt crop residue burning entirely to keep biomass on the farm',
        'Install an on-farm compost pit to recycle organic matter into premium natural fertilizer',
        'Utilize biological pest controls (ladybugs and botanicals) instead of toxic chemical sprays'
      ]
    },
    {
      id: 'sdg_13',
      goalNumber: 13,
      title: 'Climate Action & Carbon Sequestration',
      shortName: 'Carbon Sink',
      color: '#10b981', // emerald-500
      bgColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      iconName: 'CloudRain',
      score: Math.round(sdg13Score),
      targetStatus: sdg13Score >= 75 ? 'Transformational' : sdg13Score >= 50 ? 'Good Progress' : sdg13Score >= 30 ? 'Needs Attention' : 'Critical Warning',
      primaryMetric: `${carbonTons} Metric Tons CO2e Sequestered`,
      headlineExplanation: 'Transforms agricultural soils from net carbon emitters into active planetary carbon sinks while building thermal climate resilience.',
      realWorldContext: 'Agricultural soil contains 2 to 3 times more carbon than the entire Earth’s atmosphere. Regenerative agriculture can sequester up to 3-5 gigatons of CO2 globally every year.',
      actionsToImprove: [
        'Keep living roots in the soil year-round through cover crops (clover, tillage radish)',
        'Establish agroforestry windbreak borders with native deep-rooting trees',
        'Practice minimal or zero soil disturbance to prevent carbon oxidation into CO2'
      ]
    },
    {
      id: 'sdg_15',
      goalNumber: 15,
      title: 'Life on Land & Ecosystem Biodiversity',
      shortName: 'Soil Ecology',
      color: '#8b5cf6', // purple-500
      bgColor: 'rgba(139, 92, 246, 0.12)',
      borderColor: 'rgba(139, 92, 246, 0.4)',
      iconName: 'Bug',
      score: Math.round(sdg15Score),
      targetStatus: sdg15Score >= 75 ? 'Transformational' : sdg15Score >= 50 ? 'Good Progress' : sdg15Score >= 30 ? 'Needs Attention' : 'Critical Warning',
      primaryMetric: `${Math.round(avgWorms)} Earthworms / ${Math.round(avgBeneficials)} Beneficials`,
      headlineExplanation: 'Protects pollinators, beneficial predatory insects, and the underground microscopic soil food web necessary for life on Earth.',
      realWorldContext: 'A single teaspoon of healthy regenerative soil contains more living microorganisms than there are human beings on Earth.',
      actionsToImprove: [
        'Never use broad-spectrum chemical insecticides that kill predatory ladybugs and spiders',
        'Plant sunflower trap crops and flowering borders to feed beneficial pollinators',
        'Protect earthworm burrows from mechanical tillage and chemical burn'
      ]
    }
  ];

  const overallScore = Math.round(
    goals.reduce((acc, g) => acc + g.score, 0) / goals.length
  );

  let overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  if (overallScore >= 88) overallGrade = 'A+';
  else if (overallScore >= 75) overallGrade = 'A';
  else if (overallScore >= 60) overallGrade = 'B';
  else if (overallScore >= 45) overallGrade = 'C';
  else overallGrade = 'D';

  return {
    overallScore,
    overallGrade,
    totalCarbonSequesteredTons: carbonTons,
    waterSavedMeters: Number((14.0 - Math.min(14.0, farm.groundwaterDepth)).toFixed(1)),
    chemicalsAvoidedScore: Math.round(sdg12Score),
    goals
  };
}

export interface ScienceModule {
  id: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  keyTakeaway: string;
  scientificMechanism: string;
  realWorldImpact: string;
  gameMechanicConnection: string;
}

export const SCIENCE_MODULES: ScienceModule[] = [
  {
    id: 'soil_biology',
    title: 'The Soil Food Web & Organic Sponge',
    category: 'Soil Microbiology',
    icon: 'Layers',
    summary: 'Soil is not inert dirt; it is a bustling biological metropolis of mycorrhizal fungi, bacteria, nematodes, protozoa, and earthworms.',
    keyTakeaway: 'Every 1% increase in Soil Organic Matter (SOM) allows an acre of soil to hold 20,000 to 27,000 gallons of additional water.',
    scientificMechanism: 'Soil microbes secrete glomalin and polysaccharides—biological glues that cement mineral particles into aggregates. These aggregates form micro-sponges that hold water against gravity, prevent erosion, and allow oxygen infiltration to root tips.',
    realWorldImpact: 'Farms with high organic matter survive 30-day droughts completely unscathed while adjacent chemically degraded farms dry out and blow away as dust.',
    gameMechanicConnection: 'In TerraFarm, tiles with high SOM retain moisture twice as long during heatwaves and droughts, requiring far less irrigation water.'
  },
  {
    id: 'rhizobia_nitrogen',
    title: 'Rhizobium Legumes & The Nitrogen Magic',
    category: 'Plant Physiology',
    icon: 'Sprout',
    summary: 'Earth’s atmosphere is 78% nitrogen, yet plants cannot directly absorb N2 gas. Legumes solve this through an ancient symbiosis with bacteria.',
    keyTakeaway: 'Growing legumes like chickpeas and clover injects 30-70 kg of natural nitrogen per hectare into the soil for free, eliminating synthetic fertilizer needs.',
    scientificMechanism: 'Rhizobium bacteria infect legume root hairs, forming pinkish nodules rich in leghemoglobin. The bacteria use the enzyme nitrogenase to break the triple bond of atmospheric N2, turning it into ammonia (NH3) which the plant uses to build amino acids.',
    realWorldImpact: 'Replacing Haber-Bosch synthetic nitrogen with legume rotations prevents toxic river eutrophication, eliminates fossil fuel inputs, and saves farmers thousands in input costs.',
    gameMechanicConnection: 'Planting legumes (Chickpea/Soybean) or Clover in TerraFarm deposits +35 units of pure biological nitrogen directly into your tile without buying synthetic urea.'
  },
  {
    id: 'pesticide_treadmill',
    title: 'The Pesticide Treadmill & Predator Dynamics',
    category: 'Ecological Entymology',
    icon: 'Bug',
    summary: 'Broad-spectrum chemical sprays kill 99% of insects, but pests possess rapid reproductive cycles and quickly evolve resistance, while predators starve.',
    keyTakeaway: 'Chemical sprays kill beneficial predatory insects (ladybugs, parasitoid wasps) that provide 24/7 free pest suppression.',
    scientificMechanism: 'A single ladybug larva consumes over 400 aphids in its developmental lifecycle. When broad-spectrum chemicals are applied, the predator population collapses because their prey is eliminated. Surviving pests reproduce exponentially without natural checks, creating a worse outbreak.',
    realWorldImpact: 'Farmers get locked into buying increasingly expensive chemical cocktails every year, spending more money to fight pests created by previous sprayings.',
    gameMechanicConnection: 'In TerraFarm, using Chemical Spray reduces pests to 0 for a few days, but drops beneficial insects to 0. Within 1 season, secondary pest pressure surges back above 70%!'
  },
  {
    id: 'aquifer_mechanics',
    title: 'Groundwater Hydrology & Aquifer Depletion',
    category: 'Water Resource Management',
    icon: 'Droplet',
    summary: 'Subterranean aquifers hold fossil water accumulated over thousands of years. Pumping exceeds natural recharge rates across key farming basins.',
    keyTakeaway: 'Precision drip irrigation uses 50-70% less water than flood irrigation while delivering moisture directly to the root zone without evaporation loss.',
    scientificMechanism: 'Flood irrigation creates massive evaporation losses and forces subsoil salts to migrate upward through capillary action, salinizing fertile land. Deep percolation ponds catch monsoon rainwater and channel it through sandy strata to recharge regional aquifers.',
    realWorldImpact: 'In places like the Ogallala Aquifer (USA) and the Indo-Gangetic Plain, water tables are falling by 0.5 to 1.5 meters per year, threatening global food stability.',
    gameMechanicConnection: 'Watching your TerraFarm Water Table strip drop below 20 meters shows how flood irrigation exhausts common-pool resources, while farm ponds reverse the trend.'
  },
  {
    id: 'stubble_burning',
    title: 'Stubble Burning vs. Mulch Soil Armor',
    category: 'Atmospheric & Soil Physics',
    icon: 'Flame',
    summary: 'Burning crop stubble after harvest is fast and free, but vaporizes organic carbon into toxic smoke and leaves soil naked against the elements.',
    keyTakeaway: 'Mulching residue creates a "Soil Armor" that prevents moisture evaporation, drops surface temperature by 15°C, and feeds the earthworm population.',
    scientificMechanism: 'Fire destroys 100% of organic carbon, 80% of nitrogen, and 25% of phosphorus in crop residue. Bare soil exposed to midday sun heats up to 55°C (130°F), killing beneficial bacteria and baking earthworms. Mulch acts as a thermal blanket and slow-release fertilizer.',
    realWorldImpact: 'Seasonal crop residue burning in northern India creates hazardous smog plumes covering entire states, causing severe respiratory illness and accelerating glacial melting.',
    gameMechanicConnection: 'Burning residue in TerraFarm costs $0 but penalizes SOM (-4.5%) and wipes out earthworms. Mulching costs a small labor fee but enriches soil for the next crop.'
  }
];

export interface PioneerBio {
  name: string;
  role: string;
  region: string;
  imageTag: string;
  quote: string;
  contribution: string;
}

export const AGRI_PIONEERS: PioneerBio[] = [
  {
    name: 'Masanobu Fukuoka',
    role: 'Pioneer of Natural Farming & Seed Balls',
    region: 'Japan',
    imageTag: 'Fukuoka',
    quote: 'The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings.',
    contribution: 'Author of "The One-Straw Revolution". Proved that farming without tilling, without synthetic chemicals, and without prepared compost could match or exceed conventional yields by cooperating with nature.'
  },
  {
    name: 'Gabe Brown',
    role: 'Regenerative Agriculture Leader & Author',
    region: 'North Dakota, USA',
    imageTag: 'GabeBrown',
    quote: 'Do not focus on yields; focus on soil health, profit per acre, and quality of life. The yields will follow.',
    contribution: 'Transformed 5,000 degraded acres into a world-famous regenerative farm using multi-species cover crops, zero-tillage, and mob-grazing. Author of "Dirt to Soil".'
  },
  {
    name: 'Dr. Vandana Shiva',
    role: 'Ecologist & Seed Sovereignty Advocate',
    region: 'India',
    imageTag: 'VandanaShiva',
    quote: 'In nature’s economy the currency is not money, it is life.',
    contribution: 'Founder of Navdanya. Has helped over 500,000 farmers transition away from toxic chemicals, preserving native open-pollinated seed varieties and proving biodiversity produces higher nutrition per acre.'
  },
  {
    name: 'George Washington Carver',
    role: 'Agricultural Scientist & Soil Revitalizer',
    region: 'United States',
    imageTag: 'Carver',
    quote: 'Where there is no vision, there is no hope. Look about you; take hold of the things that are here and talk to them.',
    contribution: 'Rescued southern US soils exhausted by continuous cotton monoculture by introducing legume crop rotations (peanuts and sweet potatoes) to regenerate soil nitrogen.'
  },
  {
    name: 'Sir Albert Howard',
    role: 'Founder of the Modern Organic Movement',
    region: 'United Kingdom / India',
    imageTag: 'Howard',
    quote: 'The health of soil, plant, animal, and man is one and indivisible.',
    contribution: 'Developed the "Indore Process" of systematic aerobic composting after studying traditional Indian agricultural practices. Author of "An Agricultural Testament" (1940).'
  }
];

export interface CitizenAction {
  title: string;
  timeCommitment: string;
  impactLevel: 'Direct Community' | 'Ecological Habit' | 'Systemic Change';
  description: string;
  stepByStep: string[];
}

export const CITIZEN_AGRI_ACTIONS: CitizenAction[] = [
  {
    title: 'Support Local CSAs & Regenerative Farmers',
    timeCommitment: '1 hour / week',
    impactLevel: 'Direct Community',
    description: 'Community Supported Agriculture (CSA) connects consumers directly with local farmers. Buying directly guarantees fair wages and incentivizes organic soil stewardship.',
    stepByStep: [
      'Find a local farm co-op or CSA directory in your region',
      'Commit to a seasonal farm box or shop at weekly farmers markets',
      'Ask farmers about their soil practices: "Do you use cover crops and minimize tillage?"'
    ]
  },
  {
    title: 'Start a Micro-Garden & Compost Bin at Home',
    timeCommitment: '15 mins / day',
    impactLevel: 'Ecological Habit',
    description: 'Even a balcony, windowsill, or community garden plot can produce nutrient-dense greens while diverting kitchen scraps from methane-emitting landfills into rich humus.',
    stepByStep: [
      'Collect food scraps (vegetable peels, coffee grounds) in a countertop compost bin',
      'Mix brown carbon (cardboard, dry leaves) with green nitrogen scraps in a 2:1 ratio',
      'Grow high-yielding herbs or leafy greens (spinach, kale, radishes) in pots'
    ]
  },
  {
    title: 'Perform a Citizen Science "Soil Slake Test"',
    timeCommitment: '30 minutes',
    impactLevel: 'Ecological Habit',
    description: 'The Slake Test visually reveals whether soil has biological aggregate stability or is degraded into loose dust.',
    stepByStep: [
      'Take a clump of soil from a tilled garden and one from a native grassy meadow',
      'Place both clumps onto wire mesh submerged in glass jars of water',
      'Watch: healthy soil stays intact like a sponge; chemically degraded soil dissolves into muddy silt in seconds!'
    ]
  },
  {
    title: 'Explore Careers in Regenerative Agriculture & Agritech',
    timeCommitment: 'Lifelong Calling',
    impactLevel: 'Systemic Change',
    description: 'Agriculture is the most vital industry on Earth. The next generation of agronomists will design climate-cooling food systems using sensor networks, agroforestry, and biological inputs.',
    stepByStep: [
      'Explore university and apprenticeship programs in Agronomy, Agroecology, and Soil Microbiology',
      'Learn precision irrigation, drone multi-spectral crop sensing, and GIS mapping',
      'Work with extension agencies to help family farmers adopt sustainable practices'
    ]
  }
];

export interface LexiconTerm {
  term: string;
  pronunciation: string;
  definition: string;
  whyItMatters: string;
}

export const AGRO_LEXICON: LexiconTerm[] = [
  {
    term: 'Soil Organic Matter (SOM)',
    pronunciation: '/sɔɪl ɔːrˈɡænɪk ˈmætər/',
    definition: 'The fraction of soil consisting of plant and animal residues at various stages of decomposition, living soil microbes, and stable humus.',
    whyItMatters: 'SOM is the holy grail of soil fertility. It holds water like a sponge, binds soil against erosion, and feeds underground biology.'
  },
  {
    term: 'Mycorrhizal Fungi',
    pronunciation: '/ˌmaɪkəˈraɪzəl ˈfʌndʒaɪ/',
    definition: 'A symbiotic association between fungal hyphae and plant roots. Fungi trade water and minerals (especially phosphorus) for plant-made sugars.',
    whyItMatters: 'Extends root surface area by up to 1,000%, giving crops extraordinary drought and pathogen tolerance.'
  },
  {
    term: 'Cover Crop',
    pronunciation: '/ˈkʌvər krɒp/',
    definition: 'Crops planted primarily to manage soil erosion, soil fertility, soil quality, water, weeds, pests, and diseases, rather than for cash harvest.',
    whyItMatters: 'Keeps living roots feeding soil biology during fallow seasons, preventing wind erosion and scavenging spare nitrogen.'
  },
  {
    term: 'Hardpan / Compaction',
    pronunciation: '/ˈhɑːrdpæn/',
    definition: 'A dense layer of subsoil impervious to water and plant roots, typically caused by repetitive tractor plowing or chemical cementation.',
    whyItMatters: 'Blocks crop roots from reaching deep water, causing crops to wilt in mild heat and drowning roots in shallow surface puddles.'
  },
  {
    term: 'Integrated Pest Management (IPM)',
    pronunciation: '/ˈɪntɪɡreɪtɪd pɛst ˈmænɪdʒmənt/',
    definition: 'An ecosystem-based strategy focusing on long-term pest prevention through biological control, habitat manipulation, and resistant crop varieties.',
    whyItMatters: 'Avoids the chemical treadmill by protecting natural predator insects (ladybugs, parasitic wasps) so nature does the pest control for free.'
  },
  {
    term: 'Trap Crop',
    pronunciation: '/træp krɒp/',
    definition: 'A sacrificial plant grown in borders or intercropped to attract agricultural pests away from nearby valuable cash crops.',
    whyItMatters: 'Sunflowers and marigolds lure aphids and borers away from main fields, protecting cash crops without spraying toxic pesticides.'
  },
  {
    term: 'Agroforestry',
    pronunciation: '/ˌæɡroʊˈfɔːrɪstri/',
    definition: 'The deliberate integration of trees and shrubs into crop and animal farming systems.',
    whyItMatters: 'Windbreaks reduce field wind speeds by 60%, lower crop water loss, provide wildlife corridors, and sequester tons of deep carbon.'
  },
  {
    term: 'Humus',
    pronunciation: '/ˈhjuːməs/',
    definition: 'Dark, organic material formed in soil by the complete decay of vegetable and animal matter. Extremely stable over hundreds of years.',
    whyItMatters: 'Gives rich agricultural soil its dark, spongy, earthy scent and extraordinary nutrient-retention capacity.'
  },
  {
    term: 'Aquifer',
    pronunciation: '/ˈækwɪfər/',
    definition: 'An underground body of permeable rock, rock fractures, or unconsolidated materials (gravel, sand, or silt) that can contain or transmit groundwater.',
    whyItMatters: 'Millions of farmers rely on aquifers for irrigation. When extraction outpaces rainfall recharge, wells run dry, threatening global breadbaskets.'
  }
];
