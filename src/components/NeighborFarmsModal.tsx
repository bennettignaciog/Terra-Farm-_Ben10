import React, { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  X, 
  Users, 
  MessageSquare, 
  Sprout, 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Heart,
  Droplet,
  ShieldCheck,
  Award
} from 'lucide-react';
import { NEIGHBORS, NeighborProfile, NeighborDialogueTopic } from '../config/neighborDialogue';
import { CROPS } from '../config/crops';
import { sound } from '../audio/sound';

export const NeighborFarmsModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const farm = useGameStore((state) => state.farm);
  const neighborReputation = useGameStore((state) => state.neighborReputation);
  const performHeirloomSeedSwap = useGameStore((state) => state.performHeirloomSeedSwap);

  const [activeTab, setActiveTab] = useState<'dialogue' | 'seeds' | 'trajectory'>('dialogue');
  const [selectedNeighborId, setSelectedNeighborId] = useState<string>('priya');
  const [selectedDialogueId, setSelectedDialogueId] = useState<string | null>('priya_drought');

  if (activeModal !== 'neighbors') return null;

  const totalTiles = farm.tiles.length;
  const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / totalTiles;
  const avgBio = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / totalTiles;

  const currentNeighbor = NEIGHBORS.find(n => n.id === selectedNeighborId) || NEIGHBORS[0];
  const activeDialogue = currentNeighbor.dialogues.find(d => d.id === selectedDialogueId) || currentNeighbor.dialogues[0];

  const heirloomCrops = Object.values(CROPS).filter(c => c.isHeirloom);

  const handleSelectNeighbor = (neighbor: NeighborProfile) => {
    setSelectedNeighborId(neighbor.id);
    setSelectedDialogueId(neighbor.dialogues[0]?.id || null);
    sound.playSeedSwap();
  };

  const handleSelectDialogue = (dialogue: NeighborDialogueTopic) => {
    setSelectedDialogueId(dialogue.id);
    sound.playLootPop();
  };

  const handleSwapSeed = (cropId: string, costPoints: number) => {
    performHeirloomSeedSwap(currentNeighbor.id, cropId, costPoints);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <span>Regional Agricultural Cooperative</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-800/60">
                  {farm.ecoPoints} EcoPoints Available
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Interactive Neighbor Dialogues, Ecological Wisdom & Heirloom Seed Swaps
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-stone-800 bg-stone-950/40 text-xs">
          <button
            onClick={() => setActiveTab('dialogue')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-semibold border-b-2 transition-all ${
              activeTab === 'dialogue'
                ? 'border-amber-400 text-amber-300 bg-stone-900/80 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Interactive Neighbor Dialogue</span>
          </button>

          <button
            onClick={() => setActiveTab('seeds')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-semibold border-b-2 transition-all ${
              activeTab === 'seeds'
                ? 'border-purple-400 text-purple-300 bg-stone-900/80 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Heirloom Seed Swaps</span>
            <span className="bg-purple-900/80 text-purple-200 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
              {heirloomCrops.length} Rare Varieties
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trajectory')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-semibold border-b-2 transition-all ${
              activeTab === 'trajectory'
                ? 'border-emerald-400 text-emerald-300 bg-stone-900/80 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>5-Year Regional Trajectories</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: INTERACTIVE NEIGHBOR DIALOGUE */}
          {activeTab === 'dialogue' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
              {/* Left Column: Neighbor Selection List */}
              <div className="md:col-span-4 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1 flex items-center justify-between">
                  <span>Community Members</span>
                  <span className="text-[10px] text-stone-500 font-mono">Select to Converse</span>
                </div>

                {NEIGHBORS.map((neighbor) => {
                  const isSelected = neighbor.id === selectedNeighborId;
                  const trust = neighborReputation[neighbor.id] || 20;

                  return (
                    <button
                      key={neighbor.id}
                      onClick={() => handleSelectNeighbor(neighbor)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-stone-850 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                          : 'bg-stone-950/70 border-stone-800 hover:bg-stone-900 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                          {neighbor.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-stone-100 flex items-center justify-between">
                            <span className="truncate">{neighbor.name}</span>
                            <span className="text-[10px] text-amber-400 font-mono font-semibold flex items-center gap-0.5">
                              <Heart className="w-2.5 h-2.5 fill-amber-400" />
                              {trust}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-400 truncate mt-0.5">
                            {neighbor.role}
                          </div>
                          <div className="text-[9px] text-stone-500 truncate mt-0.5 font-mono">
                            {neighbor.farmType}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div className="p-3 rounded-xl bg-stone-950/90 border border-stone-800 text-[11px] text-stone-400 space-y-1.5">
                  <div className="font-bold text-stone-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Peer-to-Peer Learning</span>
                  </div>
                  <p className="leading-relaxed text-[10px]">
                    Conversing with neighbors shares regional agronomic insights, warns of climate vulnerabilities, and unlocks trusted seed swaps.
                  </p>
                </div>
              </div>

              {/* Right Column: Active Dialogue & Character Bio */}
              <div className="md:col-span-8 flex flex-col gap-4">
                {/* Neighbor Bio Banner */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{currentNeighbor.avatar}</span>
                    <div>
                      <div className="text-sm font-bold text-stone-100 flex items-center gap-2">
                        <span>{currentNeighbor.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-stone-900 border border-stone-700 text-stone-300">
                          {currentNeighbor.role}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                        {currentNeighbor.bio}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono bg-amber-950/40 text-amber-300 border border-amber-800/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Heart className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Trust Level: {neighborReputation[currentNeighbor.id] || 20}</span>
                  </div>
                </div>

                {/* Neighbor Philosophy Quote */}
                <div className="px-3.5 py-2 rounded-lg bg-stone-850/60 border-l-2 border-amber-500 text-stone-300 text-xs italic">
                  {currentNeighbor.philosophy}
                </div>

                {/* Dialogue Topic Selector Pills */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                    Inquire or Discuss Topic:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentNeighbor.dialogues.map((topic) => {
                      const isSelected = topic.id === selectedDialogueId;
                      return (
                        <button
                          key={topic.id}
                          onClick={() => handleSelectDialogue(topic)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            isSelected
                              ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md font-bold'
                              : 'bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-850 hover:border-stone-700'
                          }`}
                        >
                          <span>{topic.icon}</span>
                          <span>{topic.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conversation Interaction Cards */}
                {activeDialogue && (
                  <div className="space-y-3 mt-1">
                    {/* Player Prompt Bubble */}
                    <div className="flex items-start gap-2.5 justify-end">
                      <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-xs text-emerald-100 shadow-md">
                        <div className="text-[10px] font-bold text-emerald-400 mb-1 flex items-center gap-1 justify-end">
                          <span>You (TerraFarm Pioneer)</span>
                          <span>🧑‍🌾</span>
                        </div>
                        <p className="leading-relaxed">{activeDialogue.playerPrompt}</p>
                      </div>
                    </div>

                    {/* Neighbor Response Bubble */}
                    <div className="flex items-start gap-2.5 justify-start">
                      <div className="bg-stone-950 border border-stone-800 rounded-2xl rounded-tl-sm p-3.5 max-w-[90%] text-xs text-stone-200 shadow-lg space-y-2">
                        <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1.5">
                          <span>{currentNeighbor.avatar}</span>
                          <span>{currentNeighbor.name}</span>
                        </div>
                        <p className="leading-relaxed text-stone-300">
                          {activeDialogue.response}
                        </p>

                        {/* Agronomic Insight Callout Box */}
                        <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-700/70 text-[11px] text-stone-300 space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>Scientific Agronomic Principle:</span>
                          </div>
                          <p className="text-stone-300 leading-normal">
                            {activeDialogue.agronomicInsight}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HEIRLOOM SEED SWAPS */}
          {activeTab === 'seeds' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xl">
                    🌾
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-purple-100 flex items-center gap-2">
                      <span>Community Heirloom Seed Vault</span>
                      <span className="text-[10px] bg-purple-900/80 text-purple-200 font-mono px-2 py-0.5 rounded-full border border-purple-500/40">
                        {farm.unlockedCrops?.filter(id => CROPS[id]?.isHeirloom).length || 0} / {heirloomCrops.length} Unlocked
                      </span>
                    </h3>
                    <p className="text-xs text-purple-300/80">
                      Swap agricultural EcoPoints to acquire rare, ancient, drought-hardy landraces bred by generational farmers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono bg-stone-950 px-3 py-1.5 rounded-lg border border-purple-500/40">
                  <span className="text-stone-400">Balance:</span>
                  <span className="text-emerald-400 font-bold">{farm.ecoPoints} EcoPoints</span>
                </div>
              </div>

              {/* Seed Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heirloomCrops.map((crop) => {
                  const isUnlocked = farm.unlockedCrops?.includes(crop.id);
                  const swapCost = 80;
                  const canAfford = farm.ecoPoints >= swapCost;

                  return (
                    <div 
                      key={crop.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        isUnlocked
                          ? 'bg-stone-950/90 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-stone-800/80 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-stone-100">{crop.name}</h4>
                              <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-800 font-bold">
                                Heirloom
                              </span>
                            </div>
                            <span className="text-[10px] text-amber-400 font-mono mt-0.5 block">
                              📍 {crop.heirloomOrigin || 'Ancestral Landrace'}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              ${crop.organicPremiumPrice}/kg
                            </span>
                            <span className="block text-[9px] text-stone-500 font-mono">Organic Premium</span>
                          </div>
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed">
                          {crop.description}
                        </p>

                        {/* Ecological Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                          <div>
                            <span className="text-stone-500 block">Drought Tolerance</span>
                            <span className="text-sky-300 font-bold">{crop.droughtTolerance}%</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">Water Need</span>
                            <span className="text-emerald-300 font-bold">{crop.waterDemand}/100</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">SOM Addition</span>
                            <span className="text-amber-300 font-bold">+{crop.organicMatterContribution} SOM</span>
                          </div>
                        </div>

                        {/* Agronomic Superpowers */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                            Unique Genetic Advantages:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {crop.benefits.map((b, idx) => (
                              <span 
                                key={idx} 
                                className="text-[10px] bg-stone-900 text-stone-300 px-2 py-0.5 rounded border border-stone-800"
                              >
                                ✓ {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                        {isUnlocked ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>In Seed Bank (Available to Plant)</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-mono text-stone-400">
                              Swap Cost: <strong className="text-amber-400">{swapCost} EcoPoints</strong>
                            </span>
                            <button
                              onClick={() => handleSwapSeed(crop.id, swapCost)}
                              disabled={!canAfford}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                                canAfford
                                  ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                              }`}
                            >
                              <Sprout className="w-3.5 h-3.5" />
                              <span>{canAfford ? 'Swap & Acquire Seeds' : 'Need More EcoPoints'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 5-YEAR REGIONAL TRAJECTORIES */}
          {activeTab === 'trajectory' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                Compare your current agricultural trajectory against Suresh&apos;s chemical monoculture and Priya&apos;s regenerative permaculture over 3 to 5 years.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Suresh */}
                <div className="bg-stone-950 border border-rose-900/40 rounded-xl p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px] border-b border-stone-800 pb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Suresh (Conventional)</span>
                    </div>
                    <p className="text-stone-400 leading-relaxed text-[11px]">
                      High synthetic NPK, chemical sprays, deep subsoil plowing, and continuous flood irrigation.
                    </p>

                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Year 1:</span>
                        <span className="text-emerald-400 font-bold">Record Yields ($$$)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Year 3:</span>
                        <span className="text-rose-400 font-bold">Hardpan & Pest Resistance</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Soil Organic Matter:</span>
                        <span className="text-stone-300 font-bold">14% (Degraded Dust)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Water Table:</span>
                        <span className="text-rose-400 font-bold">25.8m (Pump Straining)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Input Chemical Debt:</span>
                        <span className="text-rose-400 font-bold">-$4,200</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-2.5 rounded bg-rose-950/30 border border-rose-500/20 text-[10px] text-rose-300">
                    ⚠️ By Year 3, soil biology collapsed, beneficial insects disappeared, and input costs exceeded revenue.
                  </div>
                </div>

                {/* Player Farm */}
                <div className="bg-stone-950 border-2 border-emerald-500/50 rounded-xl p-4 flex flex-col justify-between relative shadow-lg">
                  <div className="absolute -top-2.5 right-3 bg-emerald-600 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-full shadow">
                    Your Farm (Y{farm.year})
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px] border-b border-stone-800 pb-2">
                      <span>TerraFarm (You)</span>
                    </div>
                    <p className="text-stone-300 leading-relaxed text-[11px]">
                      Your managed 6×6 agro-ecological parcel.
                    </p>

                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Cash Balance:</span>
                        <span className="text-emerald-400 font-bold">${farm.cashBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Soil Organic Matter:</span>
                        <span className="text-amber-300 font-bold">{avgSOM.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Water Table Depth:</span>
                        <span className="text-sky-300 font-bold">{farm.groundwaterDepth.toFixed(1)}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Biodiversity Index:</span>
                        <span className="text-purple-300 font-bold">{avgBio.toFixed(0)}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Organic Status:</span>
                        <span className="text-emerald-300 font-bold">
                          {farm.hasOrganicCertification ? 'Certified (+50%)' : `${farm.consecutiveChemicalFreeSeasons}/3 Seasons`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-2.5 rounded bg-emerald-950/30 border border-emerald-500/20 text-[10px] text-emerald-300">
                    🌱 Your biological management dictates whether you compound fertility or fall into the chemical trap.
                  </div>
                </div>

                {/* Priya */}
                <div className="bg-stone-950 border border-emerald-800/40 rounded-xl p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px] border-b border-stone-800 pb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Priya (Regenerative)</span>
                    </div>
                    <p className="text-stone-400 leading-relaxed text-[11px]">
                      Multi-species cover crops, living mulch, agroforestry borders, and zero synthetic chemical inputs.
                    </p>

                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Year 1:</span>
                        <span className="text-stone-300 font-bold">Modest Harvest (Building SOM)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Year 3+:</span>
                        <span className="text-emerald-400 font-bold">Stable High-Margin Produce</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Soil Organic Matter:</span>
                        <span className="text-amber-300 font-bold">72% (Spongy Humus)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Water Table:</span>
                        <span className="text-sky-300 font-bold">11.2m (Recharging)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Chemical Input Costs:</span>
                        <span className="text-emerald-400 font-bold">$0 / season</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-2.5 rounded bg-emerald-950/30 border border-emerald-500/20 text-[10px] text-emerald-300">
                    ✨ In Year 4+, Priya’s soil effortlessly absorbs droughts. Her organic premium contracts yield 50% above spot prices.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
