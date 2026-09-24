import React from 'react';
import { useGameStore } from '../state/gameStore';
import { Droplets, Layers, ShieldAlert, Sparkles } from 'lucide-react';

export const WaterTableCrossSection: React.FC = () => {
  const farm = useGameStore((state) => state.farm);

  // Groundwater depth ranges from ~5m (lush) to 30m (critical drought)
  const depth = farm.groundwaterDepth;
  // Percentage for water line position (0m = top of aquifer zone, 30m = bottom)
  const waterLevelPct = Math.min(92, Math.max(16, (depth / 30) * 100));

  // Average SOM determines topsoil thickness
  const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / farm.tiles.length;
  const topsoilHeightPx = Math.max(10, Math.round((avgSOM / 100) * 26));

  // Average compaction determines hardpan thickness
  const avgCompaction = farm.tiles.reduce((acc, t) => acc + t.compaction, 0) / farm.tiles.length;
  const hardpanOpacity = (avgCompaction / 100) * 0.9;

  let aquiferStatus = 'Abundant Reserve';
  let aquiferBadgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
  let dotColor = 'bg-emerald-400';
  if (depth > 22) {
    aquiferStatus = 'Critical Depletion';
    aquiferBadgeClass = 'bg-rose-950/80 text-rose-300 border-rose-500/40';
    dotColor = 'bg-rose-400';
  } else if (depth > 16) {
    aquiferStatus = 'Aquifer Stressed';
    aquiferBadgeClass = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    dotColor = 'bg-amber-400';
  }

  return (
    <div className="w-full bg-stone-950/85 backdrop-blur-md border border-stone-800/90 rounded-xl p-3.5 shadow-xl select-none transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-stone-200">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Hydro-Geological Stratigraphy & Aquifer Horizon</span>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${aquiferBadgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
            {aquiferStatus}
          </span>
        </div>

        <div className="flex items-center gap-3 text-stone-400 font-mono text-[11px]">
          <div className="bg-stone-900/90 border border-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="text-stone-500 text-[10px] uppercase">Topsoil Humus:</span>
            <strong className="text-amber-200">{(avgSOM * 0.4).toFixed(1)} cm</strong>
          </div>
          <div className="bg-stone-900/90 border border-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="text-stone-500 text-[10px] uppercase">Water Table:</span>
            <strong className="text-sky-300">{depth.toFixed(1)} m</strong>
          </div>
        </div>
      </div>

      {/* Visual Geological Slice */}
      <div className="relative w-full h-20 bg-stone-950 rounded-lg overflow-hidden border border-stone-800 flex flex-col shadow-inner">
        {/* Layer 1: Living Topsoil (Organic Humus Sponge) */}
        <div 
          className="w-full transition-all duration-500 relative flex flex-col justify-end"
          style={{ 
            height: `${topsoilHeightPx}px`,
            backgroundColor: avgSOM > 50 ? '#27170b' : avgSOM > 30 ? '#422815' : '#6b482a'
          }}
          title={`Topsoil layer: ${avgSOM.toFixed(1)}% Organic Matter`}
        >
          {/* Surface plants / grass indicator fringe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 border-b border-emerald-700/50" />
          
          {/* Soil organic sponge indicator beads */}
          {avgSOM > 35 && (
            <div className="absolute bottom-0.5 left-24 flex items-center gap-3 opacity-60">
              <span className="text-[9px] text-amber-200/90 font-mono tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                Soil Organic Sponge Active ({avgSOM.toFixed(0)}% SOM)
              </span>
            </div>
          )}
        </div>

        {/* Layer 2: Subsoil & Hardpan */}
        <div className="relative flex-1 bg-stone-900/90 overflow-hidden">
          {/* Compaction Hardpan Band */}
          {avgCompaction > 30 && (
            <div 
              className="absolute top-1 left-0 right-0 h-2 bg-gradient-to-r from-stone-700 via-stone-600 to-stone-700 transition-opacity duration-300 border-y border-stone-500/40 flex items-center justify-center"
              style={{ opacity: hardpanOpacity }}
              title={`Plow-pan compaction barrier: ${avgCompaction.toFixed(0)}%`}
            >
              <span className="text-[8px] font-mono uppercase tracking-widest text-stone-300/70 select-none">
                Hardpan Compaction Barrier ({avgCompaction.toFixed(0)}%)
              </span>
            </div>
          )}

          {/* Geological strata stipple dots */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:10px_10px]" />

          {/* Borewell Extraction Tube */}
          <div className="absolute left-8 top-0 bottom-0 w-2 bg-gradient-to-r from-stone-400 to-stone-600 z-10 shadow-md">
            {/* Pump motor head on surface */}
            <div className="absolute -top-1.5 -left-1.5 w-5 h-3 bg-sky-600 rounded-sm border border-sky-400 flex items-center justify-center shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            {/* Water suction intake nozzle at water table */}
            <div 
              className="absolute w-3.5 h-3.5 bg-sky-400 rounded-full -left-0.5 border border-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse"
              style={{ top: `${waterLevelPct}%` }}
            />
          </div>

          {/* Depth Scale Ruler Ticks along Right Side */}
          <div className="absolute right-0 top-0 bottom-0 w-12 border-l border-stone-800 bg-stone-950/60 flex flex-col justify-between py-1 px-1 text-[9px] font-mono text-stone-500 pointer-events-none select-none">
            <div className="flex items-center justify-between">
              <span className="w-1.5 h-0.5 bg-stone-600" />
              <span>0m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-1.5 h-0.5 bg-stone-600" />
              <span>10m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-1.5 h-0.5 bg-stone-600" />
              <span>20m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-1.5 h-0.5 bg-stone-600" />
              <span>30m</span>
            </div>
          </div>

          {/* Water Table Horizon & Aquifer Body */}
          <div 
            className="absolute left-0 right-12 bottom-0 bg-sky-600/40 border-t-2 border-sky-400 transition-all duration-700 backdrop-blur-[1px]"
            style={{ top: `${waterLevelPct}%` }}
          >
            <div className="w-full h-full bg-gradient-to-b from-sky-500/25 via-sky-800/40 to-sky-950/90 relative overflow-hidden">
              {/* Shimmering surface ripple */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-75 animate-pulse" />
              
              <div className="absolute bottom-1 left-12 flex items-center gap-1.5 text-[10px] font-mono text-sky-200 font-semibold tracking-wider uppercase opacity-90">
                <Droplets className="w-3 h-3 text-sky-400 animate-bounce" />
                <span>Aquifer Water Table ({depth.toFixed(1)}m Depth)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Agro-Ecological Legend Footnote */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 mt-2 px-0.5 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 font-bold">Agro Insight:</span>
          <span>Flood irrigation severely drains groundwater; cover crop residues and mulch act as micro-reservoirs that recharge the water table.</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-300 font-mono text-[10px] bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-md">
          <span>Recharge Rate:</span>
          <strong className="text-emerald-400">{farm.unlockedUpgrades.farmPond ? '+150% (Farm Pond Active)' : 'Standard Basal'}</strong>
        </div>
      </div>
    </div>
  );
};
