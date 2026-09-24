import React, { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  calculateEcologicalImpact, 
  simulateEcologicalOutcome, 
  ScenarioSimulationParams,
  PracticeImpactAttribution
} from '../simulation/ecologicalImpact';
import { 
  X, 
  Leaf, 
  Sparkles, 
  Trees, 
  Bug, 
  CloudRain, 
  Droplets, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle, 
  Sliders, 
  BarChart3, 
  ArrowUpRight, 
  CheckCircle2, 
  Car, 
  Flame, 
  Sprout, 
  Compass, 
  Zap, 
  Shield, 
  TreePine, 
  Info,
  ChevronRight
} from 'lucide-react';

type DashboardTab = 'attribution' | 'comparative' | 'simulator' | 'timeline';

export const EcologicalImpactDashboardModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const farm = useGameStore((state) => state.farm);
  const openModal = useGameStore((state) => state.openModal);
  const setActiveTool = useGameStore((state) => state.setActiveTool);

  const [activeTab, setActiveTab] = useState<DashboardTab>('attribution');
  const [selectedPractice, setSelectedPractice] = useState<PracticeImpactAttribution | null>(null);

  // What-If Simulator State
  const [simulatorParams, setSimulatorParams] = useState<ScenarioSimulationParams>({
    coverCropAdoption: 60,
    noTillMulchAdoption: 75,
    organicCompostAdoption: 80,
    hasAgroforestry: farm.unlockedUpgrades.agroforestryBorders,
    hasBiocontrolOnly: farm.consecutiveChemicalFreeSeasons > 0,
    hasMicroDrip: true
  });

  if (activeModal !== 'eco_impact') return null;

  const impactData = calculateEcologicalImpact(farm);
  const simResults = simulateEcologicalOutcome(simulatorParams);

  // Default selected practice if none selected
  const activePractice = selectedPractice || impactData.practiceAttributions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-950 to-stone-900 p-5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-inner">
              <Leaf className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-stone-100 tracking-tight flex items-center gap-2">
                  Ecological Impact Dashboard
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Farm Telemetry
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Visualizing how regenerative choices directly drive soil carbon sequestration and local biodiversity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live KPI Quick Pills */}
            <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800/80">
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-emerald-400/80">Net Carbon Sink</div>
                <div className="text-xs font-bold text-emerald-300 font-mono">
                  +{impactData.totalCarbonSequesteredTons} t CO₂e
                </div>
              </div>
              <div className="h-6 w-px bg-stone-800" />
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-purple-400/80">Biodiversity</div>
                <div className="text-xs font-bold text-purple-300 font-mono">
                  {impactData.overallBiodiversityScore}/100
                </div>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors"
              title="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global KPI Impact Banner */}
        <div className="bg-stone-950/90 px-5 py-3.5 border-b border-stone-800/80 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Carbon Card */}
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5" />
              Soil Carbon Stock
            </span>
            <div className="text-xl font-bold font-mono text-emerald-200 mt-0.5">
              +{impactData.totalCarbonSequesteredTons} <span className="text-xs font-normal text-emerald-400">t CO₂e</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1 truncate">
              <Car className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>≈ {impactData.carbonEquivalents.passengerCarYearsOffset} car-years emissions</span>
            </div>
          </div>

          {/* Biodiversity Tier Card */}
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1">
              <Bug className="w-3.5 h-3.5" />
              Ecosystem Diversity
            </span>
            <div className="text-xl font-bold font-mono text-purple-200 mt-0.5">
              {impactData.overallBiodiversityScore} <span className="text-xs font-normal text-purple-400">/ 100</span>
            </div>
            <div className="text-[10px] font-semibold text-purple-300 mt-1 truncate">
              {impactData.biodiversityTier}
            </div>
          </div>

          {/* Earthworm Density Card */}
          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Earthworm Density
            </span>
            <div className="text-xl font-bold font-mono text-amber-200 mt-0.5">
              {impactData.earthwormDensityPerM2} <span className="text-xs font-normal text-amber-400">worms/m²</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-1 truncate">
              Biological soil plows & aeration
            </div>
          </div>

          {/* Predator/Pest Balance Card */}
          <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/20">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bio-Control Ratio
            </span>
            <div className="text-xl font-bold font-mono text-sky-200 mt-0.5">
              {impactData.beneficialToPestRatio} : 1
            </div>
            <div className="text-[10px] text-stone-400 mt-1 truncate">
              {impactData.beneficialToPestRatio >= 1.5 ? 'Natural biocontrol check' : 'Vulnerable to pest surges'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-950 px-5 border-b border-stone-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('attribution')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'attribution'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Practice Attribution Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('comparative')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'comparative'
                ? 'border-sky-500 text-sky-300 bg-sky-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>Conventional vs Regenerative Benchmark</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Interactive "What-If" Practice Simulator</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/50">
              Model
            </span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Season Progression Timeline</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-stone-900/60 space-y-6">

          {/* TAB 1: PRACTICE ATTRIBUTION BREAKDOWN */}
          {activeTab === 'attribution' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    How Your Player Choices Drive Ecological Outcomes
                  </h3>
                  <p className="text-xs text-stone-400">
                    Direct attribution of carbon storage and biodiversity gains credited to your farm's active management practices.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80 self-start sm:self-auto">
                  Total Active Carbon: +{impactData.totalCarbonSequesteredTons} t CO₂e
                </span>
              </div>

              {/* Animated Practice Attribution Bars */}
              <div className="space-y-3">
                {impactData.practiceAttributions.map((practice) => {
                  const isSelected = activePractice.id === practice.id;
                  const carbonPct = Math.min(100, (practice.carbonContributionTons / Math.max(1, impactData.totalCarbonSequesteredTons)) * 100);
                  const bioPct = Math.min(100, practice.biodiversityScoreGain * 2.8);

                  return (
                    <div
                      key={practice.id}
                      onClick={() => setSelectedPractice(practice)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-stone-950/90 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-lg' 
                          : 'bg-stone-950/60 border-stone-800 hover:bg-stone-950/80 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg text-white font-bold"
                            style={{ backgroundColor: `${practice.color}25`, color: practice.color }}
                          >
                            {practice.icon === 'Sprout' && <Sprout className="w-5 h-5" />}
                            {practice.icon === 'Shield' && <Shield className="w-5 h-5" />}
                            {practice.icon === 'Layers' && <Layers className="w-5 h-5" />}
                            {practice.icon === 'TreePine' && <TreePine className="w-5 h-5" />}
                            {practice.icon === 'Bug' && <Bug className="w-5 h-5" />}
                            {practice.icon === 'Droplets' && <Droplets className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-stone-100">{practice.name}</h4>
                              <span 
                                className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold"
                                style={{ backgroundColor: `${practice.color}20`, color: practice.color }}
                              >
                                {practice.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{practice.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Carbon Gain</span>
                            <span className="text-xs font-bold text-emerald-300 font-mono">
                              +{practice.carbonContributionTons} t
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-semibold text-purple-400 block">Biodiversity</span>
                            <span className="text-xs font-bold text-purple-300 font-mono">
                              +{practice.biodiversityScoreGain} pts
                            </span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-emerald-400' : 'text-stone-600'}`} />
                        </div>
                      </div>

                      {/* Dual Animated Bars: Carbon & Biodiversity */}
                      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-stone-850">
                        {/* Carbon Bar */}
                        <div>
                          <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                            <span>Carbon Contribution Share</span>
                            <span className="font-mono text-emerald-400 font-semibold">{practice.carbonContributionTons} t CO₂e</span>
                          </div>
                          <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                            <div 
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{ 
                                width: `${Math.max(4, carbonPct)}%`, 
                                backgroundColor: practice.color,
                                boxShadow: `0 0 10px ${practice.color}55`
                              }}
                            />
                          </div>
                        </div>

                        {/* Biodiversity Bar */}
                        <div>
                          <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                            <span>Biodiversity Score Impact</span>
                            <span className="font-mono text-purple-400 font-semibold">+{practice.biodiversityScoreGain} pts</span>
                          </div>
                          <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                            <div 
                              className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-purple-500 to-indigo-400"
                              style={{ 
                                width: `${Math.max(4, bioPct)}%`,
                                boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Scientific Mechanism Card (Shown if Selected) */}
                      {isSelected && (
                        <div className="mt-3 p-3 bg-stone-900/90 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1.5 animate-in fade-in duration-200">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                            <Zap className="w-3.5 h-3.5" />
                            Biochemical & Ecological Mechanism:
                          </div>
                          <p className="text-[11px] leading-relaxed text-stone-300">
                            {practice.keyMechanism}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Quick-Link Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-stone-950 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sprout className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs text-stone-300">
                    <strong>Want to accelerate your carbon sequestration?</strong> Plant multi-species cover crops (Rye-Vetch) during fallow periods and avoid surface tilling.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTool({ type: 'plant', cropId: 'cover_crop' });
                      closeModal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1"
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Equip Cover Crop</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTool({ type: 'residue', method: 'mulch' });
                      closeModal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Apply Soil Mulch</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONVENTIONAL VS REGENERATIVE BENCHMARK */}
          {activeTab === 'comparative' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  Ecological Comparison: Conventional Chemical vs Your Farm vs Regenerative Ideal
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Side-by-side animated comparative bars comparing standard industrial monoculture practices with your current telemetry.
                </p>
              </div>

              {/* Comparative Animated Metric Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {impactData.comparativeMetrics.map((m, idx) => {
                  const maxVal = Math.max(m.bestPracticeValue, m.currentValue, m.conventionalValue, 1);
                  const currentWidth = Math.min(100, Math.max(5, (m.currentValue / maxVal) * 100));
                  const convWidth = Math.min(100, Math.max(5, (m.conventionalValue / maxVal) * 100));
                  const idealWidth = Math.min(100, Math.max(5, (m.bestPracticeValue / maxVal) * 100));

                  const isSuperiorToConventional = m.betterDirection === 'higher' 
                    ? m.currentValue >= m.conventionalValue 
                    : m.currentValue <= m.conventionalValue;

                  return (
                    <div key={idx} className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-stone-100">{m.metric}</h4>
                          <span className="text-[10px] text-stone-400 font-mono">Unit: {m.unit}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          isSuperiorToConventional 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {isSuperiorToConventional ? 'Regenerative Advantage' : 'Needs Optimization'}
                        </span>
                      </div>

                      {/* 3 Animated Comparison Bars */}
                      <div className="space-y-2 text-xs">
                        {/* Your Farm (Current) */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-emerald-300 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                              Your Farm (Current)
                            </span>
                            <span className="font-mono font-bold text-emerald-300">{m.format(m.currentValue)}</span>
                          </div>
                          <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                            <div 
                              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm"
                              style={{ width: `${currentWidth}%` }}
                            />
                          </div>
                        </div>

                        {/* Conventional Monoculture Baseline */}
                        <div>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-stone-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-stone-500 inline-block" />
                              Conventional Industrial
                            </span>
                            <span className="font-mono text-stone-400">{m.format(m.conventionalValue)}</span>
                          </div>
                          <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                            <div 
                              className="h-full rounded-full transition-all duration-700 bg-stone-600"
                              style={{ width: `${convWidth}%` }}
                            />
                          </div>
                        </div>

                        {/* Ideal Regenerative Benchmark */}
                        <div>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-sky-400/80 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                              Ideal Benchmark (10-Yr Living Soil)
                            </span>
                            <span className="font-mono text-sky-400/80">{m.format(m.bestPracticeValue)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                            <div 
                              className="h-full rounded-full transition-all duration-700 bg-sky-500/60"
                              style={{ width: `${idealWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-400 bg-stone-900 p-2 rounded-lg border border-stone-850">
                        {m.insight}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* EPA Greenhouse Gas Equivalency Infographic */}
              <div className="bg-gradient-to-br from-emerald-950/70 to-stone-950 p-5 rounded-2xl border border-emerald-500/30 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-emerald-400" />
                  Real-World EPA Climate Impact Equivalency
                </h4>
                <p className="text-xs text-stone-300">
                  By building topsoil organic matter instead of burning and deep tilling, your farm has sequestered an estimated{' '}
                  <strong className="text-emerald-400 font-mono">+{impactData.totalCarbonSequesteredTons} Metric Tons of CO₂e</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-3">
                    <Car className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-lg font-bold font-mono text-emerald-200">
                        {impactData.carbonEquivalents.passengerCarYearsOffset}
                      </div>
                      <div className="text-[10px] text-stone-400">Passenger cars off the road for 1 year</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-3">
                    <Flame className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-lg font-bold font-mono text-amber-200">
                        {impactData.carbonEquivalents.gasolineGallonsSaved.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-stone-400">Gallons of gasoline avoided</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-3">
                    <Trees className="w-6 h-6 text-teal-400 shrink-0" />
                    <div>
                      <div className="text-lg font-bold font-mono text-teal-200">
                        {impactData.carbonEquivalents.urbanTreesGrownFor10Years}
                      </div>
                      <div className="text-[10px] text-stone-400">Tree seedlings grown for 10 years</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERACTIVE "WHAT-IF" PRACTICE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="bg-stone-950/80 p-4 rounded-xl border border-amber-500/30 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Interactive Agro-Ecosystem What-If Simulator
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 max-w-2xl">
                    Adjust hypothetical adoption rates for cover cropping, zero-till mulching, and biological inputs. 
                    Watch the animated projection bars dynamically re-calculate 1-Year and 3-Year carbon and biodiversity trajectories!
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shrink-0">
                  Real-Time Model
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Control Panel (Sliders & Toggles) */}
                <div className="lg:col-span-5 bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 border-b border-stone-850 pb-2">
                    Simulated Farm Practices
                  </h4>

                  {/* Slider 1: Cover Cropping */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-300 font-semibold flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                        Cover Crop Field Adoption
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">{simulatorParams.coverCropAdoption}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={simulatorParams.coverCropAdoption}
                      onChange={(e) => setSimulatorParams({ ...simulatorParams, coverCropAdoption: Number(e.target.value) })}
                      className="w-full accent-emerald-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>0% (Bare fallow)</span>
                      <span>50% (Rotated)</span>
                      <span>100% (Continuous roots)</span>
                    </div>
                  </div>

                  {/* Slider 2: No-Till Mulch */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-300 font-semibold flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        No-Till Living Mulch Armor
                      </span>
                      <span className="font-mono text-amber-400 font-bold">{simulatorParams.noTillMulchAdoption}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={simulatorParams.noTillMulchAdoption}
                      onChange={(e) => setSimulatorParams({ ...simulatorParams, noTillMulchAdoption: Number(e.target.value) })}
                      className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>0% (Deep moldboard plow)</span>
                      <span>100% (Zero disturbance)</span>
                    </div>
                  </div>

                  {/* Slider 3: Organic Compost */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-300 font-semibold flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-lime-400" />
                        Organic Compost Amendments
                      </span>
                      <span className="font-mono text-lime-400 font-bold">{simulatorParams.organicCompostAdoption}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={simulatorParams.organicCompostAdoption}
                      onChange={(e) => setSimulatorParams({ ...simulatorParams, organicCompostAdoption: Number(e.target.value) })}
                      className="w-full accent-lime-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Toggle Controls */}
                  <div className="pt-2 border-t border-stone-850 space-y-2">
                    <label className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800 cursor-pointer hover:bg-stone-850">
                      <span className="text-xs text-stone-300 flex items-center gap-2">
                        <TreePine className="w-3.5 h-3.5 text-cyan-400" />
                        Agroforestry Windbreaks & Hedgerows
                      </span>
                      <input
                        type="checkbox"
                        checked={simulatorParams.hasAgroforestry}
                        onChange={(e) => setSimulatorParams({ ...simulatorParams, hasAgroforestry: e.target.checked })}
                        className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800 cursor-pointer hover:bg-stone-850">
                      <span className="text-xs text-stone-300 flex items-center gap-2">
                        <Bug className="w-3.5 h-3.5 text-purple-400" />
                        100% Botanical Biocontrols (Zero Synthetic Sprays)
                      </span>
                      <input
                        type="checkbox"
                        checked={simulatorParams.hasBiocontrolOnly}
                        onChange={(e) => setSimulatorParams({ ...simulatorParams, hasBiocontrolOnly: e.target.checked })}
                        className="rounded accent-purple-500 w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Reset to Actual Current Farm */}
                  <button
                    onClick={() => setSimulatorParams({
                      coverCropAdoption: Math.round(((farm.tiles.filter(t => t.crop?.typeId === 'cover_crop' || t.crop?.typeId === 'legume').length) / 36) * 100),
                      noTillMulchAdoption: Math.round(((farm.tiles.filter(t => t.residue === 'mulch').length) / 36) * 100),
                      organicCompostAdoption: farm.unlockedUpgrades.compostPit ? 100 : 40,
                      hasAgroforestry: farm.unlockedUpgrades.agroforestryBorders,
                      hasBiocontrolOnly: farm.consecutiveChemicalFreeSeasons > 0,
                      hasMicroDrip: true
                    })}
                    className="w-full py-1.5 text-center text-xs text-stone-400 hover:text-stone-200 underline font-medium"
                  >
                    Reset to My Farm's Current Setup
                  </button>
                </div>

                {/* Animated Simulation Output Bars & Projections */}
                <div className="lg:col-span-7 bg-stone-950/90 border border-stone-800 rounded-xl p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Projected Ecological Trajectory
                    </h4>
                    <span className="text-[10px] text-stone-400">Dynamic Multi-Year Model</span>
                  </div>

                  {/* Projected Carbon Gain Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <CloudRain className="w-3.5 h-3.5 text-emerald-400" />
                        Projected 1-Year Carbon Sequestration
                      </span>
                      <span className="text-sm font-bold font-mono text-emerald-300">
                        +{simResults.y1Carbon} t CO₂e <span className="text-[10px] text-stone-400">({simResults.y3Carbon} t by Year 3)</span>
                      </span>
                    </div>

                    <div className="w-full h-4 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-md"
                        style={{ width: `${Math.min(100, (simResults.y1Carbon / 14) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Projected Biodiversity Index Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Bug className="w-3.5 h-3.5 text-purple-400" />
                        Projected Biodiversity Health Score
                      </span>
                      <span className="text-sm font-bold font-mono text-purple-300">
                        {simResults.y1Bio} / 100 <span className="text-[10px] text-stone-400">({simResults.y3Bio}/100 in Year 3)</span>
                      </span>
                    </div>

                    <div className="w-full h-4 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-600 to-indigo-400 shadow-md"
                        style={{ width: `${simResults.y1Bio}%` }}
                      />
                    </div>
                  </div>

                  {/* Projected Earthworm Densities */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        Projected Earthworm Density
                      </span>
                      <span className="text-sm font-bold font-mono text-amber-300">
                        {simResults.y1Worms} worms/m² <span className="text-[10px] text-stone-400">({simResults.y3Worms} in Year 3)</span>
                      </span>
                    </div>

                    <div className="w-full h-4 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-600 to-yellow-400 shadow-md"
                        style={{ width: `${Math.min(100, (simResults.y1Worms / 400) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Simulated Co-Benefits Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-[10px] uppercase font-semibold text-stone-400 block">Topsoil Humus (SOM)</span>
                      <span className="text-base font-bold font-mono text-emerald-400">+{simResults.projectedSOMGainPct}% SOM</span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">Expands soil water holding capacity by ~45%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-[10px] uppercase font-semibold text-stone-400 block">Chemical Runoff Prevented</span>
                      <span className="text-base font-bold font-mono text-purple-400">{simResults.avoidedToxinsKg} kg active</span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">Protects watershed and local bird species</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEASON PROGRESSION TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Seasonal Carbon & Biodiversity Evolution
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Track your farm's longitudinal transformation from degraded monoculture to a high-capacity ecological haven over time.
                </p>
              </div>

              {/* Vertical Stacked Animated Bar Chart */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-850 pb-2">
                  <span>Season Progression</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Carbon Stock (t CO₂e)
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                      Biodiversity (0-100)
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {impactData.timelineData.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-bold text-stone-200">{item.seasonLabel}</span>
                        <div className="space-x-3 font-mono text-[11px]">
                          <span className="text-emerald-400 font-bold">+{item.carbonTons} t CO₂e</span>
                          <span className="text-purple-400 font-bold">{item.biodiversityScore} Bio</span>
                          <span className="text-amber-400">{item.earthwormDensity} worms/m²</span>
                        </div>
                      </div>

                      {/* Dual Bar Track */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Carbon Bar */}
                        <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                          <div 
                            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-600 to-teal-400 shadow-sm"
                            style={{ width: `${Math.min(100, Math.max(5, (item.carbonTons / 15) * 100))}%` }}
                          />
                        </div>

                        {/* Biodiversity Bar */}
                        <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                          <div 
                            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-600 to-indigo-400 shadow-sm"
                            style={{ width: `${Math.max(5, item.biodiversityScore)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-950 px-5 py-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ecological modeling grounded in real-world soil carbon accounting and trophic biodiversity metrics.</span>
          </div>

          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition-colors"
          >
            Back to Field
          </button>
        </div>

      </div>
    </div>
  );
};
