import React from 'react';
import { useGameStore } from '../state/gameStore';
import { CROPS } from '../config/crops';
import { TRANSLATIONS } from '../config/translations';
import { CLIMATE_ZONES } from '../config/climates';
import { 
  X, 
  Sprout, 
  Droplets, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Bug, 
  Heart,
  History,
  ShieldAlert,
  BookOpen,
  Compass,
  Leaf,
  Globe
} from 'lucide-react';

export const TileInspector: React.FC = () => {
  const farm = useGameStore((state) => state.farm);
  const activeClimateZone = useGameStore((state) => state.activeClimateZone);
  const selectedTileId = useGameStore((state) => state.selectedTileId);
  const setSelectedTileId = useGameStore((state) => state.setSelectedTileId);
  const applyCurrentTool = useGameStore((state) => state.applyCurrentTool);
  const setActiveTool = useGameStore((state) => state.setActiveTool);
  const openModal = useGameStore((state) => state.openModal);
  const language = useGameStore((state) => state.language);
  const soilXRayMode = useGameStore((state) => state.soilXRayMode);
  const toggleSoilXRayMode = useGameStore((state) => state.toggleSoilXRayMode);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const currentZone = CLIMATE_ZONES[activeClimateZone] || CLIMATE_ZONES.arid;

  if (!selectedTileId) return null;

  const tile = farm.tiles.find((t) => t.id === selectedTileId);
  if (!tile) return null;

  const cropDef = tile.crop ? CROPS[tile.crop.typeId] : null;

  // Check monocrop status
  let monocropCount = 0;
  if (tile.crop) {
    for (let i = tile.consecutiveCrops.length - 1; i >= 0; i--) {
      if (tile.consecutiveCrops[i] === tile.crop.typeId) monocropCount++;
      else break;
    }
  }

  const renderMeter = (label: string, value: number, colorClass: string, unit: string = '%') => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-stone-400 font-medium">{label}</span>
        <span className="font-mono font-semibold text-stone-200">{value.toFixed(1)}{unit}</span>
      </div>
      <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-stone-900 border-l border-stone-800 shadow-2xl p-5 overflow-y-auto flex flex-col gap-4 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-stone-100">
            Tile Diagnostics ({tile.x + 1}, {tile.y + 1})
          </h2>
        </div>
        <button
          onClick={() => setSelectedTileId(null)}
          className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Crop Card */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sprout className="w-4 h-4" />
            {cropDef ? cropDef.name : 'Unplanted Plot'}
          </span>
          {tile.crop && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
              Stage {tile.crop.growthStage}/3 {tile.crop.growthStage === 3 ? '(Mature)' : `(${tile.crop.daysPlanted}d)`}
            </span>
          )}
        </div>

        {tile.crop && cropDef ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-900/90 p-2 rounded border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Crop Health</span>
                <span className={`font-bold font-mono text-sm ${tile.crop.health > 70 ? 'text-emerald-400' : tile.crop.health > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {tile.crop.health.toFixed(0)}%
                </span>
              </div>
              <div className="bg-stone-900/90 p-2 rounded border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Expected Yield</span>
                <span className="font-bold font-mono text-sm text-yellow-300">
                  {tile.crop.expectedYield} kg
                </span>
              </div>
            </div>

            {/* Monocropping Warning */}
            {monocropCount >= 2 && (
              <div className="p-2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Monoculture Strain ({monocropCount} consecutive seasons):</strong>
                  <p className="text-[11px] text-amber-300/90 mt-0.5">
                    Yield reduced by {monocropCount >= 3 ? '45%' : '18%'}. Rotate with legumes or cover crops to break pest cycles.
                  </p>
                </div>
              </div>
            )}

            {/* Environmental Stress Factors */}
            {(tile.crop.stressFactors.drought > 20 || tile.crop.stressFactors.pest > 20 || tile.crop.stressFactors.nutrientDeficiency > 20) && (
              <div className="text-[11px] space-y-1 bg-stone-900 p-2 rounded border border-stone-800">
                <span className="font-semibold text-rose-400 block">Stress Factors:</span>
                {tile.crop.stressFactors.drought > 20 && (
                  <div className="text-stone-300 flex justify-between">
                    <span>Drought Stress:</span>
                    <span className="font-mono text-rose-400">+{tile.crop.stressFactors.drought}%</span>
                  </div>
                )}
                {tile.crop.stressFactors.pest > 20 && (
                  <div className="text-stone-300 flex justify-between">
                    <span>Pest Infestation:</span>
                    <span className="font-mono text-rose-400">+{tile.crop.stressFactors.pest}%</span>
                  </div>
                )}
                {tile.crop.stressFactors.nutrientDeficiency > 20 && (
                  <div className="text-stone-300 flex justify-between">
                    <span>Nitrogen Depletion:</span>
                    <span className="font-mono text-rose-400">+{tile.crop.stressFactors.nutrientDeficiency}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-stone-400 py-2">
            Soil is resting. Cover residue: <strong className="text-amber-300 capitalize">{tile.residue}</strong>
          </div>
        )}
      </div>

      {/* Soil Physics & Chemistry */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Soil Biogeochemistry
        </h3>

        {renderMeter(t.organicMatter, tile.soilOrganicMatter, 'bg-amber-600')}
        {renderMeter(t.nitrogen, tile.nitrogen, 'bg-emerald-500')}
        {renderMeter(t.moisture, tile.moisture, 'bg-sky-500')}
        {renderMeter(t.compaction, tile.compaction, 'bg-stone-500')}
        {renderMeter(t.salinity, tile.salinity, 'bg-rose-500')}

        {/* Climate Evaporation & Armor Insight */}
        <div className="pt-2 border-t border-stone-800 text-[11px] space-y-1.5 text-stone-300">
          <div className="flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-400" />
              Climate Evap Multiplier:
            </span>
            <button
              onClick={() => openModal('climate')}
              className="font-mono font-bold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1"
              title="Click to open Climate Scenario Selector"
            >
              <span>{currentZone.icon} {currentZone.evaporationMultiplier.toFixed(2)}×</span>
              <span className="text-[9px] text-stone-400 font-normal">({currentZone.regionCategory})</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-stone-400">Surface Armor:</span>
            <span className={`font-semibold ${
              tile.residue === 'mulch' 
                ? 'text-emerald-400' 
                : tile.crop?.typeId === 'cover_crop'
                ? 'text-emerald-400'
                : tile.residue === 'stubble' 
                ? 'text-amber-400' 
                : 'text-rose-400'
            }`}>
              {tile.residue === 'mulch' 
                ? 'Mulched (-62% Evap)' 
                : tile.crop?.typeId === 'cover_crop'
                ? 'Cover Crop (-55% Evap)'
                : tile.residue === 'stubble'
                ? 'Stubble (-25% Evap)'
                : 'Unprotected (High Vapor Loss)'}
            </span>
          </div>
        </div>
      </div>

      {/* Biological Food Web */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <Bug className="w-4 h-4" />
          Soil & Canopy Biology
        </h3>

        {renderMeter(t.earthworms, tile.earthwormPopulation, 'bg-pink-500')}
        {renderMeter(t.beneficials, tile.beneficialInsects, 'bg-purple-500')}
        {renderMeter(t.pests, tile.pestPressure, 'bg-red-500')}
      </div>

      {/* Subterranean Fungi & Root Diagnostics */}
      <div className="bg-stone-950/80 border border-purple-800/40 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-400" />
            Subterranean X-Ray Biology
          </h3>
          <button
            onClick={toggleSoilXRayMode}
            className="text-[10px] bg-purple-950 text-purple-300 hover:text-white px-2 py-0.5 rounded border border-purple-700/60 font-semibold"
          >
            {soilXRayMode ? 'View Surface' : 'View Soil X-Ray'}
          </button>
        </div>

        {renderMeter('Mycorrhizal Fungal Density', Math.min(100, tile.soilOrganicMatter * 1.15), 'bg-emerald-400')}
        {renderMeter('Subsoil Hardpan Compaction', tile.compaction, tile.compaction > 45 ? 'bg-rose-500' : 'bg-amber-500')}
        
        <div className="text-[10px] text-stone-400 space-y-1 font-mono pt-1 border-t border-stone-800/80">
          <div className="flex justify-between">
            <span>Root Architecture:</span>
            <span className="text-stone-200 font-bold">
              {cropDef?.category === 'legume' ? 'Taproot + Rhizobia Nodules' : 
               tile.crop?.typeId === 'sunflower' || tile.crop?.typeId === 'heirloom_blue_corn' ? 'Deep Subsoil Taproot' : 
               tile.crop ? 'Fibrous Topsoil Mesh' : 'Fallow Subsoil'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Mycelial Nutrient Flow:</span>
            <span className={tile.soilOrganicMatter > 35 ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
              {tile.soilOrganicMatter > 35 ? 'Active Mycorrhizal Transport' : 'Fragmented / Dormant'}
            </span>
          </div>
        </div>
      </div>

      {/* Historical Crop Rotation History */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5 mb-2">
          <History className="w-4 h-4" />
          Plot Rotation History
        </h3>
        {tile.consecutiveCrops.length === 0 ? (
          <span className="text-xs text-stone-500 italic">No previous crops recorded</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tile.consecutiveCrops.slice(-6).map((c, i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 capitalize">
                {c.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Agronomic Science Diagnostics & Learning Insight */}
      <div className="bg-gradient-to-br from-emerald-950/50 to-stone-950 border border-emerald-500/30 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-400" />
            Agronomic Field Diagnosis
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('eco_impact')}
              className="text-[10px] text-emerald-400 hover:text-emerald-200 underline font-semibold flex items-center gap-1"
              title="Open Ecological Impact Dashboard"
            >
              <Leaf className="w-3 h-3" />
              Eco Dashboard
            </button>
            <span className="text-stone-600 text-xs">|</span>
            <button
              onClick={() => openModal('academy')}
              className="text-[10px] text-emerald-400 hover:text-emerald-200 underline font-semibold flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              Academy
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-[11px] text-stone-300 leading-snug">
          {tile.soilOrganicMatter < 22 && (
            <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-amber-200">
              <strong className="text-amber-300 block mb-0.5">⚠️ Organic Matter Low ({tile.soilOrganicMatter.toFixed(0)}%):</strong>
              Soil sponge is depleted. Topsoil will bake hard under sun. Apply compost, mulch residue, or seed deep-rooting cover crops.
            </div>
          )}

          {tile.nitrogen < 25 && (
            <div className="p-2 rounded bg-sky-950/40 border border-sky-500/30 text-sky-200">
              <strong className="text-sky-300 block mb-0.5">🌱 Nitrogen Deficit ({tile.nitrogen.toFixed(0)}%):</strong>
              Root food is low. Plant legumes (Chickpea/Soybean) next season to fix natural atmospheric nitrogen for free.
            </div>
          )}

          {tile.compaction > 50 && (
            <div className="p-2 rounded bg-stone-900 border border-stone-700 text-stone-300">
              <strong className="text-stone-200 block mb-0.5">🚜 Hardpan Compaction ({tile.compaction.toFixed(0)}%):</strong>
              Roots struggle to penetrate deep subsoil. Inoculate earthworms and avoid repeated heavy mechanical tillage.
            </div>
          )}

          {monocropCount >= 2 && (
            <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-200">
              <strong className="text-rose-300 block mb-0.5">⚠️ Monoculture Trap ({monocropCount} consecutive seasons):</strong>
              Repeated planting of the same crop depletes specific nutrient bands and invites specialized pests.
            </div>
          )}

          {tile.soilOrganicMatter >= 40 && tile.earthwormPopulation >= 30 && (
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
              <strong className="text-emerald-300 block mb-0.5">🌟 Thriving Biological Soil:</strong>
              Rich humus sponge and dense earthworm tunnels naturally aerate root zones and store moisture against drought.
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Button */}
      {tile.crop && tile.crop.growthStage === 3 && (
        <button
          onClick={() => {
            setActiveTool({ type: 'harvest' });
            applyCurrentTool(tile.id);
          }}
          className="w-full py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <Sprout className="w-4 h-4" />
          <span>Harvest Crop Now</span>
        </button>
      )}
    </div>
  );
};
