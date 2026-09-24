import { CropDefinition } from '../simulation/types';

export const CROPS: Record<string, CropDefinition> = {
  wheat: {
    id: 'wheat',
    name: 'Wheat',
    category: 'cereal',
    optimalSeasons: ['Autumn', 'Winter', 'Spring'],
    seedCost: 8,
    baseYieldPerTile: 32, // kg
    baseMarketPrice: 1.25, // $ per kg -> ~$40 gross per tile
    organicPremiumPrice: 1.85,
    durationDays: 65,
    waterDemand: 30,
    nitrogenDemand: 28,
    nitrogenFixation: 0,
    organicMatterContribution: 3,
    pestVulnerability: 30,
    droughtTolerance: 50,
    description: 'A versatile cereal grain. Consumes moderate nitrogen and soil moisture.',
    benefits: ['Reliable staple crop', 'Good stubble for mulching', 'Steady market demand']
  },
  legume: {
    id: 'legume',
    name: 'Chickpea / Soybean',
    category: 'legume',
    optimalSeasons: ['Spring', 'Summer', 'Autumn'],
    seedCost: 12,
    baseYieldPerTile: 24, // kg
    baseMarketPrice: 2.10, // $ per kg -> ~$50 gross per tile
    organicPremiumPrice: 3.15,
    durationDays: 60,
    waterDemand: 22,
    nitrogenDemand: 0, // fixes its own
    nitrogenFixation: 35, // injects N into soil!
    organicMatterContribution: 8,
    pestVulnerability: 20,
    droughtTolerance: 65,
    description: 'Symbiotic root nodules fix atmospheric nitrogen. Essential in rotation cycles.',
    benefits: ['Restores soil Nitrogen naturally', 'Breaks cereal nematode cycles', 'High protein value']
  },
  corn: {
    id: 'corn',
    name: 'Maize (Corn)',
    category: 'cereal',
    optimalSeasons: ['Summer', 'Autumn'],
    seedCost: 14,
    baseYieldPerTile: 50, // kg
    baseMarketPrice: 1.10, // $ per kg -> ~$55 gross per tile (tempting high initial yield!)
    organicPremiumPrice: 1.65,
    durationDays: 70,
    waterDemand: 55, // thirsty!
    nitrogenDemand: 45, // very heavy feeder!
    nitrogenFixation: 0,
    organicMatterContribution: 4,
    pestVulnerability: 50, // corn borer, armyworm
    droughtTolerance: 30, // wilts fast if water table drops
    description: 'High yield potential and rapid cash return, but deeply exhausts nitrogen and water.',
    benefits: ['High initial cash return', 'Abundant biomass', 'High gross harvest volume']
  },
  cover_crop: {
    id: 'cover_crop',
    name: 'Rye-Vetch Cover Crop',
    category: 'cover',
    optimalSeasons: ['Autumn', 'Winter', 'Spring'],
    seedCost: 6,
    baseYieldPerTile: 0, // not harvested for cash!
    baseMarketPrice: 0,
    organicPremiumPrice: 0,
    durationDays: 50,
    waterDemand: 10,
    nitrogenDemand: -15, // net gain of nitrogen
    nitrogenFixation: 25,
    organicMatterContribution: 16, // massive soil organic matter builder!
    pestVulnerability: 5,
    droughtTolerance: 85,
    description: 'Grown during fallow periods to armor the soil, suppress weeds, and feed earthworms.',
    benefits: ['Shields topsoil from erosion', 'Massive organic matter (+16 SOM)', 'Reduces weed pressure']
  },
  trap_crop: {
    id: 'trap_crop',
    name: 'Mustard / Marigold',
    category: 'trap',
    optimalSeasons: ['Spring', 'Summer', 'Autumn'],
    seedCost: 9,
    baseYieldPerTile: 12,
    baseMarketPrice: 1.80,
    organicPremiumPrice: 2.60,
    durationDays: 55,
    waterDemand: 20,
    nitrogenDemand: 15,
    nitrogenFixation: 0,
    organicMatterContribution: 6,
    pestVulnerability: 10,
    droughtTolerance: 60,
    description: 'Acts as a pest decoy and nectar haven for ladybugs, parasitic wasps, and pollinators.',
    benefits: ['Attracts beneficial predators', 'Suppresses root-knot nematodes', 'Reduces pest pressure across neighbors']
  },
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    category: 'cash_crop',
    optimalSeasons: ['Spring', 'Summer'],
    seedCost: 11,
    baseYieldPerTile: 28,
    baseMarketPrice: 1.90,
    organicPremiumPrice: 2.75,
    durationDays: 68,
    waterDemand: 28,
    nitrogenDemand: 25,
    nitrogenFixation: 0,
    organicMatterContribution: 5,
    pestVulnerability: 25,
    droughtTolerance: 75, // deep taproot!
    description: 'Deep taproot punches through subsoil hardpan compaction, accessing deep water reserves.',
    benefits: ['Relieves soil compaction (-18 compaction)', 'Attracts diverse pollinator life', 'Drought-hardy taproot']
  },
  millet: {
    id: 'millet',
    name: 'Pearl Millet / Sorghum',
    category: 'cereal',
    optimalSeasons: ['Spring', 'Summer', 'Autumn'],
    seedCost: 7,
    baseYieldPerTile: 30,
    baseMarketPrice: 1.40,
    organicPremiumPrice: 2.10,
    durationDays: 58,
    waterDemand: 14, // Ultra low water demand! Perfect for arid zones
    nitrogenDemand: 16,
    nitrogenFixation: 0,
    organicMatterContribution: 5,
    pestVulnerability: 15,
    droughtTolerance: 92, // Extreme drought resilience
    description: 'Ancient C4 grain that thrives in arid heat and poor soils, requiring less than half the water of maize.',
    benefits: ['Exceptional drought tolerance (92%)', 'Thrives in parched heat & low rainfall', 'Heavy root exudates nourish dryland mycology']
  },
  heirloom_amaranth: {
    id: 'heirloom_amaranth',
    name: 'Highland Purple Amaranth',
    category: 'cereal',
    optimalSeasons: ['Spring', 'Summer', 'Autumn'],
    seedCost: 10,
    baseYieldPerTile: 34,
    baseMarketPrice: 2.40,
    organicPremiumPrice: 3.80,
    durationDays: 62,
    waterDemand: 16,
    nitrogenDemand: 14,
    nitrogenFixation: 0,
    organicMatterContribution: 12, // High biomass & vibrant humus
    pestVulnerability: 12,
    droughtTolerance: 88,
    isHeirloom: true,
    heirloomOrigin: 'Mesoamerican Sacred Grain',
    pollinatorBoost: 18,
    compactionRelief: 10,
    mycelialAffinity: 25,
    description: 'Ancient ancestral supergrain revered for millenia. Produces striking deep magenta plumage and massive carbon biomass while thriving in dry heat.',
    benefits: ['Ancestral genetic resilience', 'Rich soil organic matter contribution (+12 SOM)', 'High heirloom organic market value ($3.80/kg)']
  },
  heirloom_blue_corn: {
    id: 'heirloom_blue_corn',
    name: 'Hopi Blue Heritage Maize',
    category: 'cereal',
    optimalSeasons: ['Summer', 'Autumn'],
    seedCost: 15,
    baseYieldPerTile: 42,
    baseMarketPrice: 2.20,
    organicPremiumPrice: 3.50,
    durationDays: 72,
    waterDemand: 26, // Far less thirsty than modern hybrid corn!
    nitrogenDemand: 28,
    nitrogenFixation: 0,
    organicMatterContribution: 7,
    pestVulnerability: 22,
    droughtTolerance: 85, // Enormous drought tolerance due to subterranean taproot
    isHeirloom: true,
    heirloomOrigin: 'Hopi Dryland Mesa Landrace',
    pollinatorBoost: 10,
    compactionRelief: 22, // Breaks through subsoil hardpan
    mycelialAffinity: 30,
    description: 'Dryland heirloom with a massive 3-meter taproot designed for mesa sand farming. Yields sapphire-blue kernels rich in antioxidants without chemical inputs.',
    benefits: ['Subterranean taproot punches hardpan', 'Requires 50% less water than hybrid corn', 'Deep mycorrhizal fungal partnership']
  },
  heirloom_cowpea: {
    id: 'heirloom_cowpea',
    name: 'Crimson Velvet Cowpea',
    category: 'legume',
    optimalSeasons: ['Spring', 'Summer', 'Autumn'],
    seedCost: 11,
    baseYieldPerTile: 28,
    baseMarketPrice: 2.60,
    organicPremiumPrice: 4.10,
    durationDays: 56,
    waterDemand: 18,
    nitrogenDemand: 0,
    nitrogenFixation: 44, // Supercharged nitrogen fixation
    organicMatterContribution: 10,
    pestVulnerability: 15,
    droughtTolerance: 86,
    isHeirloom: true,
    heirloomOrigin: 'West African Sahel Landrace',
    pollinatorBoost: 22,
    compactionRelief: 14,
    mycelialAffinity: 35,
    description: 'Sahelian dryland legume with massive rhizobia root nodules that hyper-charge soil nitrogen naturally while thriving in scorching heat.',
    benefits: ['Maximum biological nitrogen fixation (+44 N)', 'Extravagant drought hardiness (86%)', 'Nourishes subterranean microbial food web']
  },
  heirloom_marigold: {
    id: 'heirloom_marigold',
    name: 'Heritage French Marigold & Calendula',
    category: 'trap',
    optimalSeasons: ['Spring', 'Summer', 'Autumn'],
    seedCost: 8,
    baseYieldPerTile: 16,
    baseMarketPrice: 2.80,
    organicPremiumPrice: 4.00,
    durationDays: 52,
    waterDemand: 15,
    nitrogenDemand: 10,
    nitrogenFixation: 0,
    organicMatterContribution: 8,
    pestVulnerability: 5,
    droughtTolerance: 78,
    isHeirloom: true,
    heirloomOrigin: 'Cottage Garden Heirloom Sanctuary',
    pollinatorBoost: 40,
    compactionRelief: 8,
    mycelialAffinity: 28,
    description: 'Luminous double-bloomed companion flowers emitting alpha-terthienyl root exudates that eliminate parasitic nematodes and draw beneficial insects from miles away.',
    benefits: ['Bio-fumigates parasitic soil nematodes', 'Major beneficial insect magnet (+40 bio)', 'Golden petals for botanical herbal sale']
  },
  heirloom_borage: {
    id: 'heirloom_borage',
    name: 'Starflower Borage & Phacelia',
    category: 'trap',
    optimalSeasons: ['Spring', 'Summer'],
    seedCost: 9,
    baseYieldPerTile: 18,
    baseMarketPrice: 3.00,
    organicPremiumPrice: 4.50,
    durationDays: 50,
    waterDemand: 19,
    nitrogenDemand: 12,
    nitrogenFixation: 0,
    organicMatterContribution: 9,
    pestVulnerability: 6,
    droughtTolerance: 72,
    isHeirloom: true,
    heirloomOrigin: 'Mediterranean Permaculture Guild',
    pollinatorBoost: 55, // Ultimate pollinator plant!
    compactionRelief: 12,
    mycelialAffinity: 40,
    description: 'The unrivaled queen of pollinator magnets. Azure star-shaped flowers refill with sweet nectar every two minutes, turning the farm into a bustling pollinator sanctuary.',
    benefits: ['Continuous nectar flow for native bees & butterflies', 'Deep mineral accumulator (potassium & silica)', 'Massive pollinator density boost']
  }
};
