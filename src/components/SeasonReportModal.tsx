import React from 'react';
import { useGameStore } from '../state/gameStore';
import { TRANSLATIONS } from '../config/translations';
import { calculateFarmSdgReport } from '../config/educationalContent';
import { CLIMATE_ZONES } from '../config/climates';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Droplet, 
  DollarSign, 
  Sparkles, 
  GitCompare, 
  ArrowRight,
  ShieldCheck,
  Award,
  Mail,
  BookOpen,
  Globe,
  Trophy
} from 'lucide-react';
import { getLevelForPoints } from '../config/achievements';

export const SeasonReportModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const openModal = useGameStore((state) => state.openModal);
  const latestReport = useGameStore((state) => state.latestReport);
  const language = useGameStore((state) => state.language);
  const farm = useGameStore((state) => state.farm);
  const activeClimateZone = useGameStore((state) => state.activeClimateZone);
  const togglePause = useGameStore((state) => state.togglePause);

  if (activeModal !== 'report' || !latestReport) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const shadow = latestReport.shadowComparison;
  const sdgReport = calculateFarmSdgReport(farm);
  const zone = CLIMATE_ZONES[activeClimateZone] || CLIMATE_ZONES.arid;
  const playerLevel = getLevelForPoints(farm.ecoPoints || 0);

  const handleStartNextSeason = () => {
    closeModal();
    if (farm.isPaused) {
      togglePause(); // resume play
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-100">
                  Season Report: Year {latestReport.year} {latestReport.season}
                </h2>
                <button
                  onClick={() => openModal('climate')}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono flex items-center gap-1 hover:bg-amber-900 transition-colors"
                  title="View Regional Climate Scenario details"
                >
                  <span>{zone.icon}</span>
                  <span className="hidden sm:inline">{zone.name.split(' ')[0]}</span>
                  <span>({zone.evaporationMultiplier.toFixed(1)}× Evap)</span>
                </button>
              </div>
              <p className="text-xs text-stone-400">
                Agronomic outcomes, ecological balance sheet, and shadow counterfactual
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-stone-200">
          {/* EcoPoints & Watershed Honors Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-emerald-950/40 border border-amber-500/40 flex items-center justify-between gap-3 flex-wrap shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shrink-0">
                {playerLevel.badge}
              </div>
              <div>
                <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                  <span>Level {playerLevel.level}: {playerLevel.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                    {(farm.ecoPoints || 0).toLocaleString()} pts
                  </span>
                </div>
                <div className="text-[11px] text-stone-400">
                  {(farm.unlockedBadges || []).length} / 13 Regenerative Badges Unlocked • Farm: {farm.farmName || 'TerraFarm Pioneer'}
                </div>
              </div>
            </div>

            <button
              onClick={() => openModal('leaderboard')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Watershed Standings</span>
            </button>
          </div>

          {/* Financial Summary vs Ecological Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Financial Ledger */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-stone-800/80 pb-2">
                <DollarSign className="w-4 h-4" />
                <span>{t.financialSummary}</span>
              </div>

              <div className="text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-stone-300">
                  <span>Gross Crop Sales:</span>
                  <span className="text-emerald-400 font-bold">+${latestReport.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Total Input & Energy Costs:</span>
                  <span className="text-rose-400">-${latestReport.expenses.toLocaleString()}</span>
                </div>
                <div className="border-t border-stone-800 pt-1.5 flex justify-between text-sm font-bold">
                  <span>Net Season Profit:</span>
                  <span className={latestReport.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {latestReport.netProfit >= 0 ? `+$${latestReport.netProfit.toLocaleString()}` : `-$${Math.abs(latestReport.netProfit).toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 pt-1">
                Harvested {latestReport.cropYieldHarvestedKg} kg across plots.
              </div>
            </div>

            {/* Ecological Balance Sheet */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-stone-800/80 pb-2">
                <Sparkles className="w-4 h-4" />
                <span>{t.ecologicalBalance}</span>
              </div>

              <div className="text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-stone-300">
                  <span>Soil Organic Matter (SOM):</span>
                  <span className="text-amber-300 font-bold">{latestReport.avgSoilOrganicMatter}%</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Groundwater Depth:</span>
                  <span className="text-sky-300 font-bold">{latestReport.groundwaterDepth.toFixed(1)} m</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Beneficial vs Pest Ratio:</span>
                  <span className="text-purple-300 font-bold">
                    {latestReport.avgBeneficialInsects.toFixed(0)} : {latestReport.avgPestPressure.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Synthetic Chemicals Applied:</span>
                  <span className={latestReport.syntheticChemicalsUsed === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {latestReport.syntheticChemicalsUsed} applications
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Organic Certification Tracker */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-200">Organic Certification Contract</h4>
                <p className="text-[11px] text-stone-400">
                  {farm.hasOrganicCertification
                    ? 'Certified Organic Status Active: Unlocks +50% price premium on all produce!'
                    : `Requires 3 consecutive chemical-free seasons. Current streak: ${farm.consecutiveChemicalFreeSeasons}/3`}
                </p>
              </div>
            </div>
            <div className="font-mono text-xs font-bold text-emerald-400 whitespace-nowrap">
              {farm.hasOrganicCertification ? 'CERTIFIED' : `${farm.consecutiveChemicalFreeSeasons}/3 SEASONS`}
            </div>
          </div>

          {/* Shadow Counterfactual Simulation: What If You Had Farmed Differently? */}
          {shadow && (
            <div className="bg-gradient-to-br from-indigo-950/40 via-stone-950 to-stone-950 border border-indigo-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 border-b border-indigo-500/20 pb-2">
                <GitCompare className="w-4 h-4 text-indigo-400" />
                <span>{shadow.alternativeTitle}</span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {shadow.description}
              </p>

              {/* Counterfactual Comparative Delta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-stone-900/90 p-2 rounded border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">Profit Delta</span>
                  <span className={`font-bold ${shadow.netProfitDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {shadow.netProfitDiff >= 0 ? `+$${shadow.netProfitDiff}` : `-$${Math.abs(shadow.netProfitDiff)}`}
                  </span>
                </div>

                <div className="bg-stone-900/90 p-2 rounded border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">Soil Matter</span>
                  <span className="font-bold text-amber-400">
                    +{shadow.soilOrganicMatterDiff}%
                  </span>
                </div>

                <div className="bg-stone-900/90 p-2 rounded border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">Groundwater</span>
                  <span className="font-bold text-sky-400">
                    +{shadow.groundwaterDiff}m
                  </span>
                </div>

                <div className="bg-stone-900/90 p-2 rounded border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">Pest Pressure</span>
                  <span className="font-bold text-purple-400">
                    {shadow.pestPressureDiff}%
                  </span>
                </div>
              </div>

              {/* Agronomic Cause & Effect Explanation */}
              <div className="p-2.5 rounded bg-indigo-950/50 border border-indigo-500/30 text-[11px] text-indigo-200/90 leading-relaxed">
                <span className="font-semibold text-indigo-300 block mb-0.5">Ecological Insight:</span>
                {shadow.insight}
              </div>
            </div>
          )}

          {/* UN Sustainable Development Goals (SDGs) & Carbon Sequestration Assessment */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-stone-950 border border-emerald-500/40 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-stone-100 uppercase tracking-wider">
                  UN 2030 Sustainability Rating
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60">
                Grade {sdgReport.overallGrade} ({sdgReport.overallScore}/100)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Carbon Sequestered</span>
                <span className="font-bold text-emerald-400 font-mono">+{sdgReport.totalCarbonSequesteredTons} t CO₂e</span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Aquifer Balance</span>
                <span className="font-bold text-sky-400 font-mono">{farm.groundwaterDepth.toFixed(1)}m</span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-stone-400 block">Clean Farm Status</span>
                <span className="font-bold text-purple-400 font-mono">
                  {farm.hasOrganicCertification ? 'Organic Verified' : `${farm.consecutiveChemicalFreeSeasons}/3 Seasons`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-300/90 flex-wrap gap-2">
              <span>Learn how regenerative farming practices directly benefit biodiversity and carbon capture.</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal('eco_impact')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 shrink-0"
                >
                  <Leaf className="w-3.5 h-3.5" />
                  Eco Dashboard
                </button>
                <span className="text-stone-600">|</span>
                <button
                  onClick={() => openModal('academy')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Academy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-stone-950 p-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-stone-400 font-mono">
            Cash in Reserve: <strong className="text-emerald-400 font-bold">${latestReport.cashEnd.toLocaleString()}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('leaderboard')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-300 border border-amber-500/50 text-xs font-semibold transition-all shadow-sm"
              title="Open Watershed League & Badges"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Standings</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-mono">
                {(farm.ecoPoints || 0).toLocaleString()}
              </span>
            </button>

            <button
              onClick={() => openModal('field_notes')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-300 border border-amber-500/50 text-xs font-semibold transition-all shadow-sm"
              title="Open Field Notes Journal & Observations"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Field Notes</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-mono">
                {(farm.fieldNotes || []).length}
              </span>
            </button>

            <button
              onClick={() => openModal('climate')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-300 border border-amber-500/50 text-xs font-semibold transition-all shadow-sm"
              title="Open Regional Climate Scenario Selector"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Climate Scenarios</span>
            </button>

            <button
              onClick={() => openModal('eco_impact')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950 to-stone-900 hover:from-emerald-900 hover:to-emerald-900 text-emerald-300 border border-emerald-500/60 text-xs font-semibold transition-all shadow-sm"
              title="Open Ecological Impact Dashboard"
            >
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Eco Dashboard</span>
            </button>

            <button
              onClick={() => openModal('academy')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-emerald-300 border border-emerald-500/50 text-xs font-semibold transition-all shadow-sm"
              title="Open Agro-Ecological Academy and UN SDG Insights"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Agro Academy</span>
            </button>

            <button
              onClick={() => openModal('gmail')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-rose-300 border border-rose-500/40 hover:border-rose-500/70 text-xs font-semibold transition-all shadow-sm"
              title="Dispatch this Season Report to your personal Gmail inbox or extension agency"
            >
              <Mail className="w-4 h-4 text-rose-400" />
              <span>Email Audit via Gmail</span>
            </button>

            <button
              onClick={handleStartNextSeason}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              <span>{t.nextSeason}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
