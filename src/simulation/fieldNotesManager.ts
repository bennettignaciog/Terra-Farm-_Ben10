import { FarmState, FieldNoteEntry, SeasonReportRecord, WeatherEvent } from './types';
import { AgroClimateZone } from '../config/climates';

/**
 * Checks for newly achieved soil health, biodiversity, and hydrological milestones.
 * Returns any newly minted Field Note entries and the updated array of unlocked milestone IDs.
 */
export function checkMilestonesAndWeather(
  farm: FarmState,
  zone: AgroClimateZone,
  prevWeatherEvent: WeatherEvent | null
): { newNotes: FieldNoteEntry[]; updatedMilestones: string[] } {
  const newNotes: FieldNoteEntry[] = [];
  const unlocked = new Set<string>(farm.unlockedMilestones || []);

  const totalTiles = farm.tiles.length;
  if (totalTiles === 0) return { newNotes, updatedMilestones: Array.from(unlocked) };

  const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / totalTiles;
  const avgWorms = farm.tiles.reduce((acc, t) => acc + t.earthwormPopulation, 0) / totalTiles;
  const avgBeneficials = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / totalTiles;
  const avgPests = farm.tiles.reduce((acc, t) => acc + t.pestPressure, 0) / totalTiles;
  const avgCompaction = farm.tiles.reduce((acc, t) => acc + t.compaction, 0) / totalTiles;
  const mulchedTilesCount = farm.tiles.filter(t => t.residue === 'mulch').length;
  const coverCropCount = farm.tiles.filter(t => t.crop?.typeId === 'cover_crop').length;

  const currentYear = farm.year;
  const currentSeason = farm.season;
  const currentDay = farm.dayOfSeason;

  // 1. Weather Event Genesis Observation
  if (!prevWeatherEvent && farm.activeWeatherEvent) {
    const event = farm.activeWeatherEvent;
    let title = 'Weather Advisory';
    let content = '';
    let icon = '🌦️';
    let metricLabel = 'Severity';
    let metricVal = `Lvl ${event.severity}`;

    switch (event.type) {
      case 'heatwave':
        title = 'Severe Heatwave Incursion Observed';
        icon = '🔥';
        content = `Baking solar radiation and stagnant hot air pushed temperatures well above average. Soil evaporation is scaling at ${(zone.evaporationMultiplier * 1.5).toFixed(2)}× normal. Uncovered bare soil will desiccate root zones within 72 hours; mulch armor is urgently recommended.`;
        metricLabel = 'Air Temp';
        metricVal = `${farm.temperatureToday}°C`;
        break;
      case 'drought':
        title = 'Prolonged Drought Cycle Underway';
        icon = '☀️';
        content = `Extended zero-rainfall period initiated. Groundwater table draw is accelerating. Soils with high organic matter (>40% SOM) will exhibit the biological sponge effect, rationing moisture slowly to root hairs.`;
        metricLabel = 'Duration';
        metricVal = `${event.durationDays} Days`;
        break;
      case 'pest_swarm':
        title = 'Migratory Pest Swarm Infestation';
        icon = '🦗';
        content = `An outbreak wave of aphids and leaf-eating larvae has drifted onto the farm perimeter. Tiles with beneficial predatory insect populations or trap crop borders will suppress the colony without synthetic poison.`;
        metricLabel = 'Pest Surge';
        metricVal = '+3.0/day';
        break;
      case 'unseasonal_rain':
        title = 'Intense Cloudburst Deluge (+35mm)';
        icon = '🌧️';
        content = `Sudden torrential cloudburst detected. Soil surface aggregation is being tested: loose, tilled bare dirt risks crusting and sheet wash-away, while armored soil absorbs the surge like a biological cistern.`;
        metricLabel = 'Precipitation';
        metricVal = '35 mm';
        break;
      case 'wind':
        title = 'Dry Gale-Force Thermal Winds';
        icon = '💨';
        content = `High-velocity winds are stripping boundary layer humidity off the field. Agroforestry tree borders and dense canopies are actively breaking the wind tunnel, preventing crop desiccation.`;
        metricLabel = 'Wind Shear';
        metricVal = 'Active';
        break;
    }

    newNotes.push({
      id: `note_weather_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'weather',
      title,
      content,
      metricBadge: {
        label: metricLabel,
        value: metricVal,
        trend: event.type === 'unseasonal_rain' ? 'up' : 'down'
      },
      icon,
      importance: 'alert',
      tags: ['Weather', event.type, zone.name]
    });
  }

  // 2. Heavy Rain Sponge Effect Audit (Auto-logged on heavy natural rain days)
  if (farm.rainfallToday >= 24 && !unlocked.has(`rain_audit_y${currentYear}_s${currentSeason}`)) {
    unlocked.add(`rain_audit_y${currentYear}_s${currentSeason}`);
    const spongeEfficiency = Math.round(50 + (avgSOM / 100) * 45);
    newNotes.push({
      id: `note_rain_audit_${Date.now()}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'weather',
      title: `Monsoon Infiltration Audit: ${farm.rainfallToday}mm Rain`,
      content: `Monitored rainfall infiltration across 36 sectors. Current farm average SOM (${avgSOM.toFixed(1)}%) enabled approximately ${spongeEfficiency}% effective moisture capture into the subsoil profile. Zero sheet erosion observed on armored sectors.`,
      metricBadge: {
        label: 'Infiltration Rate',
        value: `${spongeEfficiency}%`,
        trend: 'up'
      },
      icon: '💧',
      importance: 'normal',
      tags: ['Precipitation', 'SoilSponge', 'Infiltration']
    });
  }

  // 3. Soil Organic Matter (SOM) Milestones
  if (avgSOM >= 35 && !unlocked.has('som_35')) {
    unlocked.add('som_35');
    newNotes.push({
      id: `note_som35_${Date.now()}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'milestone',
      title: 'Milestone Achieved: The Living Sponge Awakes (35% SOM)',
      content: `Farm-wide soil organic matter has officially crossed 35%! Microbial glues (glomalin) and decomposing organic residue have begun aggregating individual mineral silt particles into crumbly, resilient peds. Moisture holding capacity is visibly improving.`,
      metricBadge: {
        label: 'Avg SOM',
        value: `${avgSOM.toFixed(1)}%`,
        trend: 'up'
      },
      icon: '🌱',
      importance: 'milestone',
      tags: ['SOM', 'SoilBiology', 'Milestone']
    });
  }

  if (avgSOM >= 40 && !unlocked.has('som_40')) {
    unlocked.add('som_40');
    newNotes.push({
      id: `note_som40_${Date.now()}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'milestone',
      title: 'Milestone Achieved: Humus Reservoir Horizon (40% SOM)',
      content: `A transformative ecological threshold has been reached: 40% SOM average. For every 1% increase in organic matter, the top 30cm of soil holds an estimated 27,000 additional gallons of water per acre. The farm is now far more resilient against flash droughts.`,
      metricBadge: {
        label: 'Avg SOM',
        value: `${avgSOM.toFixed(1)}%`,
        trend: 'up'
      },
      icon: '🏆',
      importance: 'milestone',
      tags: ['Humus', 'WaterRetention', 'Milestone']
    });
  }

  if (avgSOM >= 50 && !unlocked.has('som_50')) {
    unlocked.add('som_50');
    newNotes.push({
      id: `note_som50_${Date.now()}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'milestone',
      title: 'Milestone Achieved: Regenerative Soil Sanctuary (50% SOM)',
      content: `Incredible agronomic milestone: 50% Soil Organic Matter! The soil profile has matured into deep, rich, chocolate-dark loam teeming with fungal hyphae. Fertilizer needs are plummeting as natural biological nutrient cycling delivers sustained fertility.`,
      metricBadge: {
        label: 'Avg SOM',
        value: `${avgSOM.toFixed(1)}%`,
        trend: 'up'
      },
      icon: '👑',
      importance: 'milestone',
      tags: ['CarbonSink', 'DeepLoam', 'Regenerative']
    });
  }

  // 4. Earthworm Bioturbation Milestones
  if (avgWorms >= 30 && !unlocked.has('worms_30')) {
    unlocked.add('worms_30');
    newNotes.push({
      id: `note_worms30_${Date.now()}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'soil_health',
      title: 'Biological Indicator: Earthworm Colony Expansion',
      content: `Subsurface soil sampling confirms average earthworm densities exceed 30 per sector. The anecic and endogeic worms are actively digesting plant residue, creating vertical macropore biotunnels that break soil compaction and mineralize rich worm castings.`,
      metricBadge: {
        label: 'Earthworms',
        value: `${avgWorms.toFixed(0)}/100`,
        trend: 'up'
      },
      icon: '🪱',
      importance: 'milestone',
      tags: ['Vermiculture', 'Bioturbation', 'SoilEcology']
    });
  }

  // 5. Hardpan Compaction Relief Milestone
  if (avgCompaction <= 18 && !unlocked.has('decompaction_18')) {
    unlocked.add('decompaction_18');
    newNotes.push({
      id: `note_compaction_${Date.now()}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'soil_health',
      title: 'Milestone: Subsoil Hardpan Compaction Relieved (<18%)',
      content: `Compaction levels across the farm have dropped below 18%. By avoiding heavy tillage passes and encouraging deep taproot biological drilling, roots can now effortlessly descend into deeper moist soil horizons without suffering root-tip distortion.`,
      metricBadge: {
        label: 'Compaction',
        value: `${avgCompaction.toFixed(1)}%`,
        trend: 'down'
      },
      icon: '🌿',
      importance: 'milestone',
      tags: ['Decompaction', 'NoTill', 'RootPenetration']
    });
  }

  // 6. Biological Pest Control Equilibrium
  if (avgBeneficials >= 35 && avgBeneficials > avgPests * 1.8 && !unlocked.has('biocontrol_equilibrium')) {
    unlocked.add('biocontrol_equilibrium');
    newNotes.push({
      id: `note_biocontrol_${Date.now()}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'biodiversity',
      title: 'Ecological Balance: Natural Predator-Prey Equilibrium',
      content: `Field counts show beneficial predators (ladybugs, hoverflies, parasitoid wasps, predatory mites) outnumber crop pests nearly 2:1! Synthetic chemical pesticides are completely unnecessary as nature's own police force keeps damage beneath commercial thresholds.`,
      metricBadge: {
        label: 'Beneficials',
        value: `${avgBeneficials.toFixed(0)} vs ${avgPests.toFixed(0)} pests`,
        trend: 'up'
      },
      icon: '🐞',
      importance: 'milestone',
      tags: ['BioControl', 'Biodiversity', 'IntegratedPestManagement']
    });
  }

  // 7. Landscape-Scale Soil Armor Milestone
  if (mulchedTilesCount >= 12 && !unlocked.has('soil_armor_12')) {
    unlocked.add('soil_armor_12');
    newNotes.push({
      id: `note_armor12_${Date.now()}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'management',
      title: 'Practice Milestone: Landscape Soil Armor Deployed',
      content: `Over a third of the farm (12+ sectors) is now permanently armored with organic biomass mulch! Surface soil temperatures under the mulch remain up to 9°C cooler during peak midday sun, cutting evaporation by 62% and preserving tender mycorrhizal networks.`,
      metricBadge: {
        label: 'Armored Sectors',
        value: `${mulchedTilesCount}/36`,
        trend: 'up'
      },
      icon: '🛡️',
      importance: 'milestone',
      tags: ['SoilArmor', 'Mulching', 'Microclimate']
    });
  }

  // 8. Continuous Living Cover Crop Milestone
  if (coverCropCount >= 8 && !unlocked.has('cover_crop_8')) {
    unlocked.add('cover_crop_8');
    newNotes.push({
      id: `note_cover8_${Date.now()}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'management',
      title: 'Practice Milestone: Continuous Living Roots Established',
      content: `Eight or more sectors are actively growing multispecies cover crops. Even between cash crops, these living roots are continually pumping liquid carbon (photosynthate root exudates) straight into the rhizosphere to feed soil microbes and fix organic nitrogen.`,
      metricBadge: {
        label: 'Cover Sectors',
        value: `${coverCropCount} sectors`,
        trend: 'up'
      },
      icon: '🌾',
      importance: 'milestone',
      tags: ['CoverCrops', 'LivingRoots', 'NitrogenFixation']
    });
  }

  // 9. Aquifer Table Hydrological Recovery
  if (farm.groundwaterDepth <= zone.baselineGroundwaterDepth - 1.2 && !unlocked.has('aquifer_recovery_1m')) {
    unlocked.add('aquifer_recovery_1m');
    const riseMeters = (zone.baselineGroundwaterDepth - farm.groundwaterDepth).toFixed(2);
    newNotes.push({
      id: `note_aquifer_${Date.now()}`,
      timestamp: Date.now(),
      year: currentYear,
      season: currentSeason,
      dayOfSeason: currentDay,
      category: 'soil_health',
      title: `Hydrological Triumph: Groundwater Table Risen by +${riseMeters}m`,
      content: `Subsurface hydrologic monitoring reveals the local groundwater table has risen from ${zone.baselineGroundwaterDepth}m to ${farm.groundwaterDepth.toFixed(1)}m. By curtailing flood pumping, mulching against evaporation, and retaining rain, the farm is recharging the regional aquifer.`,
      metricBadge: {
        label: 'Aquifer Level',
        value: `${farm.groundwaterDepth.toFixed(1)}m (+${riseMeters}m)`,
        trend: 'up'
      },
      icon: '🌊',
      importance: 'milestone',
      tags: ['AquiferRecharge', 'WaterConservation', 'Hydrology']
    });
  }

  return { newNotes, updatedMilestones: Array.from(unlocked) };
}

/**
 * Creates an end-of-season agronomic review note for the journal.
 */
export function createSeasonTransitionJournalNote(
  report: SeasonReportRecord,
  farm: FarmState
): FieldNoteEntry {
  const isProfitable = report.netProfit >= 0;
  const chemStatus = report.syntheticChemicalsUsed === 0
    ? '100% Synthetic-Free Organic Protocol'
    : `${report.syntheticChemicalsUsed} synthetic chemical applications recorded`;

  let strategicAdvice = '';
  if (report.avgSoilOrganicMatter < 35) {
    strategicAdvice = 'Recommendation: Focus on surface mulch armor and planting legume cover crops to elevate organic matter above the 35% threshold.';
  } else if (report.groundwaterDepth > 15) {
    strategicAdvice = 'Recommendation: Aquifer depth remains deep. Transition remaining sectors to micro-drip line irrigation and build a farm pond for rainwater capture.';
  } else {
    strategicAdvice = 'Recommendation: Excellent biological momentum. Consider agroforestry tree border expansion to lock in windbreak protection and organic premium contracts.';
  }

  return {
    id: `note_season_end_y${report.year}_${report.season.toLowerCase()}`,
    timestamp: Date.now(),
    year: report.year,
    season: report.season,
    dayOfSeason: 90,
    category: 'management',
    title: `Seasonal Audit: Year ${report.year} ${report.season} Completed`,
    content: `Finalized seasonal accounts. Harvested ${report.cropYieldHarvestedKg}kg of crops with a net balance of ${isProfitable ? `+$${report.netProfit.toFixed(0)}` : `-$${Math.abs(report.netProfit).toFixed(0)}`}. Farm-wide Soil Health Index reached ${report.soilHealthIndex}/100 and Biodiversity Index registered ${report.biodiversityIndex}/100. ${chemStatus}. ${strategicAdvice}`,
    metricBadge: {
      label: 'Net Balance',
      value: `${isProfitable ? '+' : ''}$${report.netProfit.toFixed(0)}`,
      trend: isProfitable ? 'up' : 'down'
    },
    icon: '📊',
    importance: 'milestone',
    tags: ['SeasonAudit', `Year${report.year}`, report.season, 'Economics']
  };
}
