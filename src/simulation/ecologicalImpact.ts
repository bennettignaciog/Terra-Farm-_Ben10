import { FarmState, TileState } from './types';
import { CROPS } from '../config/crops';

export interface PracticeImpactAttribution {
  id: string;
  name: string;
  category: 'cover_crop' | 'no_till' | 'organic_compost' | 'agroforestry' | 'biocontrol' | 'water_pond';
  icon: string;
  color: string;
  badge: string;
  description: string;
  carbonContributionTons: number; // in t CO2e
  biodiversityScoreGain: number; // 0 - 100 relative contribution
  adoptionStatus: 'Active & Thriving' | 'Partially Adopted' | 'Inactive / Degraded';
  adoptionPercentage: number; // 0 - 100%
  keyMechanism: string;
}

export interface MetricComparison {
  metric: string;
  unit: string;
  currentValue: number;
  conventionalValue: number;
  bestPracticeValue: number;
  betterDirection: 'higher' | 'lower';
  format: (v: number) => string;
  insight: string;
}

export interface EcologicalImpactAnalysis {
  // Aggregate Metrics
  totalCarbonSequesteredTons: number;
  carbonEquivalents: {
    gasolineGallonsSaved: number;
    passengerCarYearsOffset: number;
    urbanTreesGrownFor10Years: number;
  };
  overallBiodiversityScore: number; // 0 - 100
  biodiversityTier: 'Collapsing Monoculture' | 'Disturbed' | 'Recovering Ecosystem' | 'Vibrant Biodiverse Haven';
  earthwormDensityPerM2: number;
  beneficialToPestRatio: number;
  waterRetainedInSoilM3: number;

  // Practice Attribution Breakdown
  practiceAttributions: PracticeImpactAttribution[];

  // Comparative Benchmarking against Conventional Farm
  comparativeMetrics: MetricComparison[];

  // Historical Telemetry for Trends
  timelineData: {
    seasonLabel: string;
    carbonTons: number;
    biodiversityScore: number;
    earthwormDensity: number;
    practicesScore: number;
  }[];
}

export function calculateEcologicalImpact(farm: FarmState): EcologicalImpactAnalysis {
  const totalTiles = farm.tiles.length; // 36

  // 1. Tile Status Tallies
  const coverCropTiles = farm.tiles.filter(t => t.crop?.typeId === 'cover_crop').length;
  const legumeTiles = farm.tiles.filter(t => t.crop?.typeId === 'legume').length;
  const mulchedTiles = farm.tiles.filter(t => t.residue === 'mulch').length;
  const burntTiles = farm.tiles.filter(t => t.residue === 'burnt_ash').length;
  const tilledTiles = farm.tiles.filter(t => t.residue === 'none' && !t.crop).length;
  const dripTiles = farm.tiles.filter(t => t.irrigation === 'drip').length;
  const trapCropTiles = farm.tiles.filter(t => t.crop?.typeId === 'trap_crop' || t.crop?.typeId === 'sunflower').length;

  const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / totalTiles;
  const avgWorms = farm.tiles.reduce((acc, t) => acc + t.earthwormPopulation, 0) / totalTiles;
  const avgBeneficials = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / totalTiles;
  const avgPests = farm.tiles.reduce((acc, t) => acc + t.pestPressure, 0) / totalTiles;
  const avgCompaction = farm.tiles.reduce((acc, t) => acc + t.compaction, 0) / totalTiles;
  const avgMoisture = farm.tiles.reduce((acc, t) => acc + t.moisture, 0) / totalTiles;

  // 2. Carbon Sequestration Calculation:
  // Baseline degraded soil SOM is ~22%.
  // Every 1% increase in SOM on a 36-tile farm hectare sequesters ~0.85 t CO2e in topsoil humus.
  const somGain = Math.max(0, avgSOM - 22);
  const soilHumusCarbon = Number((somGain * 0.85).toFixed(2));
  
  // Additional Carbon from Agroforestry Windbreaks:
  const agroforestryCarbon = farm.unlockedUpgrades.agroforestryBorders ? 4.2 : 0;
  
  // Avoided emissions from zero burning & zero diesel tillage:
  const cleanManagementBonus = Math.max(0, (mulchedTiles * 0.08) - (burntTiles * 0.25) + (farm.consecutiveChemicalFreeSeasons * 0.3));
  
  const totalCarbonSequesteredTons = Number(Math.max(0.2, (soilHumusCarbon + agroforestryCarbon + cleanManagementBonus)).toFixed(2));

  // Equivalencies (US EPA Greenhouse Gas Equivalencies model)
  // 1 ton CO2e ≈ 112 gallons gasoline ≈ 0.22 passenger cars/year ≈ 16.5 tree seedlings grown for 10 years
  const gasolineGallonsSaved = Math.round(totalCarbonSequesteredTons * 112);
  const passengerCarYearsOffset = Number((totalCarbonSequesteredTons * 0.22).toFixed(1));
  const urbanTreesGrownFor10Years = Math.round(totalCarbonSequesteredTons * 16.5);

  // 3. Biodiversity Score Calculation (0 - 100):
  // Composed of:
  // - Earthworm abundance (30%)
  // - Beneficial predator insects (30%)
  // - Pest suppression balance (15%)
  // - Habitat complexity (Agroforestry & Mulch) (15%)
  // - Soil health / low compaction (10%)
  const wormFactor = Math.min(100, (avgWorms / 60) * 100);
  const beneficialFactor = Math.min(100, (avgBeneficials / 60) * 100);
  const predatorPestBalance = avgPests > 0 ? Math.min(100, (avgBeneficials / Math.max(10, avgPests)) * 50) : 75;
  const habitatComplexity = (farm.unlockedUpgrades.agroforestryBorders ? 40 : 0) + (mulchedTiles / totalTiles) * 35 + (trapCropTiles / totalTiles) * 25;
  const soilVitality = Math.max(0, 100 - avgCompaction * 0.7);

  const overallBiodiversityScore = Math.round(
    Math.min(100, Math.max(5, (
      wormFactor * 0.28 +
      beneficialFactor * 0.28 +
      predatorPestBalance * 0.16 +
      habitatComplexity * 0.18 +
      soilVitality * 0.10
    )))
  );

  let biodiversityTier: EcologicalImpactAnalysis['biodiversityTier'] = 'Disturbed';
  if (overallBiodiversityScore >= 80) biodiversityTier = 'Vibrant Biodiverse Haven';
  else if (overallBiodiversityScore >= 55) biodiversityTier = 'Recovering Ecosystem';
  else if (overallBiodiversityScore >= 30) biodiversityTier = 'Disturbed';
  else biodiversityTier = 'Collapsing Monoculture';

  // Earthworm density in field units (avg healthy soil: 150-400 worms/m2)
  const earthwormDensityPerM2 = Math.round((avgWorms / 100) * 380);

  // Beneficial to Pest Ratio
  const beneficialToPestRatio = Number((avgBeneficials / Math.max(1, avgPests)).toFixed(2));

  // Water Retained in Soil: 1% SOM holds ~27,000 gal/acre ≈ 250 m3 per hectare
  const waterRetainedInSoilM3 = Math.round((avgSOM / 100) * 850);

  // 4. Practice Attributions: Decomposing exactly which player choices caused these benefits
  const coverCropPct = Math.round(((coverCropTiles + legumeTiles) / totalTiles) * 100);
  const mulchPct = Math.round((mulchedTiles / totalTiles) * 100);
  const dripPct = Math.round((dripTiles / totalTiles) * 100);
  const trapCropPct = Math.round((trapCropTiles / totalTiles) * 100);

  const practiceAttributions: PracticeImpactAttribution[] = [
    {
      id: 'cover_cropping',
      name: 'Multi-Species Cover Cropping',
      category: 'cover_crop',
      icon: 'Sprout',
      color: '#10b981', // emerald
      badge: `${coverCropPct}% Field Coverage`,
      description: 'Living roots in the ground year-round exude sugars that feed mycorrhizal fungi and fix natural nitrogen.',
      carbonContributionTons: Number((coverCropTiles * 0.32 + legumeTiles * 0.18 + (avgSOM > 35 ? 1.2 : 0)).toFixed(2)),
      biodiversityScoreGain: Math.round(Math.min(35, (coverCropTiles * 2.8 + legumeTiles * 1.5 + 4))),
      adoptionStatus: coverCropPct >= 40 ? 'Active & Thriving' : coverCropPct > 0 ? 'Partially Adopted' : 'Inactive / Degraded',
      adoptionPercentage: Math.min(100, coverCropPct * 2), // 50% coverage considered optimal
      keyMechanism: 'The "Liquid Carbon Pathway": plants channel 20-40% of photosynthesized carbon through root tips directly into micro-aggregates, generating stable glomalin.'
    },
    {
      id: 'no_till_mulch',
      name: 'No-Till & Living Soil Armor (Mulch)',
      category: 'no_till',
      icon: 'Shield',
      color: '#eab308', // amber
      badge: `${mulchPct}% Protected Mulch`,
      description: 'Preserves delicate fungal hyphae networks and prevents carbon oxidation caused by mechanical inversion plows.',
      carbonContributionTons: Number((mulchedTiles * 0.24 - (burntTiles * 0.3) + 0.8).toFixed(2)),
      biodiversityScoreGain: Math.round(Math.min(30, (mulchedTiles * 2.2 + (burntTiles > 0 ? -12 : 6)))),
      adoptionStatus: mulchPct >= 50 ? 'Active & Thriving' : mulchPct > 0 ? 'Partially Adopted' : 'Inactive / Degraded',
      adoptionPercentage: mulchPct,
      keyMechanism: 'Eliminating tillage prevents oxygen flushes from rapidly decomposing organic carbon into atmospheric CO2 while keeping surface soil 12°C cooler.'
    },
    {
      id: 'organic_compost',
      name: 'Organic Compost & Manure Cycling',
      category: 'organic_compost',
      icon: 'Layers',
      color: '#84cc16', // lime
      badge: farm.unlockedUpgrades.compostPit ? 'On-Farm Pit Active' : 'Bulk Compost Applied',
      description: 'Slow-release humus amendments feed earthworms and soil bacteria while eliminating reliance on synthetic urea.',
      carbonContributionTons: Number(((avgSOM > 30 ? (avgSOM - 28) * 0.25 : 0.4) + (farm.unlockedUpgrades.compostPit ? 1.4 : 0)).toFixed(2)),
      biodiversityScoreGain: Math.round(Math.min(25, (avgWorms * 0.25 + (farm.unlockedUpgrades.compostPit ? 10 : 3)))),
      adoptionStatus: (farm.unlockedUpgrades.compostPit || avgSOM > 35) ? 'Active & Thriving' : 'Partially Adopted',
      adoptionPercentage: farm.unlockedUpgrades.compostPit ? 100 : Math.min(100, Math.round((avgSOM / 45) * 100)),
      keyMechanism: 'Lignin-rich stable humus remains in the soil for decades, acting as an electrostatic sponge that binds minerals and moisture.'
    },
    {
      id: 'agroforestry',
      name: 'Agroforestry Windbreaks & Hedgerows',
      category: 'agroforestry',
      icon: 'TreePine',
      color: '#06b6d4', // cyan
      badge: farm.unlockedUpgrades.agroforestryBorders ? 'Perimeter Installed' : 'Not Established',
      description: 'Native deep-rooting trees buffer fields against thermal stress, slow desiccating winds, and shelter birds and bats.',
      carbonContributionTons: farm.unlockedUpgrades.agroforestryBorders ? 4.2 : 0,
      biodiversityScoreGain: farm.unlockedUpgrades.agroforestryBorders ? 24 : 0,
      adoptionStatus: farm.unlockedUpgrades.agroforestryBorders ? 'Active & Thriving' : 'Inactive / Degraded',
      adoptionPercentage: farm.unlockedUpgrades.agroforestryBorders ? 100 : 0,
      keyMechanism: 'Perennial woody biomass sequesters permanent recalcitrant carbon while providing vertical ecological niches for predatory raptors and insects.'
    },
    {
      id: 'biocontrol',
      name: 'Integrated Pest Management & Trap Decoys',
      category: 'biocontrol',
      icon: 'Bug',
      color: '#a855f7', // purple
      badge: farm.consecutiveChemicalFreeSeasons > 0 ? `${farm.consecutiveChemicalFreeSeasons} Clean Seasons` : 'Chemical Interventions',
      description: 'Replaces broad-spectrum neurotoxins with ladybug predators, parasitoid wasps, and flowering decoy borders.',
      carbonContributionTons: Number((0.3 + farm.consecutiveChemicalFreeSeasons * 0.35).toFixed(2)),
      biodiversityScoreGain: Math.round(Math.min(32, (avgBeneficials * 0.35 + (farm.consecutiveChemicalFreeSeasons * 4)))),
      adoptionStatus: farm.consecutiveChemicalFreeSeasons >= 2 ? 'Active & Thriving' : farm.consecutiveChemicalFreeSeasons > 0 ? 'Partially Adopted' : 'Inactive / Degraded',
      adoptionPercentage: Math.min(100, farm.consecutiveChemicalFreeSeasons * 33 + trapCropPct),
      keyMechanism: 'Protecting natural predator-prey dynamics breaks the "pesticide treadmill", preventing resistant secondary pest explosions without toxic bio-accumulation.'
    },
    {
      id: 'water_pond',
      name: 'Micro-Drip & Rainwater Farm Pond',
      category: 'water_pond',
      icon: 'Droplets',
      color: '#0284c7', // sky
      badge: farm.unlockedUpgrades.farmPond ? 'Pond & Drip Active' : `${dripPct}% Drip Network`,
      description: 'Reduces irrigation extraction by 60% while recharging groundwater aquifers via perched water table retention.',
      carbonContributionTons: Number((0.4 + (farm.unlockedUpgrades.farmPond ? 1.1 : 0) + (dripPct * 0.01)).toFixed(2)),
      biodiversityScoreGain: Math.round(10 + (farm.unlockedUpgrades.farmPond ? 14 : 0) + (dripPct * 0.1)),
      adoptionStatus: farm.unlockedUpgrades.farmPond ? 'Active & Thriving' : dripPct > 20 ? 'Partially Adopted' : 'Inactive / Degraded',
      adoptionPercentage: (farm.unlockedUpgrades.farmPond ? 50 : 0) + Math.round(dripPct * 0.5),
      keyMechanism: 'Eliminating flood irrigation stops mineral salt crusting and nitrate leaching, while retention ponds create wetland breeding habitats for amphibians and dragonflies.'
    }
  ];

  // 5. Comparative Benchmarking (Current vs Conventional Monoculture Baseline vs Ideal Regenerative Benchmark)
  const comparativeMetrics: MetricComparison[] = [
    {
      metric: 'Topsoil Carbon Sequestration',
      unit: 't CO₂e',
      currentValue: totalCarbonSequesteredTons,
      conventionalValue: 0.8, // Conventional bare fallow farm is net carbon source / near zero
      bestPracticeValue: 14.5,
      betterDirection: 'higher',
      format: (v) => `${v.toFixed(1)} t`,
      insight: 'Regenerative practices turn soil from a carbon polluter into a high-capacity planetary carbon sink.'
    },
    {
      metric: 'Local Biodiversity Index',
      unit: '/100',
      currentValue: overallBiodiversityScore,
      conventionalValue: 18, // Heavy pesticide conventional farm has crushed ecology
      bestPracticeValue: 92,
      betterDirection: 'higher',
      format: (v) => `${Math.round(v)} / 100`,
      insight: 'Reflects above-ground pollinators, predatory beneficial insects, and the subterranean soil food web.'
    },
    {
      metric: 'Earthworm Population Density',
      unit: 'worms/m²',
      currentValue: earthwormDensityPerM2,
      conventionalValue: 25, // Tillage & chemical salts kill earthworms
      bestPracticeValue: 350,
      betterDirection: 'higher',
      format: (v) => `${Math.round(v)}/m²`,
      insight: 'Earthworms are nature’s biological plows—burrowing thousands of micro-channels that aerate root zones.'
    },
    {
      metric: 'Natural Predator-to-Pest Ratio',
      unit: ': 1',
      currentValue: beneficialToPestRatio,
      conventionalValue: 0.15, // Pests outnumber wiped-out predators
      bestPracticeValue: 3.5,
      betterDirection: 'higher',
      format: (v) => `${v.toFixed(2)} : 1`,
      insight: 'When beneficial predators exceed pests, nature performs 100% of pest suppression for free.'
    },
    {
      metric: 'Subsoil Compaction (Hardpan)',
      unit: '%',
      currentValue: avgCompaction,
      conventionalValue: 72, // Heavy tractor compaction
      bestPracticeValue: 12,
      betterDirection: 'lower',
      format: (v) => `${Math.round(v)}%`,
      insight: 'Hardpan restricts crop roots to the top 10cm. Biological roots and earthworms break hardpan naturally.'
    },
    {
      metric: 'Aquifer Water Saved / Season',
      unit: 'm³',
      currentValue: Math.max(50, Math.round(120 + (dripTiles * 14) + (farm.unlockedUpgrades.farmPond ? 180 : 0) - (burntTiles * 20))),
      conventionalValue: 40,
      bestPracticeValue: 450,
      betterDirection: 'higher',
      format: (v) => `${Math.round(v)} m³`,
      insight: 'Precision drip and soil mulching reduce evapotranspiration loss by up to 60% compared to flood trenches.'
    }
  ];

  // 6. Timeline Data (Synthesized from farm history + current state)
  const timelineData = [
    ...farm.history.map((record, index) => {
      const som = record.avgSoilOrganicMatter || 25;
      const cGain = Number((Math.max(0, som - 22) * 0.85).toFixed(2));
      return {
        seasonLabel: `Y${record.year} ${record.season.slice(0, 3)}`,
        carbonTons: Number((cGain + (record.year > 1 ? (record.year - 1) * 0.8 : 0.4)).toFixed(2)),
        biodiversityScore: Math.round(record.biodiversityIndex || 30),
        earthwormDensity: Math.round(((record.soilHealthIndex || 35) / 100) * 280),
        practicesScore: Math.round(record.soilHealthIndex || 40)
      };
    }),
    {
      seasonLabel: `Y${farm.year} ${farm.season.slice(0, 3)} (Now)`,
      carbonTons: totalCarbonSequesteredTons,
      biodiversityScore: overallBiodiversityScore,
      earthwormDensity: earthwormDensityPerM2,
      practicesScore: Math.round((overallBiodiversityScore + Math.min(100, totalCarbonSequesteredTons * 8)) / 2)
    }
  ];

  return {
    totalCarbonSequesteredTons,
    carbonEquivalents: {
      gasolineGallonsSaved,
      passengerCarYearsOffset,
      urbanTreesGrownFor10Years
    },
    overallBiodiversityScore,
    biodiversityTier,
    earthwormDensityPerM2,
    beneficialToPestRatio,
    waterRetainedInSoilM3,
    practiceAttributions,
    comparativeMetrics,
    timelineData
  };
}

export interface ScenarioSimulationParams {
  coverCropAdoption: number; // 0 - 100%
  noTillMulchAdoption: number; // 0 - 100%
  organicCompostAdoption: number; // 0 - 100%
  hasAgroforestry: boolean;
  hasBiocontrolOnly: boolean;
  hasMicroDrip: boolean;
}

export function simulateEcologicalOutcome(params: ScenarioSimulationParams) {
  // Model projected 1-year, 3-year, and 5-year trajectories under simulated player choices
  const coverWeight = params.coverCropAdoption / 100;
  const noTillWeight = params.noTillMulchAdoption / 100;
  const compostWeight = params.organicCompostAdoption / 100;
  const agroWeight = params.hasAgroforestry ? 1 : 0;
  const bioWeight = params.hasBiocontrolOnly ? 1 : 0;
  const dripWeight = params.hasMicroDrip ? 1 : 0;

  // Projected Carbon Sequestration
  const y1Carbon = Number((1.2 + (coverWeight * 2.8) + (noTillWeight * 2.2) + (compostWeight * 1.6) + (agroWeight * 3.8)).toFixed(2));
  const y3Carbon = Number((y1Carbon * 2.4).toFixed(2));
  const y5Carbon = Number((y1Carbon * 4.1).toFixed(2));

  // Projected Biodiversity Score (0 - 100)
  const y1Bio = Math.round(Math.min(98, 25 + (coverWeight * 20) + (noTillWeight * 18) + (bioWeight * 24) + (agroWeight * 12) + (compostWeight * 10)));
  const y3Bio = Math.round(Math.min(99, y1Bio * 1.18));
  const y5Bio = Math.round(Math.min(100, y1Bio * 1.32));

  // Projected Earthworm Density (worms / m2)
  const y1Worms = Math.round(40 + (noTillWeight * 140) + (compostWeight * 90) + (coverWeight * 70));
  const y3Worms = Math.round(Math.min(420, y1Worms * 1.35));

  // Soil Organic Matter Gain (% points)
  const projectedSOMGainPct = Number(((coverWeight * 5.2) + (noTillWeight * 3.8) + (compostWeight * 4.5)).toFixed(1));

  // Avoided Chemical Pesticide Toxicity (Kg active ingredient avoided)
  const avoidedToxinsKg = Math.round(bioWeight * 48 + compostWeight * 22);

  return {
    y1Carbon,
    y3Carbon,
    y5Carbon,
    y1Bio,
    y3Bio,
    y5Bio,
    y1Worms,
    y3Worms,
    projectedSOMGainPct,
    avoidedToxinsKg
  };
}
