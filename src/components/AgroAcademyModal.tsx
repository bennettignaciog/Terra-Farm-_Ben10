import React, { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  calculateFarmSdgReport, 
  SCIENCE_MODULES, 
  AGRI_PIONEERS, 
  CITIZEN_AGRI_ACTIONS, 
  AGRO_LEXICON,
  ScienceModule 
} from '../config/educationalContent';
import { AGRO_SCENARIOS, AgroScenario } from '../config/scenarios';
import { 
  X, 
  BookOpen, 
  Globe, 
  Award, 
  Sparkles, 
  Layers, 
  Sprout, 
  Droplets, 
  Bug, 
  Flame, 
  RefreshCw, 
  Target, 
  Heart, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Play, 
  Compass, 
  ShieldCheck, 
  TreePine, 
  CloudRain,
  ChevronRight,
  Leaf
} from 'lucide-react';

type AcademyTab = 'sdgs' | 'science' | 'scenarios' | 'movement' | 'lexicon';

export const AgroAcademyModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const farm = useGameStore((state) => state.farm);
  const loadScenario = useGameStore((state) => state.loadScenario);
  const openModal = useGameStore((state) => state.openModal);

  const [currentTab, setCurrentTab] = useState<AcademyTab>('sdgs');
  const [selectedScienceId, setSelectedScienceId] = useState<string>(SCIENCE_MODULES[0].id);
  const [lexiconQuery, setLexiconQuery] = useState('');
  const [activeScenarioConfirm, setActiveScenarioConfirm] = useState<AgroScenario | null>(null);

  if (activeModal !== 'academy') return null;

  const sdgReport = calculateFarmSdgReport(farm);
  const selectedScience = SCIENCE_MODULES.find(m => m.id === selectedScienceId) || SCIENCE_MODULES[0];

  const filteredLexicon = AGRO_LEXICON.filter(item => 
    item.term.toLowerCase().includes(lexiconQuery.toLowerCase()) ||
    item.definition.toLowerCase().includes(lexiconQuery.toLowerCase())
  );

  const handleLaunchScenario = (scenario: AgroScenario) => {
    loadScenario(scenario.id);
    setActiveScenarioConfirm(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-emerald-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-950 to-stone-900 p-5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-stone-100 tracking-tight">
                  Agro-Ecological Academy & SDG Hub
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Global Sustainability
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Connecting simulation dynamics with real-world soil science, UN SDGs, and regenerative agriculture.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Field Notes Journal Button */}
            <button
              onClick={() => openModal('field_notes')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-amber-500/50 text-amber-300 text-xs font-semibold transition-all shadow-sm"
              title="Open Field Notes Journal & Observations"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Field Notes</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-mono">
                {(farm.fieldNotes || []).length}
              </span>
            </button>

            {/* Quick Climate Scenarios Button */}
            <button
              onClick={() => openModal('climate')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-xs font-semibold transition-all shadow-sm"
              title="Open Regional Climate Scenario Selector"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Climate Scenarios</span>
            </button>

            {/* Quick Eco Impact Button */}
            <button
              onClick={() => openModal('eco_impact')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-semibold transition-all shadow-sm"
              title="Open Ecological Impact Dashboard"
            >
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Eco Impact</span>
            </button>

            {/* Live SDG Grade Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800">
              <Globe className="w-4 h-4 text-sky-400" />
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">SDG Rating</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">
                  Grade {sdgReport.overallGrade} ({sdgReport.overallScore}/100)
                </div>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors"
              title="Close Academy"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-950 px-5 border-b border-stone-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setCurrentTab('sdgs')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'sdgs'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>UN SDGs Impact</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
              {sdgReport.overallScore}%
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('science')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'science'
                ? 'border-sky-500 text-sky-300 bg-sky-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Soil & Science Almanac</span>
          </button>

          <button
            onClick={() => setCurrentTab('scenarios')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'scenarios'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span>Agro Challenges</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/50">
              4 Missions
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('movement')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'movement'
                ? 'border-rose-500 text-rose-300 bg-rose-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Why Farming Matters (Urge to Farm)</span>
          </button>

          <button
            onClick={() => setCurrentTab('lexicon')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'lexicon'
                ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Field Lexicon</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-stone-900/60">
          
          {/* TAB 1: UN SUSTAINABLE DEVELOPMENT GOALS */}
          {currentTab === 'sdgs' && (
            <div className="space-y-6">
              {/* Macro Carbon & Ecological KPI Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-950/70 to-stone-900 p-4 rounded-xl border border-emerald-500/30 flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5" />
                    Soil Carbon Drawdown
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-200 mt-1">
                    {sdgReport.totalCarbonSequesteredTons} <span className="text-sm font-normal text-emerald-400/80">Tons CO₂e</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Active sequestration via biological Soil Organic Matter (SOM) building.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-sky-950/70 to-stone-900 p-4 rounded-xl border border-sky-500/30 flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />
                    Aquifer Conservation
                  </span>
                  <div className="text-2xl font-bold font-mono text-sky-200 mt-1">
                    {farm.groundwaterDepth.toFixed(1)} <span className="text-sm font-normal text-sky-400/80">meters depth</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {farm.groundwaterDepth <= 14 ? 'Sustainable balance maintained.' : 'Aquifer experiencing overdraft pressure.'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-950/70 to-stone-900 p-4 rounded-xl border border-purple-500/30 flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Clean Agriculture Index
                  </span>
                  <div className="text-2xl font-bold font-mono text-purple-200 mt-1">
                    {farm.hasOrganicCertification ? '100% Organic' : `${farm.consecutiveChemicalFreeSeasons}/3 Seasons`}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Elimination of synthetic toxins and protection of pollinator populations.
                  </p>
                </div>
              </div>

              {/* Individual SDG Goal Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                    United Nations 2030 Agenda: On-Farm Scorecard
                  </h3>
                  <span className="text-xs text-stone-400">
                    Live calculation based on your farm's biological & economic telemetry
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sdgReport.goals.map((goal) => (
                    <div 
                      key={goal.id} 
                      className="p-4 rounded-xl border bg-stone-950/70 flex flex-col justify-between gap-3 shadow-md"
                      style={{ borderColor: goal.borderColor }}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span 
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                              style={{ backgroundColor: goal.color }}
                            >
                              {goal.goalNumber}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-stone-100">{goal.title}</h4>
                              <span className="text-[10px] text-stone-400">{goal.shortName}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono"
                              style={{ backgroundColor: goal.bgColor, color: goal.color }}
                            >
                              {goal.targetStatus}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-stone-400 font-mono">{goal.primaryMetric}</span>
                            <span className="font-bold font-mono" style={{ color: goal.color }}>
                              {goal.score}/100
                            </span>
                          </div>
                          <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${goal.score}%`, backgroundColor: goal.color }}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-stone-300 mt-2.5 leading-relaxed">
                          {goal.headlineExplanation}
                        </p>

                        <div className="mt-2.5 p-2 rounded bg-stone-900/90 border border-stone-800/80 text-[11px] text-stone-400">
                          <strong className="text-stone-300">Global Context: </strong>
                          {goal.realWorldContext}
                        </div>
                      </div>

                      {/* Agronomic Recommendations */}
                      <div className="pt-2 border-t border-stone-800/60">
                        <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
                          How to advance this goal on your farm:
                        </span>
                        <ul className="space-y-1">
                          {goal.actionsToImprove.map((act, i) => (
                            <li key={i} className="text-[11px] text-emerald-300/90 flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOIL & SCIENCE ALMANAC */}
          {currentTab === 'science' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Module Selection Sidebar */}
              <div className="md:col-span-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Fundamental Science Pillars
                </h3>
                {SCIENCE_MODULES.map((module) => {
                  const isSelected = module.id === selectedScienceId;
                  return (
                    <button
                      key={module.id}
                      onClick={() => setSelectedScienceId(module.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-sky-950/60 border-sky-500/60 text-sky-200 ring-1 ring-sky-500/40 shadow-md'
                          : 'bg-stone-950/70 border-stone-800 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-sky-500/20 text-sky-400' : 'bg-stone-900 text-stone-400'}`}>
                        {module.icon === 'Layers' && <Layers className="w-4 h-4" />}
                        {module.icon === 'Sprout' && <Sprout className="w-4 h-4" />}
                        {module.icon === 'Bug' && <Bug className="w-4 h-4" />}
                        {module.icon === 'Droplet' && <Droplets className="w-4 h-4" />}
                        {module.icon === 'Flame' && <Flame className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                          {module.category}
                        </div>
                        <div className="text-xs font-bold truncate mt-0.5">
                          {module.title}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 mt-1 ${isSelected ? 'text-sky-400' : 'text-stone-600'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Module Detailed Exploration View */}
              <div className="md:col-span-8 bg-stone-950/80 border border-stone-800 rounded-2xl p-5 space-y-5">
                <div>
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    {selectedScience.category}
                  </span>
                  <h2 className="text-xl font-bold text-stone-100 mt-0.5">
                    {selectedScience.title}
                  </h2>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                    {selectedScience.summary}
                  </p>
                </div>

                {/* Golden Key Takeaway Banner */}
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300 font-bold mb-0.5">Core Agronomic Law:</strong>
                    {selectedScience.keyTakeaway}
                  </div>
                </div>

                {/* Deep Scientific Mechanism */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    Underlying Biological / Physical Mechanism
                  </h4>
                  <p className="text-xs text-stone-300/90 leading-relaxed p-3 bg-stone-900 rounded-xl border border-stone-800/80">
                    {selectedScience.scientificMechanism}
                  </p>
                </div>

                {/* Real-World Crisis & Solution */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    Real-World Global Agriculture Context
                  </h4>
                  <p className="text-xs text-stone-300/90 leading-relaxed p-3 bg-stone-900 rounded-xl border border-stone-800/80">
                    {selectedScience.realWorldImpact}
                  </p>
                </div>

                {/* Connection to Game Dynamics */}
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs">
                  <strong className="block text-emerald-300 font-bold mb-1 flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-emerald-400" />
                    How This Plays Out in TerraFarm:
                  </strong>
                  <p className="text-emerald-100/90 leading-relaxed">
                    {selectedScience.gameMechanicConnection}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GUIDED AGRO CHALLENGES & SCENARIOS */}
          {currentTab === 'scenarios' && (
            <div className="space-y-5">
              <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-100">
                    Agronomic Field Scenarios
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 max-w-2xl">
                    Step into authentic farming crises modeled on historical and modern agricultural dilemmas. 
                    Practice soil regeneration, aquifer rehabilitation, and chemical detox in hands-on simulation environments.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  Interactive Practice
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AGRO_SCENARIOS.map((scenario) => (
                  <div 
                    key={scenario.id}
                    className="bg-stone-950/80 border border-stone-800 hover:border-stone-700 rounded-xl p-4 flex flex-col justify-between gap-4 transition-all shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          scenario.difficulty === 'Beginner' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          scenario.difficulty === 'Intermediate' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {scenario.difficulty}
                        </span>

                        <span className="text-[10px] text-stone-400 font-mono">
                          Climate: {scenario.climateZone === 'semi_arid' ? 'Semi-Arid Basin' : 'Temperate'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-stone-100 mt-2">
                        {scenario.title}
                      </h4>
                      <p className="text-xs text-emerald-400/90 font-medium">
                        {scenario.subtitle}
                      </p>

                      <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                        {scenario.briefing}
                      </p>

                      <div className="mt-3 p-2.5 rounded bg-stone-900 border border-stone-800 text-[11px] text-stone-400 space-y-1">
                        <div className="text-stone-300 font-semibold">Learning Target:</div>
                        <p>{scenario.learningGoal}</p>
                      </div>

                      <div className="mt-2 text-[10px] text-stone-500">
                        <strong>Real-World Parallel:</strong> {scenario.realWorldContext}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {scenario.sdgFocus.map((s, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-stone-900 text-stone-400 rounded border border-stone-800">
                            {s}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveScenarioConfirm(scenario)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Load Challenge</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scenario Confirmation Modal */}
              {activeScenarioConfirm && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
                  <div className="bg-stone-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
                    <div className="flex items-center gap-2.5 text-amber-400">
                      <Target className="w-5 h-5" />
                      <h3 className="text-sm font-bold text-stone-100">Load Scenario: {activeScenarioConfirm.title}?</h3>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Loading this challenge will replace your active farm plot with the initial conditions of 
                      <strong> "{activeScenarioConfirm.subtitle}"</strong>.
                    </p>
                    <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400">
                      <strong>Target Criteria:</strong>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside text-stone-300">
                        <li>Rebuild Soil Organic Matter to {activeScenarioConfirm.targetCriteria.somTarget}%+</li>
                        <li>Keep groundwater depth above {activeScenarioConfirm.targetCriteria.groundwaterMaxDepth}m</li>
                        <li>Cultivate at least {activeScenarioConfirm.targetCriteria.minEarthworms} earthworms per plot</li>
                        <li>Accumulate ${activeScenarioConfirm.targetCriteria.targetCash} in cash reserves</li>
                      </ul>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setActiveScenarioConfirm(null)}
                        className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleLaunchScenario(activeScenarioConfirm)}
                        className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        Yes, Start Challenge
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WHY FARMING MATTERS (THE REGENERATIVE MOVEMENT & URGE TO FARM) */}
          {currentTab === 'movement' && (
            <div className="space-y-6">
              {/* Inspirational Hero Manifesto */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-stone-950 to-stone-900 border border-emerald-500/40 p-6 shadow-xl">
                <div className="relative z-10 max-w-3xl space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Humanity's Most Essential Calling
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
                    Why Agriculture is the Greatest Lever for Global Regeneration
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    Every living person depends three times a day on the thin, fragile skin of topsoil that wraps our planet. 
                    Agriculture is not an outdated trade of hardship—it is the modern frontier where ecology, microbiology, 
                    climate mitigation, and food sovereignty intersect. Regenerative farming holds the unique power to cool the planet, 
                    recharge subterranean aquifers, revive collapsing pollinator populations, and nourish communities.
                  </p>
                </div>
              </div>

              {/* Regenerative Pioneers Gallery */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Pioneers Who Changed How Humanity Understands Agriculture
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AGRI_PIONEERS.map((pioneer, idx) => (
                    <div key={idx} className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-stone-100">{pioneer.name}</h4>
                            <span className="text-[10px] text-emerald-400 font-medium block">{pioneer.role}</span>
                          </div>
                          <span className="text-[10px] text-stone-500 font-mono">{pioneer.region}</span>
                        </div>
                        
                        <blockquote className="my-2.5 text-[11px] italic text-stone-300 border-l-2 border-emerald-500/50 pl-2 leading-snug">
                          "{pioneer.quote}"
                        </blockquote>

                        <p className="text-[11px] text-stone-400 leading-relaxed">
                          {pioneer.contribution}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concrete Citizen Actions: What You Can Do Today */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  How You Can Foster Sustainable Agriculture Right Now
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CITIZEN_AGRI_ACTIONS.map((action, idx) => (
                    <div key={idx} className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-2.5 shadow-md">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-stone-100">{action.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {action.timeCommitment}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        {action.description}
                      </p>
                      <div className="bg-stone-900 p-2.5 rounded-lg border border-stone-800 space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-stone-400 block">Action Steps:</span>
                        {action.stepByStep.map((step, sIdx) => (
                          <div key={sIdx} className="text-[11px] text-stone-300 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FIELD SCIENCE LEXICON */}
          {currentTab === 'lexicon' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                    Agronomic & Ecological Lexicon
                  </h3>
                  <p className="text-xs text-stone-400">
                    Key scientific vocabulary essential for modern sustainable farming and agro-ecosystem analysis.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lexiconQuery}
                    onChange={(e) => setLexiconQuery(e.target.value)}
                    placeholder="Search scientific terms..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredLexicon.map((item, idx) => (
                  <div key={idx} className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-2 shadow-md">
                    <div>
                      <h4 className="text-xs font-bold text-purple-300">{item.term}</h4>
                      <span className="text-[10px] text-stone-500 font-mono">{item.pronunciation}</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {item.definition}
                    </p>
                    <div className="pt-2 border-t border-stone-800/80 text-[11px] text-emerald-400/90 leading-snug">
                      <strong className="text-emerald-300">Why It Matters: </strong>
                      {item.whyItMatters}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-950 px-5 py-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1.5 text-stone-400">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            Empowering the next generation of agro-ecological stewards
          </span>

          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition-colors"
          >
            Return to Farm
          </button>
        </div>

      </div>
    </div>
  );
};
