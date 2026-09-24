import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { useGameStore } from '../state/gameStore';
import { Season } from '../simulation/types';
import { TrendingUp, Info } from 'lucide-react';

export const LongTermTrendsChart: React.FC = () => {
  const farm = useGameStore((state) => state.farm);

  // Compute current season values
  const totalTiles = farm.tiles.length;
  const avgSOM = farm.tiles.reduce((acc, t) => acc + t.soilOrganicMatter, 0) / totalTiles;
  const avgBeneficials = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / totalTiles;
  const avgCompaction = farm.tiles.reduce((acc, t) => acc + t.compaction, 0) / totalTiles;
  const avgSalinity = farm.tiles.reduce((acc, t) => acc + t.salinity, 0) / totalTiles;
  const currentSoilHealth = Math.min(100, Math.max(0, Math.round(
    (avgSOM * 0.45) + ((100 - avgCompaction) * 0.25) + ((100 - avgSalinity) * 0.15) + (avgBeneficials * 0.15)
  )));

  const seasonAbbr = (s: Season): string => {
    switch (s) {
      case 'Spring': return 'Spr';
      case 'Summer': return 'Sum';
      case 'Autumn': return 'Aut';
      case 'Winter': return 'Win';
      default: return s;
    }
  };

  // Build the array of the last 12 seasons
  // 1. If history has records, take up to the last 11 records plus current season
  const historyPoints = farm.history.map((record) => ({
    seasonLabel: `Y${record.year} ${seasonAbbr(record.season)}`,
    seasonFull: `Year ${record.year} ${record.season}`,
    soilHealth: record.soilHealthIndex,
    som: record.avgSoilOrganicMatter,
    waterDepth: Number(record.groundwaterDepth.toFixed(1)),
    isCurrent: false,
  }));

  // Current ongoing season point
  const currentPoint = {
    seasonLabel: `Y${farm.year} ${seasonAbbr(farm.season)}*`,
    seasonFull: `Year ${farm.year} ${farm.season} (Current)`,
    soilHealth: currentSoilHealth,
    som: Number(avgSOM.toFixed(1)),
    waterDepth: Number(farm.groundwaterDepth.toFixed(1)),
    isCurrent: true,
  };

  // Combine and take last 12 points
  let chartData = [...historyPoints, currentPoint];
  
  // If player just started (e.g. only 1 or 2 seasons so far), synthesize the pre-game baseline
  // so the player immediately gets a meaningful visualization rather than an empty box
  if (chartData.length < 4) {
    const baselines = [];
    const needed = 4 - chartData.length;
    for (let i = needed; i >= 1; i--) {
      baselines.push({
        seasonLabel: `Baseline -${i}`,
        seasonFull: `Pre-Simulation Historical Baseline`,
        soilHealth: 35,
        som: 34.0,
        waterDepth: 14.0,
        isCurrent: false,
      });
    }
    chartData = [...baselines, ...chartData];
  }

  // Keep last 12 seasons
  if (chartData.length > 12) {
    chartData = chartData.slice(-12);
  }

  // Custom Dark Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 border border-stone-700 p-3 rounded-lg shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="font-bold text-stone-200 border-b border-stone-800 pb-1 flex items-center justify-between gap-3">
            <span>{data.seasonFull}</span>
            {data.isCurrent && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono">LIVE</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span>Soil Health Index:</span>
            <span className="font-mono font-bold">{data.soilHealth}/100</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-amber-400">
            <span>Soil Organic Matter:</span>
            <span className="font-mono font-bold">{data.som}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sky-400">
            <span>Groundwater Table:</span>
            <span className="font-mono font-bold">{data.waterDepth} m deep</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-stone-950/95 border-t border-stone-800/90 p-3 sm:p-4 rounded-b-xl shadow-2xl animate-in slide-in-from-top-2 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              12-Season Agro-Ecological Trajectory
            </h3>
            <p className="text-[11px] text-stone-400">
              Long-term correlation between Soil Health (living organic matter) and Groundwater Table depth
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-emerald-300 font-semibold">Soil Health (0-100)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span className="text-sky-300 font-semibold">Water Table Depth (m)</span>
          </span>
        </div>
      </div>

      {/* Recharts Line & Area Container */}
      <div className="w-full h-44 sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="soilHealthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#292524" strokeDasharray="3 3" vertical={false} />

            <XAxis 
              dataKey="seasonLabel" 
              stroke="#78716c" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#44403c' }}
            />

            {/* Left Axis: Soil Health Index (0-100) */}
            <YAxis 
              yAxisId="left" 
              domain={[0, 100]} 
              stroke="#10b981" 
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#10b981', strokeOpacity: 0.4 }}
              tickFormatter={(v) => `${v}`}
            />

            {/* Right Axis: Groundwater Table Depth in meters (reversed so deeper is worse/lower) */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[6, 30]} 
              reversed={true} // Deeper water table appears at bottom of graph
              stroke="#38bdf8" 
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#38bdf8', strokeOpacity: 0.4 }}
              tickFormatter={(v) => `${v}m`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Shaded Area & Line for Soil Health */}
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="soilHealth" 
              stroke="#10b981" 
              strokeWidth={2.2} 
              fillOpacity={1} 
              fill="url(#soilHealthGradient)" 
              dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#064e3b' }}
              activeDot={{ r: 5, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
              name="Soil Health"
            />

            {/* Line for Groundwater Table Depth */}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="waterDepth" 
              stroke="#38bdf8" 
              strokeWidth={2.2} 
              strokeDasharray="4 3"
              dot={{ r: 3, fill: '#38bdf8', strokeWidth: 1, stroke: '#0c4a6e' }}
              activeDot={{ r: 5, fill: '#7dd3fc', stroke: '#ffffff', strokeWidth: 2 }}
              name="Water Table Depth"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 px-1 border-t border-stone-800/60 pt-1.5">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-stone-400" />
          <span>Notice how chemical monocultures cause soil health to decline while flood pumping drops water depth deeper (towards 25m+).</span>
        </span>
        <span className="font-mono text-stone-400">
          Tracking: Last {chartData.length} Seasons
        </span>
      </div>
    </div>
  );
};
