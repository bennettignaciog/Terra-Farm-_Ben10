import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../state/gameStore';
import { Droplets, Layers, Sparkles, ArrowUpRight, ArrowDownRight, CloudRain, Waves } from 'lucide-react';

interface WaterTrend {
  type: 'rise' | 'fall';
  delta: number;
  label: string;
}

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

  // Track environmental factors
  const isRaining = farm.rainfallToday > 0 || farm.currentWeather === 'rain' || farm.currentWeather === 'unseasonal_rain';
  const hasFarmPond = !!farm.unlockedUpgrades?.farmPond;

  // Water table rise/fall trend detector
  const [activeTrend, setActiveTrend] = useState<WaterTrend | null>(null);
  const prevDepthRef = useRef<number>(depth);
  const prevPumpingCostRef = useRef<number>(farm.seasonInputCosts.waterPumping);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const prevDepth = prevDepthRef.current;
    const diff = depth - prevDepth; // negative = rise (shallower depth), positive = fall (deeper depth)
    const pumpingIncreased = farm.seasonInputCosts.waterPumping > prevPumpingCostRef.current;

    if (Math.abs(diff) >= 0.005) {
      let label = '';
      if (diff < 0) {
        // Water table has risen
        if (farm.rainfallToday > 0) {
          label = hasFarmPond ? 'Rain & Pond Recharge' : 'Rainfall Infiltration';
        } else if (hasFarmPond) {
          label = 'Farm Pond Infiltration';
        } else {
          label = 'Aquifer Natural Recharge';
        }

        setActiveTrend({
          type: 'rise',
          delta: Math.abs(diff),
          label
        });
      } else {
        // Water table has fallen
        if (pumpingIncreased) {
          label = 'Borewell Irrigation Drawdown';
        } else if (farm.activeWeatherEvent?.type === 'drought') {
          label = 'Drought Subsoil Evaporation';
        } else {
          label = 'Aquifer Extraction Drawdown';
        }

        setActiveTrend({
          type: 'fall',
          delta: diff,
          label
        });
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setActiveTrend(null);
      }, 4200);
    }

    prevDepthRef.current = depth;
    prevPumpingCostRef.current = farm.seasonInputCosts.waterPumping;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [depth, farm.rainfallToday, farm.seasonInputCosts.waterPumping, farm.activeWeatherEvent, hasFarmPond]);

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
      {/* Stratigraphy & Hydrological Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-stone-200">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Hydro-Geological Stratigraphy & Aquifer Horizon</span>
          </div>

          {/* Aquifer Status Badge */}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${aquiferBadgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
            {aquiferStatus}
          </span>

          {/* Dynamic Environmental Transition Badge */}
          <AnimatePresence mode="wait">
            {activeTrend && (
              <motion.span
                key={activeTrend.type + activeTrend.label}
                initial={{ opacity: 0, scale: 0.9, y: -2 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 2 }}
                transition={{ duration: 0.25 }}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${
                  activeTrend.type === 'rise'
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-emerald-950/50'
                    : 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-amber-950/50'
                }`}
              >
                {activeTrend.type === 'rise' ? (
                  <>
                    <ArrowUpRight className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>+{activeTrend.delta.toFixed(2)}m</span>
                    <span className="text-emerald-400/80 font-normal">({activeTrend.label})</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>-{activeTrend.delta.toFixed(2)}m</span>
                    <span className="text-amber-400/80 font-normal">({activeTrend.label})</span>
                  </>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Real-time Depth & Topsoil Measurements */}
        <div className="flex items-center gap-2.5 text-stone-400 font-mono text-[11px]">
          {isRaining && (
            <div className="bg-sky-950/60 border border-sky-800/60 text-sky-300 px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] animate-pulse">
              <CloudRain className="w-3 h-3 text-sky-400" />
              <span>{farm.rainfallToday}mm Rain</span>
            </div>
          )}

          <div className="bg-stone-900/90 border border-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="text-stone-500 text-[10px] uppercase">Topsoil Humus:</span>
            <strong className="text-amber-200">{(avgSOM * 0.4).toFixed(1)} cm</strong>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="text-stone-500 text-[10px] uppercase">Water Table:</span>
            <strong className="text-sky-300 flex items-center gap-1">
              {depth.toFixed(1)} m
              {activeTrend?.type === 'rise' && <ArrowUpRight className="w-3 h-3 text-emerald-400 inline" />}
              {activeTrend?.type === 'fall' && <ArrowDownRight className="w-3 h-3 text-amber-400 inline" />}
            </strong>
          </div>
        </div>
      </div>

      {/* Visual Geological Slice */}
      <div className="relative w-full h-24 bg-stone-950 rounded-lg overflow-hidden border border-stone-800 flex flex-col shadow-inner">
        {/* Layer 1: Living Topsoil (Organic Humus Sponge) */}
        <motion.div 
          className="w-full relative flex flex-col justify-end transition-colors duration-700 z-10"
          initial={false}
          animate={{ 
            height: `${topsoilHeightPx}px`,
            backgroundColor: avgSOM > 50 ? '#27170b' : avgSOM > 30 ? '#422815' : '#6b482a'
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          title={`Topsoil layer: ${avgSOM.toFixed(1)}% Organic Matter`}
        >
          {/* Surface plants / grass indicator fringe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 border-b border-emerald-700/50" />
          
          {/* Active rain droplets on soil surface */}
          {isRaining && (
            <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden pointer-events-none flex justify-around opacity-75">
              <span className="w-1 h-1 rounded-full bg-sky-300 animate-ping" />
              <span className="w-1 h-1 rounded-full bg-sky-200 animate-ping delay-100" />
              <span className="w-1 h-1 rounded-full bg-sky-300 animate-ping delay-200" />
            </div>
          )}

          {/* Soil organic sponge indicator beads */}
          {avgSOM > 35 && (
            <div className="absolute bottom-0.5 left-24 flex items-center gap-3 opacity-60">
              <span className="text-[9px] text-amber-200/90 font-mono tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                Soil Organic Sponge Active ({avgSOM.toFixed(0)}% SOM)
              </span>
            </div>
          )}
        </motion.div>

        {/* Layer 2: Subsoil, Stratigraphy, Hardpan & Aquifer Zone */}
        <div className="relative flex-1 bg-stone-900/90 overflow-hidden">
          {/* Compaction Hardpan Band */}
          {avgCompaction > 30 && (
            <div 
              className="absolute top-1 left-0 right-0 h-2 bg-gradient-to-r from-stone-700 via-stone-600 to-stone-700 transition-opacity duration-300 border-y border-stone-500/40 flex items-center justify-center z-10"
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

          {/* Downward Rainfall Percolation Seepage Trails (when raining or moist recharge active) */}
          {isRaining && (
            <div className="absolute inset-x-14 top-0 bottom-0 pointer-events-none z-10 flex justify-around opacity-60">
              <div className="flex flex-col items-center">
                <span className="w-0.5 h-2 rounded bg-sky-400/80 animate-percolate-fast" />
              </div>
              <div className="flex flex-col items-center">
                <span className="w-0.5 h-2 rounded bg-sky-300/70 animate-percolate-med" />
              </div>
              <div className="flex flex-col items-center">
                <span className="w-0.5 h-2 rounded bg-sky-400/80 animate-percolate-slow" />
              </div>
              <div className="flex flex-col items-center">
                <span className="w-0.5 h-2 rounded bg-sky-300/70 animate-percolate-med" />
              </div>
              <div className="flex flex-col items-center">
                <span className="w-0.5 h-2 rounded bg-sky-400/80 animate-percolate-fast" />
              </div>
            </div>
          )}

          {/* Borewell Extraction Tube */}
          <div className="absolute left-8 top-0 bottom-0 w-2.5 bg-gradient-to-r from-stone-500 via-stone-400 to-stone-600 z-20 shadow-md">
            {/* Pump motor head on surface */}
            <div 
              className={`absolute -top-1.5 -left-1.5 w-5 h-3 rounded-sm border flex items-center justify-center shadow-md transition-colors ${
                activeTrend?.type === 'fall' 
                  ? 'bg-amber-600 border-amber-400' 
                  : 'bg-sky-700 border-sky-400'
              }`}
              title="Agricultural Borewell Pump"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTrend?.type === 'fall' ? 'bg-amber-300 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            </div>

            {/* Suction bubbles rising inside borehole casing when water table falls / pumping occurs */}
            {(activeTrend?.type === 'fall' || farm.seasonInputCosts.waterPumping > 0) && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none flex flex-col items-center">
                <span className="w-1 h-1 rounded-full bg-sky-200 animate-borewell-suction" />
                <span className="w-1 h-1 rounded-full bg-sky-100 animate-borewell-suction delay-200" />
                <span className="w-1 h-1 rounded-full bg-sky-200 animate-borewell-suction delay-500" />
              </div>
            )}
          </div>

          {/* Water Suction Intake Nozzle - Animates along with the water table */}
          <motion.div 
            className="absolute left-7 w-4.5 h-4.5 rounded-full z-20 flex items-center justify-center pointer-events-none -translate-y-1/2"
            initial={false}
            animate={{ top: `${waterLevelPct}%` }}
            transition={{
              type: 'spring',
              stiffness: 55,
              damping: 14,
              mass: 0.85
            }}
          >
            <div className={`w-3.5 h-3.5 rounded-full border transition-all ${
              activeTrend?.type === 'fall'
                ? 'bg-amber-400 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse'
                : 'bg-sky-400 border-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.9)] animate-pulse'
            }`} />
          </motion.div>

          {/* Capillary Fringe Gradient Band (Moist soil just above static water table) */}
          <motion.div
            className="absolute left-0 right-12 h-4 pointer-events-none z-10 bg-gradient-to-t from-sky-900/35 to-transparent -translate-y-full"
            initial={false}
            animate={{ top: `${waterLevelPct}%` }}
            transition={{
              type: 'spring',
              stiffness: 55,
              damping: 14,
              mass: 0.85
            }}
          />

          {/* Floating Water Table Depth Level Pin attached to the Horizon */}
          <motion.div
            className="absolute right-12.5 z-20 pointer-events-none -translate-y-1/2 flex items-center gap-1"
            initial={false}
            animate={{ top: `${waterLevelPct}%` }}
            transition={{
              type: 'spring',
              stiffness: 55,
              damping: 14,
              mass: 0.85
            }}
          >
            <div className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 shadow-md border backdrop-blur-md transition-colors ${
              activeTrend?.type === 'rise'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500 shadow-emerald-950/50'
                : activeTrend?.type === 'fall'
                ? 'bg-amber-950/90 text-amber-200 border-amber-500 shadow-amber-950/50'
                : 'bg-stone-900/90 text-sky-300 border-sky-500/50'
            }`}>
              <Waves className="w-2.5 h-2.5 text-sky-400" />
              <span>{depth.toFixed(1)}m</span>
              {activeTrend?.type === 'rise' && <span className="text-emerald-400 font-extrabold animate-pulse">↑</span>}
              {activeTrend?.type === 'fall' && <span className="text-amber-400 font-extrabold animate-pulse">↓</span>}
            </div>
            {/* Subtle horizontal dashed marker line across scale */}
            <div className="w-2 border-b border-dashed border-sky-400/80" />
          </motion.div>

          {/* Depth Scale Ruler Ticks along Right Side */}
          <div className="absolute right-0 top-0 bottom-0 w-12 border-l border-stone-800 bg-stone-950/70 flex flex-col justify-between py-1 px-1 text-[9px] font-mono text-stone-500 pointer-events-none select-none z-20">
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

          {/* Water Table Horizon & Aquifer Body with Subtle Framer-Motion Spring & Fluid Wave */}
          <motion.div 
            className="absolute left-0 right-12 bottom-0 z-10"
            initial={false}
            animate={{ top: `${waterLevelPct}%` }}
            transition={{
              type: 'spring',
              stiffness: 55,
              damping: 14,
              mass: 0.85
            }}
          >
            {/* Fluid Water Table Surface Crest (Subtle SVG Undulating Wave) */}
            <div className="absolute -top-1.5 left-0 right-0 h-2 overflow-hidden pointer-events-none">
              <svg 
                className="w-[125%] h-full text-sky-400 animate-water-wave fill-current opacity-80"
                viewBox="0 0 1000 20"
                preserveAspectRatio="none"
              >
                <path d="M0,10 C150,18 350,2 500,10 C650,18 850,2 1000,10 L1000,20 L0,20 Z" />
              </svg>
            </div>

            {/* Glowing static horizon line */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] shadow-sm transition-colors duration-500 ${
              activeTrend?.type === 'rise'
                ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-horizon-glow'
                : activeTrend?.type === 'fall'
                ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-horizon-glow'
                : 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.7)]'
            }`} />

            {/* Aquifer body with gradient & shimmering reflections */}
            <div className="w-full h-full bg-gradient-to-b from-sky-600/30 via-sky-800/40 to-sky-950/95 relative overflow-hidden backdrop-blur-[1px]">
              {/* Shimmering surface light reflection */}
              <div className="absolute top-0.5 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-sky-300/40 to-transparent animate-pulse" />
              
              {/* Subtle upward recharge flow ripples when water table is rising */}
              {activeTrend?.type === 'rise' && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent animate-pulse pointer-events-none" />
              )}

              {/* Water Table Identifier Label inside Aquifer Zone */}
              <div className="absolute bottom-1 left-12 flex items-center gap-2 text-[10px] font-mono text-sky-200 font-semibold tracking-wider uppercase opacity-95">
                <Droplets className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                <span>Aquifer Water Table</span>
                <span className="text-sky-300 font-bold bg-sky-950/70 border border-sky-800/80 px-1.5 py-0.2 rounded text-[9px]">
                  {depth.toFixed(1)}m Depth
                </span>
                {isRaining && (
                  <span className="text-emerald-300 text-[9px] font-normal normal-case hidden sm:inline flex items-center gap-1">
                    • Infiltrating rain
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Explanatory Agro-Ecological Legend Footnote */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 mt-2 px-0.5 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-amber-400 font-bold">Agro Insight:</span>
          <span>Flood irrigation causes rapid groundwater drawdown; living cover crop residues and mulch act as micro-reservoirs that capture rain and recharge the aquifer.</span>
        </div>
        <div className="flex items-center gap-2 text-stone-300 font-mono text-[10px]">
          <div className="bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="text-stone-500">Recharge Dynamic:</span>
            <strong className={hasFarmPond ? 'text-emerald-400' : 'text-sky-300'}>
              {hasFarmPond ? 'Farm Pond Active (+150%)' : isRaining ? 'Active Rainfall Infiltration' : 'Passive Capillary Equilibrium'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
