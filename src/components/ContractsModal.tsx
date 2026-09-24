import React from 'react';
import { useGameStore } from '../state/gameStore';
import { CLIMATE_ZONES } from '../config/climates';
import { X, Award, CheckCircle, ShieldAlert, Globe, Compass } from 'lucide-react';

export const ContractsModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const farm = useGameStore((state) => state.farm);
  const activeClimateZone = useGameStore((state) => state.activeClimateZone);
  const setClimateZone = useGameStore((state) => state.setClimateZone);

  if (activeModal !== 'contracts' && activeModal !== 'zones') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Market Contracts & Agro-Climatic Zones</span>
            </h2>
            <p className="text-xs text-stone-400">
              Long-horizon buyer agreements and ecological regional presets
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-stone-300">
          {/* Section 1: Organic Certified Buyer Contract */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Premium Organic Buyer Agreement
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${farm.hasOrganicCertification ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-stone-800 text-stone-400'}`}>
                {farm.hasOrganicCertification ? 'ACTIVE CONTRACT' : 'IN TRANSITION'}
              </span>
            </div>

            <p className="text-stone-400 leading-relaxed">
              Certified organic markets pay a <strong>+50% price premium</strong> per kilogram for all crops harvested from verified chemical-free soil.
            </p>

            <div className="bg-stone-900/90 p-3 rounded-lg border border-stone-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span>Certification Criteria:</span>
                <span className="text-stone-200 font-bold">3 Consecutive Seasons (Zero Synthetics)</span>
              </div>
              <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (farm.consecutiveChemicalFreeSeasons / 3) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Progress: {farm.consecutiveChemicalFreeSeasons} / 3 seasons complete</span>
                {farm.consecutiveChemicalFreeSeasons === 3 && <span className="text-emerald-400 font-semibold">100% Certified!</span>}
              </div>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Applying synthetic NPK fertilizer or chemical pesticide spray resets this streak to 0.</span>
            </div>
          </div>

          {/* Section 2: Agro-Climatic Zone Presets */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
            <span className="font-bold text-sm text-stone-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              Agro-Climatic Zone Configuration
            </span>
            <p className="text-stone-400 leading-relaxed">
              Configure rainfall distribution, groundwater depth, and seasonal weather risks:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(CLIMATE_ZONES).map((zone) => {
                const isActive = activeClimateZone === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => setClimateZone(zone.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isActive
                        ? 'border-sky-500 bg-sky-950/40 text-sky-200 ring-1 ring-sky-500'
                        : 'border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-850'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between mb-1">
                      <span>{zone.name}</span>
                      {isActive && <CheckCircle className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                    <div className="text-[11px] text-stone-400">{zone.description}</div>
                    <div className="text-[10px] text-stone-500 mt-2 font-mono">
                      Baseline Aquifer: {zone.baselineGroundwaterDepth}m
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
