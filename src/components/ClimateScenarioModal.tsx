import React, { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { CLIMATE_ZONES, AgroClimateZone, ClimateCategory } from '../config/climates';
import { sound } from '../audio/sound';
import { 
  X, 
  Globe, 
  Sun, 
  Droplet, 
  Wind, 
  Flame, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Compass, 
  BookOpen, 
  ShieldCheck, 
  TreePine, 
  Layers, 
  CloudRain,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react';

export const ClimateScenarioModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const activeClimateZone = useGameStore((state) => state.activeClimateZone);
  const setClimateZone = useGameStore((state) => state.setClimateZone);
  const farm = useGameStore((state) => state.farm);
  const showNotification = useGameStore((state) => state.showNotification);

  // Allow opening either via 'zones' or 'climate'
  const isOpen = activeModal === 'zones' || activeModal === 'climate';

  const [selectedZoneId, setSelectedZoneId] = useState<string>(activeClimateZone || 'arid');
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'evap_sim' | 'curriculum'>('overview');
  const [confirmSwitchId, setConfirmSwitchId] = useState<string | null>(null);

  // Evaporation Physics Sandbox State
  const [simResidue, setSimResidue] = useState<'bare' | 'stubble' | 'mulch' | 'agroforestry'>('bare');
  const [simSOM, setSimSOM] = useState<number>(30); // 10 to 80%

  if (!isOpen) return null;

  const currentZone = CLIMATE_ZONES[selectedZoneId] || CLIMATE_ZONES.arid;
  const activeZoneObj = CLIMATE_ZONES[activeClimateZone] || CLIMATE_ZONES.arid;
  const allZones = Object.values(CLIMATE_ZONES);

  // Calculate live simulator values based on currentZone biophysics
  const baseEvapPerDay = 1.6; // baseline daily evaporation unit
  const climateEvapFactor = currentZone.evaporationMultiplier ?? 1.0;
  
  let managementEvapFactor = 1.0;
  if (simResidue === 'stubble') managementEvapFactor = 0.75;
  else if (simResidue === 'mulch') managementEvapFactor = 0.38; // 62% reduction via mulch!
  else if (simResidue === 'agroforestry') managementEvapFactor = 0.31; // mulch + windbreak shade!

  // SOM sponge factor (higher SOM retains moisture longer)
  const somRetentionFactor = 1.4 - (simSOM / 100) * 0.6;
  const dailyEvapLoss = (baseEvapPerDay * climateEvapFactor * managementEvapFactor * somRetentionFactor);
  
  // Starting moisture 70%, wilting point 22%
  const usableMoisture = 70 - 22;
  const daysUntilWilting = Math.max(1, Math.round(usableMoisture / Math.max(0.4, dailyEvapLoss)));

  const handleSelectClimate = (zoneId: string) => {
    if (zoneId === activeClimateZone) {
      closeModal();
      return;
    }

    // If game has progressed beyond Year 1 Spring Day 1, confirm reset
    if (farm.history.length > 0 || farm.dayOfSeason > 3 || farm.year > 1) {
      setConfirmSwitchId(zoneId);
    } else {
      applyZoneSwitch(zoneId);
    }
  };

  const applyZoneSwitch = (zoneId: string) => {
    sound.playLevelUp();
    setClimateZone(zoneId);
    setConfirmSwitchId(null);
    showNotification(`Active Climate set to ${CLIMATE_ZONES[zoneId]?.name}. Farm re-seeded with regional hydrology.`, 'success');
    closeModal();
  };

  const getBadgeStyle = (category: ClimateCategory) => {
    switch (category) {
      case 'Arid':
        return 'bg-amber-950/80 border-amber-500/60 text-amber-300';
      case 'Temperate':
        return 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300';
      case 'Tropical':
        return 'bg-teal-950/80 border-teal-500/60 text-teal-300';
      case 'Mediterranean':
        return 'bg-orange-950/80 border-orange-500/60 text-orange-300';
      case 'Boreal':
        return 'bg-sky-950/80 border-sky-500/60 text-sky-300';
      default:
        return 'bg-stone-900 border-stone-700 text-stone-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-100">Regional Climate Scenario Selector</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                  Agro-Biophysical Engine
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Select a regional climate biome to dynamically scale soil evaporation, crop water transpiration, and hydrology.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-stone-950 border border-stone-800 text-xs">
              <span className="text-stone-400">Current Biome:</span>
              <span className="font-bold text-amber-300 flex items-center gap-1">
                {activeZoneObj.icon} {activeZoneObj.name}
              </span>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Close Climate Selector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-2.5 bg-stone-950/90 border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Biome Deep Dive</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cross-Climate Scaling Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('evap_sim')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'evap_sim'
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <Droplet className="w-3.5 h-3.5 text-sky-400" />
              <span>Evaporation Physics Sandbox</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 border border-sky-700/50 text-sky-300 font-mono">
                Interactive
              </span>
            </button>

            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'curriculum'
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Climate-Specific Farming Science</span>
            </button>
          </div>

          <div className="text-[11px] text-stone-400 hidden md:block">
            Scaling dynamic moisture formulas across 36 sectors
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Confirmation Alert Dialog if switching mid-game */}
          {confirmSwitchId && (
            <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/70 text-amber-200 animate-in zoom-in-95 duration-200 shadow-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <h4 className="font-bold text-sm text-amber-100">
                    Switching to {CLIMATE_ZONES[confirmSwitchId]?.name}?
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    Changing the regional climate will seed a brand new 6×6 farm with authentic regional soil organic matter, 
                    aquifer depth ({CLIMATE_ZONES[confirmSwitchId]?.baselineGroundwaterDepth}m), and seasonal weather formulas for Year 1 Spring.
                    Current multi-season progress will be reset.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => applyZoneSwitch(confirmSwitchId)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-all shadow-md"
                    >
                      Confirm & Start in {CLIMATE_ZONES[confirmSwitchId]?.name}
                    </button>
                    <button
                      onClick={() => setConfirmSwitchId(null)}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs border border-stone-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regional Climate Cards Selector Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Choose Regional Biome Scenario
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                5 Distinct Global Biomes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {allZones.map((z) => {
                const isSelected = z.id === selectedZoneId;
                const isCurrentActive = z.id === activeClimateZone;

                return (
                  <div
                    key={z.id}
                    onClick={() => setSelectedZoneId(z.id)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-stone-800/90 border-amber-500/80 ring-1 ring-amber-500/50 shadow-lg shadow-amber-950/30'
                        : 'bg-stone-950/70 border-stone-800/90 hover:bg-stone-850 hover:border-stone-700'
                    }`}
                  >
                    {/* Top row: Icon & Status */}
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{z.icon}</span>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getBadgeStyle(z.regionCategory)}`}>
                          {z.regionCategory}
                        </span>
                        {isCurrentActive && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-700/60 px-1 py-0.2 rounded flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Title & Subtitle */}
                    <div className="my-2.5">
                      <h3 className="text-xs font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                        {z.name}
                      </h3>
                      <p className="text-[10px] text-stone-400 line-clamp-2 mt-0.5 leading-snug">
                        {z.subtitle}
                      </p>
                    </div>

                    {/* Bottom: Biophysics Badges */}
                    <div className="pt-2 border-t border-stone-800/80 space-y-1 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-stone-400">
                        <span>Evap Rate:</span>
                        <span className={`font-bold ${
                          z.evaporationMultiplier > 1.3 
                            ? 'text-amber-400' 
                            : z.evaporationMultiplier < 0.9 
                            ? 'text-sky-300' 
                            : 'text-stone-300'
                        }`}>
                          {z.evaporationMultiplier.toFixed(2)}×
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-stone-400">
                        <span>Crop Water:</span>
                        <span className={`font-bold ${
                          z.cropWaterDemandMultiplier > 1.2 
                            ? 'text-rose-400' 
                            : z.cropWaterDemandMultiplier < 0.9 
                            ? 'text-emerald-300' 
                            : 'text-stone-300'
                        }`}>
                          {z.cropWaterDemandMultiplier.toFixed(2)}×
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-stone-400">
                        <span>Aquifer:</span>
                        <span className="text-stone-300">{z.baselineGroundwaterDepth}m</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TAB 1: BIOME DEEP DIVE */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Selected Biome Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2 rounded-2xl bg-stone-800/80 border border-stone-700/80 shadow-inner">
                    {currentZone.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-stone-100">{currentZone.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getBadgeStyle(currentZone.regionCategory)}`}>
                        {currentZone.regionCategory} Scenario
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
                      {currentZone.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectClimate(currentZone.id)}
                  disabled={currentZone.id === activeClimateZone}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-lg ${
                    currentZone.id === activeClimateZone
                      ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-default'
                      : 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-stone-950 shadow-amber-950/40 active:scale-95'
                  }`}
                >
                  {currentZone.id === activeClimateZone ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Current Active Biome</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-stone-950" />
                      <span>Initialize Farm in this Climate</span>
                    </>
                  )}
                </button>
              </div>

              {/* 4 Biophysical Meters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Evaporation Rate */}
                <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="flex items-center gap-1 font-semibold text-stone-300">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Soil Evaporation Rate
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {currentZone.evaporationMultiplier.toFixed(2)}×
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden my-2">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (currentZone.evaporationMultiplier / 2.0) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 leading-tight">
                    {currentZone.evaporationMultiplier > 1.3 
                      ? 'High vapor pressure deficit: unmulched topsoil dries in <4 days.'
                      : currentZone.evaporationMultiplier < 0.9 
                      ? 'Cool ambient air minimizes daily topsoil vapor loss.' 
                      : 'Moderate seasonal evaporation curve.'}
                  </p>
                </div>

                {/* 2. Crop Water Demand */}
                <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="flex items-center gap-1 font-semibold text-stone-300">
                      <Droplet className="w-3.5 h-3.5 text-sky-400" />
                      Crop Transpiration Draw
                    </span>
                    <span className="font-mono font-bold text-sky-300 text-sm">
                      {currentZone.cropWaterDemandMultiplier.toFixed(2)}×
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden my-2">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (currentZone.cropWaterDemandMultiplier / 1.6) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 leading-tight">
                    {currentZone.cropWaterDemandMultiplier > 1.2
                      ? 'Crops drink water aggressively to prevent heat desiccation.'
                      : 'Standard vegetative transpiration requirements.'}
                  </p>
                </div>

                {/* 3. Baseline Groundwater Table */}
                <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="flex items-center gap-1 font-semibold text-stone-300">
                      <Layers className="w-3.5 h-3.5 text-teal-400" />
                      Aquifer Depth
                    </span>
                    <span className="font-mono font-bold text-teal-300 text-sm">
                      {currentZone.baselineGroundwaterDepth}m
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden my-2">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (currentZone.baselineGroundwaterDepth / 25) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 leading-tight">
                    {currentZone.baselineGroundwaterDepth > 15
                      ? 'Deep water table; heavy flood pumping risks critical exhaustion.'
                      : 'Accessible aquifer recharge; water table rises rapidly in rain.'}
                  </p>
                </div>

                {/* 4. Pest Swarm Multiplier */}
                <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="flex items-center gap-1 font-semibold text-stone-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      Pest Biology Factor
                    </span>
                    <span className="font-mono font-bold text-purple-300 text-sm">
                      {currentZone.pestPressureMultiplier.toFixed(2)}×
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden my-2">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (currentZone.pestPressureMultiplier / 1.6) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 leading-tight">
                    {currentZone.pestPressureMultiplier > 1.2
                      ? 'Warm humid air causes continuous multi-generational insect pressure.'
                      : 'Winter cold or arid conditions provide natural pest suppression.'}
                  </p>
                </div>
              </div>

              {/* Climate Challenge & Core Strategy Callout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Primary Agronomic Vulnerability</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {currentZone.climateChallenge}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Key Regenerative Farming Strategy</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {currentZone.keyRegenerativeStrategy}
                  </p>
                </div>
              </div>

              {/* Recommended Climate-Adapted Crops */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                    <TreePine className="w-4 h-4 text-emerald-400" />
                    Recommended Resilient Crops for this Climate
                  </h4>
                  <span className="text-[11px] text-stone-500">Naturally adapted root architectures</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentZone.recommendedCrops.map((cropName) => (
                    <div 
                      key={cropName}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700/80 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{cropName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Field Practices */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Targeted Regenerative Practices for {currentZone.name}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentZone.recommendedPractices.map((prac, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-stone-950/90 border border-stone-800 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-amber-300">{prac.title}</div>
                        <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> {prac.impact}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                          {prac.whyItWorks}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4-Season Temperature & Rain Preview */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-300 uppercase tracking-wider">
                    Annual 4-Season Climate Cycle
                  </span>
                  <span className="text-stone-500 font-mono">Real-World Analog: {currentZone.realWorldAnalog}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['Spring', 'Summer', 'Autumn', 'Winter'] as const).map((s) => {
                    const cfg = currentZone.seasons[s];
                    return (
                      <div key={s} className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs space-y-1">
                        <div className="font-bold text-amber-300 flex items-center justify-between">
                          <span>{s}</span>
                          <span className="text-stone-400 font-normal">{cfg.avgTemp}°C</span>
                        </div>
                        <div className="text-[11px] text-stone-300 truncate" title={cfg.name}>{cfg.name}</div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          Rain: {cfg.avgRainfallPerSeason}mm • Drought: {Math.round(cfg.droughtRisk * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPARISON MATRIX */}
          {activeTab === 'comparison' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800">
                <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
                  Biophysical Scaling Coefficients Across All Climates
                </h3>
                <p className="text-xs text-stone-400">
                  Compare how the simulation dynamically alters evaporation physics, crop transpiration, and aquifer draw rates for each biome.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-950 text-stone-400 border-b border-stone-800">
                      <th className="p-3 font-semibold">Climate Biome</th>
                      <th className="p-3 font-semibold">Evap Rate Multiplier</th>
                      <th className="p-3 font-semibold">Crop Water Demand</th>
                      <th className="p-3 font-semibold">Rain Infiltration</th>
                      <th className="p-3 font-semibold">Pest Multiplier</th>
                      <th className="p-3 font-semibold">Aquifer Baseline</th>
                      <th className="p-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {allZones.map((z) => {
                      const isActive = z.id === activeClimateZone;
                      const isSelected = z.id === selectedZoneId;

                      return (
                        <tr 
                          key={z.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-amber-950/20' : 'bg-stone-900/60 hover:bg-stone-850'
                          }`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{z.icon}</span>
                              <div>
                                <div className="font-bold text-stone-100 flex items-center gap-1.5">
                                  <span>{z.name}</span>
                                  {isActive && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-stone-500">{z.regionCategory}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 font-mono font-bold">
                            <span className={z.evaporationMultiplier > 1.3 ? 'text-amber-400' : z.evaporationMultiplier < 0.9 ? 'text-sky-300' : 'text-stone-200'}>
                              {z.evaporationMultiplier.toFixed(2)}×
                            </span>
                            <span className="text-[10px] text-stone-500 font-normal ml-1">
                              ({z.evaporationMultiplier >= 1.0 ? `+${Math.round((z.evaporationMultiplier - 1) * 100)}%` : `-${Math.round((1 - z.evaporationMultiplier) * 100)}%`})
                            </span>
                          </td>

                          <td className="p-3 font-mono font-bold">
                            <span className={z.cropWaterDemandMultiplier > 1.2 ? 'text-rose-400' : z.cropWaterDemandMultiplier < 0.9 ? 'text-emerald-300' : 'text-stone-200'}>
                              {z.cropWaterDemandMultiplier.toFixed(2)}×
                            </span>
                          </td>

                          <td className="p-3 font-mono text-stone-300">
                            {z.rainInfiltrationFactor.toFixed(2)}×
                          </td>

                          <td className="p-3 font-mono text-stone-300">
                            {z.pestPressureMultiplier.toFixed(2)}×
                          </td>

                          <td className="p-3 font-mono text-stone-300">
                            {z.baselineGroundwaterDepth}m
                          </td>

                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedZoneId(z.id);
                                handleSelectClimate(z.id);
                              }}
                              disabled={isActive}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                isActive
                                  ? 'bg-stone-800 text-stone-500 cursor-default'
                                  : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50'
                              }`}
                            >
                              {isActive ? 'Current' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INTERACTIVE EVAPORATION PHYSICS SANDBOX */}
          {activeTab === 'evap_sim' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-stone-900 to-sky-950/40 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <Droplet className="w-4 h-4 text-sky-400" />
                  Interactive Soil Evaporation & Armor Simulator
                </div>
                <p className="text-xs text-stone-300">
                  Experiment with different soil management practices under the selected climate ({currentZone.name}) 
                  to see how organic mulch armor and soil organic matter drastically cut daily evaporation loss.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Simulator Controls */}
                <div className="p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-2">
                      1. Surface Soil Armor Management
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSimResidue('bare')}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                          simResidue === 'bare'
                            ? 'bg-rose-950/60 border-rose-500/70 text-rose-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="font-bold">Bare Tilled Soil</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">100% solar exposure; unshielded</div>
                      </button>

                      <button
                        onClick={() => setSimResidue('stubble')}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                          simResidue === 'stubble'
                            ? 'bg-amber-950/60 border-amber-500/70 text-amber-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="font-bold">Crop Stubble</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">Minimal 25% evaporation brake</div>
                      </button>

                      <button
                        onClick={() => setSimResidue('mulch')}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                          simResidue === 'mulch'
                            ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="font-bold">Organic Mulch Armor</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">Cuts evaporation by 62%!</div>
                      </button>

                      <button
                        onClick={() => setSimResidue('agroforestry')}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                          simResidue === 'agroforestry'
                            ? 'bg-teal-950/60 border-teal-500/70 text-teal-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="font-bold">Mulch + Agroforestry</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">Shade + Windbreak + Mulch</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-300 mb-1.5">
                      <span>2. Soil Organic Matter (SOM Sponge)</span>
                      <span className="font-mono text-emerald-400">{simSOM}% SOM</span>
                    </div>
                    <input 
                      type="range"
                      min={10}
                      max={80}
                      step={5}
                      value={simSOM}
                      onChange={(e) => setSimSOM(Number(e.target.value))}
                      className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500 mt-1">
                      <span>10% (Degraded Dust)</span>
                      <span>45% (Healthy Soil)</span>
                      <span>80% (Rich Humus)</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Outcome Display */}
                <div className="p-4 rounded-xl bg-stone-950/90 border border-stone-800 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-3">
                      Simulated Biophysical Outcome ({currentZone.name})
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                        <div className="text-[10px] text-stone-400 uppercase font-semibold">Daily Moisture Loss</div>
                        <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                          {dailyEvapLoss.toFixed(2)}% <span className="text-xs font-normal text-stone-400">/day</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                        <div className="text-[10px] text-stone-400 uppercase font-semibold">Days to Critical Drought</div>
                        <div className={`text-xl font-bold font-mono mt-1 ${
                          daysUntilWilting < 6 ? 'text-rose-400' : daysUntilWilting > 12 ? 'text-emerald-300' : 'text-amber-300'
                        }`}>
                          {daysUntilWilting} <span className="text-xs font-normal text-stone-400">days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-900/90 border border-stone-800 text-xs text-stone-300 space-y-1.5 leading-relaxed">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Scientific Insight:
                    </div>
                    {simResidue === 'bare' && (
                      <p>
                        In <span className="text-amber-300 font-semibold">{currentZone.name}</span>, bare soil creates a chimney effect: 
                        intense sun vaporizes moisture at <span className="font-bold text-rose-300">{dailyEvapLoss.toFixed(2)}%/day</span>. 
                        Crops will suffer lethal moisture stress within just <span className="font-bold text-rose-300">{daysUntilWilting} days</span> without rain or irrigation!
                      </p>
                    )}
                    {simResidue === 'mulch' && (
                      <p>
                        Applying organic mulch acts as an insulation blanket. Surface soil temperature drops by 8-10°C, 
                        extending root-zone survival from 4 days to <span className="font-bold text-emerald-300">{daysUntilWilting} days</span>.
                      </p>
                    )}
                    {simResidue === 'agroforestry' && (
                      <p>
                        Agroforestry shelterbelts reduce boundary wind speed across the farm while mulch halts direct solar radiation, 
                        providing maximum resilience against extreme heatwaves and flash droughts.
                      </p>
                    )}
                    {simResidue === 'stubble' && (
                      <p>
                        Crop stubble provides slight wind relief, but mulching or living cover crops are required for complete soil armor.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CURRICULUM & SCIENCE */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800">
                <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
                  Field Science & Real-World Agro-Ecology
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Key scientific facts and peer-reviewed field findings on managing soil moisture and crop water across diverse biomes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentZone.scientificFacts.map((fact, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-stone-950/90 border border-stone-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {fact}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-purple-300">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Teaching Principle: The Sponge Effect vs. Evaporative Capillary Rise
                </div>
                <p className="text-stone-300 leading-relaxed">
                  In arid and dryland climates, evaporation is not merely an inconvenience—it fundamentally changes soil chemistry. 
                  When bare soils are flood-irrigated under baking sun, water evaporates from the top layer faster than it can sink. 
                  Capillary suction draws deeper groundwater—and dissolved mineral salts—upward to the crust. 
                  When the water vaporizes, salt crystals remain, sterilizing the soil with toxic salinity. 
                  Regenerative farming counters this with continuous organic armor and micro-drip emitters that feed roots without evaporating pools.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>Selected Biome:</span>
            <span className="font-bold text-amber-300 flex items-center gap-1">
              {currentZone.icon} {currentZone.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-300 text-xs font-semibold border border-stone-800 transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => handleSelectClimate(currentZone.id)}
              disabled={currentZone.id === activeClimateZone}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                currentZone.id === activeClimateZone
                  ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-stone-950 shadow-md shadow-amber-950/30'
              }`}
            >
              {currentZone.id === activeClimateZone ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Currently Playing</span>
                </>
              ) : (
                <>
                  <span>Start Farm in this Climate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
