import React, { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { ToolAction, ToolCategory } from '../simulation/types';
import { CROPS } from '../config/crops';
import { TRANSLATIONS } from '../config/translations';
import { 
  Sprout, 
  Droplet, 
  Sparkles, 
  ShieldAlert, 
  Wheat, 
  Flame, 
  Search, 
  Wrench, 
  Users, 
  CheckCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const ActionBar: React.FC = () => {
  const farm = useGameStore((state) => state.farm);
  const language = useGameStore((state) => state.language);
  const activeTool = useGameStore((state) => state.activeTool);
  const setActiveTool = useGameStore((state) => state.setActiveTool);
  const openModal = useGameStore((state) => state.openModal);
  const batchApplyTool = useGameStore((state) => state.batchApplyTool);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [activeCategory, setActiveCategory] = useState<ToolCategory>('plant');

  const selectCategory = (category: ToolCategory) => {
    setActiveCategory(category);
    // Set sensible default tool for category
    if (category === 'inspect') {
      setActiveTool({ type: 'inspect' });
    } else if (category === 'plant') {
      setActiveTool({ type: 'plant', cropId: 'wheat' });
    } else if (category === 'irrigate') {
      setActiveTool({ type: 'irrigate', method: 'flood' });
    } else if (category === 'fertilize') {
      setActiveTool({ type: 'fertilize', method: 'organic_compost' });
    } else if (category === 'pest_control') {
      setActiveTool({ type: 'pest_control', method: 'biocontrol' });
    } else if (category === 'residue') {
      setActiveTool({ type: 'residue', method: 'mulch' });
    } else if (category === 'harvest') {
      setActiveTool({ type: 'harvest' });
    }
  };

  // Calculate tool cost per tile and total batch cost
  const getToolCostPerTile = (): number => {
    if (activeTool.type === 'plant') {
      return CROPS[activeTool.cropId]?.seedCost || 0;
    } else if (activeTool.type === 'irrigate') {
      return activeTool.method === 'drip' ? 1.0 : 0.5;
    } else if (activeTool.type === 'fertilize') {
      return activeTool.method === 'synthetic_npk' ? 12.0 : 6.0;
    } else if (activeTool.type === 'pest_control') {
      return activeTool.method === 'chemical_spray' ? 16.0 : 7.0;
    } else if (activeTool.type === 'residue') {
      return activeTool.method === 'till' ? 3.0 : activeTool.method === 'mulch' ? 1.5 : 0;
    }
    return 0;
  };

  const costPerTile = getToolCostPerTile();
  const totalBatchCost = costPerTile * farm.tiles.length;

  const handleApplyToAll = () => {
    const allTileIds = farm.tiles.map(t => t.id);
    batchApplyTool(allTileIds);
  };

  return (
    <div className="w-full bg-stone-950/85 backdrop-blur-md border border-stone-800/90 rounded-xl p-3 shadow-xl flex flex-col gap-2.5">
      {/* Category Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-700">
        <button
          onClick={() => selectCategory('plant')}
          className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeCategory === 'plant' 
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/50' 
              : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:bg-stone-850 hover:text-stone-100'
          }`}
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-300" />
          <span>{t.plant}</span>
        </button>

        <button
          onClick={() => selectCategory('irrigate')}
          className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeCategory === 'irrigate' 
              ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-950/50' 
              : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:bg-stone-850 hover:text-stone-100'
          }`}
        >
          <Droplet className="w-3.5 h-3.5 text-sky-300" />
          <span>{t.irrigate}</span>
        </button>

        <button
          onClick={() => selectCategory('fertilize')}
          className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeCategory === 'fertilize' 
              ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/50' 
              : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:bg-stone-850 hover:text-stone-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{t.fertilize}</span>
        </button>

        <button
          onClick={() => selectCategory('pest_control')}
          className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeCategory === 'pest_control' 
              ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/50' 
              : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:bg-stone-850 hover:text-stone-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
          <span>{t.pestControl}</span>
        </button>

        <button
          onClick={() => selectCategory('residue')}
          className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeCategory === 'residue' 
              ? 'bg-orange-700 text-white border-orange-600 shadow-md shadow-orange-950/50' 
              : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:bg-stone-850 hover:text-stone-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-300" />
          <span>{t.residue}</span>
        </button>

        <button
          onClick={() => selectCategory('harvest')}
          className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeCategory === 'harvest' 
              ? 'bg-yellow-600 text-stone-950 border-yellow-500 font-bold shadow-md shadow-yellow-950/50' 
              : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:bg-stone-850 hover:text-stone-100'
          }`}
        >
          <Wheat className="w-3.5 h-3.5 text-yellow-300" />
          <span>{t.harvest}</span>
        </button>

        <button
          onClick={() => selectCategory('inspect')}
          className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeCategory === 'inspect' 
              ? 'bg-stone-700 text-white border-stone-500 shadow-md' 
              : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:bg-stone-850 hover:text-stone-100'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-stone-300" />
          <span>{t.inspect}</span>
        </button>

        <div className="h-5 w-[1px] bg-stone-800 mx-1 flex-shrink-0" />

        {/* Upgrades & Neighbors Buttons */}
        <button
          onClick={() => openModal('upgrades')}
          className="h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap bg-stone-900 hover:bg-stone-850 text-emerald-300 border border-emerald-500/40 hover:border-emerald-500/70 transition-all shadow-sm"
        >
          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.upgrades}</span>
        </button>

        <button
          onClick={() => openModal('neighbors')}
          className="h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap bg-stone-900 hover:bg-stone-850 text-amber-300 border border-amber-500/40 hover:border-amber-500/70 transition-all shadow-sm"
        >
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.neighbors}</span>
        </button>
      </div>

      {/* Submenu Palette Options */}
      <div className="bg-stone-900/70 border border-stone-800/90 rounded-lg p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {activeCategory === 'plant' && (
            <>
              {Object.values(CROPS)
                .filter(crop => !crop.isHeirloom || (farm.unlockedCrops && farm.unlockedCrops.includes(crop.id)))
                .map((crop) => {
                const isSelected = activeTool.type === 'plant' && activeTool.cropId === crop.id;
                return (
                  <button
                    key={crop.id}
                    onClick={() => setActiveTool({ type: 'plant', cropId: crop.id })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? crop.isHeirloom 
                          ? 'border-purple-500 bg-purple-950/70 text-purple-100 ring-1 ring-purple-500/70 shadow-sm'
                          : 'border-emerald-500 bg-emerald-950/70 text-emerald-100 ring-1 ring-emerald-500/70 shadow-sm'
                        : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>{crop.name}</span>
                        {crop.isHeirloom && (
                          <span className="text-[9px] bg-purple-900/90 text-purple-200 px-1.5 py-0.2 rounded font-bold border border-purple-500/40">
                            ★ Heirloom
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-800/50">
                          ${crop.seedCost}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                        <span>
                          {crop.isHeirloom 
                            ? `✨ ${crop.heirloomOrigin || 'Heritage'}` 
                            : crop.category === 'legume' 
                              ? '🌱 Fixes Nitrogen' 
                              : crop.category === 'cover' 
                                ? '🛡️ +16 SOM' 
                                : crop.category === 'trap' 
                                  ? '🐞 Repels Pests' 
                                  : '🌾 Grain Staple'}
                        </span>
                        <span className="text-stone-600">•</span>
                        <span className="text-stone-500 font-mono">
                          {crop.waterDemand <= 20 ? 'MIN H₂O' : crop.waterDemand <= 35 ? 'LOW H₂O' : 'HIGH H₂O'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Seed Swap prompt button */}
              <button
                onClick={() => openModal('neighbors')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-amber-500/50 hover:border-amber-400 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 transition-all text-xs"
                title="Swap heirloom seeds with regional farmers"
              >
                <Users className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="font-semibold">+ Heirloom Seed Swap</span>
              </button>
            </>
          )}

          {activeCategory === 'irrigate' && (
            <>
              <button
                onClick={() => setActiveTool({ type: 'irrigate', method: 'flood' })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  activeTool.type === 'irrigate' && activeTool.method === 'flood'
                    ? 'border-sky-500 bg-sky-950/70 text-sky-100 ring-1 ring-sky-500/70'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                }`}
              >
                <div className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                  <span>{t.floodIrrigation}</span>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-1 py-0.2 rounded border border-sky-800/50">$0.5/tile</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">High water volume, leaches nitrogen, severely depletes groundwater aquifer</div>
              </button>

              <button
                onClick={() => setActiveTool({ type: 'irrigate', method: 'drip' })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  activeTool.type === 'irrigate' && activeTool.method === 'drip'
                    ? 'border-sky-500 bg-sky-950/70 text-sky-100 ring-1 ring-sky-500/70'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                }`}
              >
                <div className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                  <span>{t.dripIrrigation}</span>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-1 py-0.2 rounded border border-sky-800/50">$1.0/tile</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Precision root tube delivery, 70% water savings, preserves deep aquifer table</div>
              </button>
            </>
          )}

          {activeCategory === 'fertilize' && (
            <>
              <button
                onClick={() => setActiveTool({ type: 'fertilize', method: 'organic_compost' })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  activeTool.type === 'fertilize' && activeTool.method === 'organic_compost'
                    ? 'border-amber-500 bg-amber-950/70 text-amber-100 ring-1 ring-amber-500/70 shadow-sm'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                }`}
              >
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <span>{t.organicCompost}</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-1 py-0.2 rounded border border-amber-800/50">$6.0/tile</span>
                  <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-800/40">+4.5 SOM</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Increases organic matter, feeds earthworms & microbial mycorrhizae, sustainable nutrition</div>
              </button>

              <button
                onClick={() => setActiveTool({ type: 'fertilize', method: 'synthetic_npk' })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  activeTool.type === 'fertilize' && activeTool.method === 'synthetic_npk'
                    ? 'border-amber-500 bg-amber-950/70 text-amber-100 ring-1 ring-amber-500/70 shadow-sm'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                }`}
              >
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <span>{t.syntheticNPK}</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-1 py-0.2 rounded border border-amber-800/50">$12.0/tile</span>
                  <span className="text-[9px] font-semibold text-rose-400 bg-rose-950/80 px-1 py-0.2 rounded border border-rose-800/40">Resets Organic</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">+45 Nitrogen boost, but burns humus, kills earthworms, and disqualifies organic certification</div>
              </button>
            </>
          )}

          {activeCategory === 'pest_control' && (
            <>
              <button
                onClick={() => setActiveTool({ type: 'pest_control', method: 'biocontrol' })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  activeTool.type === 'pest_control' && activeTool.method === 'biocontrol'
                    ? 'border-rose-500 bg-rose-950/70 text-rose-100 ring-1 ring-rose-500/70 shadow-sm'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                }`}
              >
                <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <span>{t.biocontrol}</span>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-1 py-0.2 rounded border border-rose-800/50">$7.0/tile</span>
                  <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-800/40">Bio Safe</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Botanical neem extracts and predatory ladybug releases; shields beneficial insect ecology</div>
              </button>

              <button
                onClick={() => setActiveTool({ type: 'pest_control', method: 'chemical_spray' })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  activeTool.type === 'pest_control' && activeTool.method === 'chemical_spray'
                    ? 'border-rose-500 bg-rose-950/70 text-rose-100 ring-1 ring-rose-500/70 shadow-sm'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                }`}
              >
                <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <span>{t.chemicalSpray}</span>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-1 py-0.2 rounded border border-rose-800/50">$16.0/tile</span>
                  <span className="text-[9px] font-semibold text-rose-400 bg-rose-950/80 px-1 py-0.2 rounded border border-rose-800/40">Broad Spectrum</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Instant 95% pest wipe, but annihilates beneficial predators triggering severe resurgence!</div>
              </button>
            </>
          )}

          {activeCategory === 'residue' && (
            <>
              <button
                onClick={() => setActiveTool({ type: 'residue', method: 'mulch' })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  activeTool.type === 'residue' && activeTool.method === 'mulch'
                    ? 'border-orange-500 bg-orange-950/70 text-orange-100 ring-1 ring-orange-500/70 shadow-sm'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                }`}
              >
                <div className="text-xs font-semibold text-orange-300 flex items-center gap-1.5">
                  <span>{t.mulchResidue}</span>
                  <span className="text-[10px] font-mono text-orange-400 bg-orange-950 px-1 py-0.2 rounded border border-orange-800/50">$1.5/tile</span>
                  <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-800/40">Soil Armor</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Retains moisture, moderates soil temperature, feeds earthworms, builds organic matter</div>
              </button>

              <button
                onClick={() => setActiveTool({ type: 'residue', method: 'till' })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  activeTool.type === 'residue' && activeTool.method === 'till'
                    ? 'border-orange-500 bg-orange-950/70 text-orange-100 ring-1 ring-orange-500/70 shadow-sm'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                }`}
              >
                <div className="text-xs font-semibold text-orange-300 flex items-center gap-1.5">
                  <span>{t.tillResidue}</span>
                  <span className="text-[10px] font-mono text-orange-400 bg-orange-950 px-1 py-0.2 rounded border border-orange-800/50">$3.0/tile</span>
                  <span className="text-[9px] font-semibold text-amber-400 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-800/40">Hardpan Risk</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Inverts soil seedbed, but accelerates organic carbon oxidation and builds plow-pan compaction</div>
              </button>

              <button
                onClick={() => setActiveTool({ type: 'residue', method: 'burn' })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  activeTool.type === 'residue' && activeTool.method === 'burn'
                    ? 'border-orange-500 bg-orange-950/70 text-orange-100 ring-1 ring-orange-500/70 shadow-sm'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                }`}
              >
                <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <span>{t.burnResidue}</span>
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-900 px-1 py-0.2 rounded border border-stone-800">$0 Free</span>
                  <span className="text-[9px] font-semibold text-rose-400 bg-rose-950/80 px-1 py-0.2 rounded border border-rose-800/40">Ecosystem Destruction</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Destroys soil organic matter (-4.5 SOM), vaporizes nitrogen gas, leaves sterile ash bed</div>
              </button>
            </>
          )}

          {activeCategory === 'harvest' && (
            <div className="text-xs text-yellow-300 py-1.5 px-2 bg-yellow-950/40 border border-yellow-800/50 rounded-lg flex items-center gap-2">
              <Wheat className="w-4 h-4 text-yellow-400" />
              <span>Click or drag across golden mature plots (Stage 3) to harvest yield and deliver directly to grain silo for cash.</span>
            </div>
          )}

          {activeCategory === 'inspect' && (
            <div className="text-xs text-stone-300 py-1.5 px-2 bg-stone-900/80 border border-stone-800 rounded-lg flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Click any plot on the 6×6 farm to run an in-depth agronomic diagnostic on soil microbiology, nitrogen, and crop roots.</span>
            </div>
          )}
        </div>

        {/* Batch apply to all tiles shortcut */}
        {activeCategory !== 'inspect' && (
          <button
            onClick={handleApplyToAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold transition-all border border-emerald-500/50 hover:border-emerald-400 shadow-md shadow-emerald-950/40 ml-auto"
            title={`Apply active tool across all 36 sectors (${totalBatchCost > 0 ? `$${totalBatchCost.toFixed(0)} total` : 'Free'})`}
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col text-left">
              <span>Apply to All Plots</span>
              <span className="text-[10px] text-emerald-400/90 font-mono font-normal">
                {totalBatchCost > 0 ? `36× plots • $${totalBatchCost.toFixed(0)}` : '36× plots • Free'}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
