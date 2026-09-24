import React from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  X, 
  Trees, 
  Droplet, 
  Sparkles, 
  Milk, 
  Waves, 
  Check, 
  Lock,
  Award
} from 'lucide-react';

interface UpgradeItem {
  key: 'dripSystemInstalled' | 'agroforestryBorders' | 'compostPit' | 'livestockIntegration' | 'farmPond';
  title: string;
  cost: number;
  minYear: number;
  icon: React.ReactNode;
  description: string;
  benefits: string[];
}

export const UpgradesModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const farm = useGameStore((state) => state.farm);
  const unlockUpgrade = useGameStore((state) => state.unlockUpgrade);

  if (activeModal !== 'upgrades') return null;

  const upgrades: UpgradeItem[] = [
    {
      key: 'compostPit',
      title: 'Aerobic On-Farm Compost Facility',
      cost: 400,
      minYear: 1,
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      description: 'Ferments crop residue, fallen leaves, and microbial inoculants into rich humus.',
      benefits: [
        'Reduces compost cost from $6 to $1 per tile',
        'Inoculates soil with beneficial mycorrhizal fungi',
        'Helps build Soil Organic Matter (+4.5 SOM)'
      ]
    },
    {
      key: 'agroforestryBorders',
      title: 'Agroforestry Windbreaks & Tree Borders',
      cost: 750,
      minYear: 2,
      icon: <Trees className="w-5 h-5 text-emerald-400" />,
      description: 'Plant native deep-rooted nitrogen-fixing trees (acacia, neem, moringa) along field edges.',
      benefits: [
        'Cuts soil moisture evaporation by 18% during hot seasons',
        'Acts as sanctuary for predatory birds & pollinating bees',
        'Blocks soil erosion from heavy unseasonal rains'
      ]
    },
    {
      key: 'farmPond',
      title: 'Rainwater Harvesting Recharge Pond',
      cost: 950,
      minYear: 2,
      icon: <Waves className="w-5 h-5 text-sky-400" />,
      description: 'Excavated pond capturing monsoon runoff to actively recharge the groundwater aquifer.',
      benefits: [
        'Recharges local water table +150% faster after rain',
        'Prevents topsoil flooding on low-lying tiles',
        'Buffers crops during prolonged summer droughts'
      ]
    },
    {
      key: 'livestockIntegration',
      title: 'Livestock Integration (Manure & Grazing)',
      cost: 1400,
      minYear: 3,
      icon: <Milk className="w-5 h-5 text-purple-400" />,
      description: 'Integrate cows and goats to graze stubble and cycle organic nutrients on site.',
      benefits: [
        'Generates free high-nitrogen manure on farm ($0 compost)',
        'Accelerates soil microbiology and earthworm colonization',
        'Naturally clears post-harvest stubble without burning'
      ]
    },
    {
      key: 'dripSystemInstalled',
      title: 'Pressurized Drip Master System',
      cost: 850,
      minYear: 1,
      icon: <Droplet className="w-5 h-5 text-sky-400" />,
      description: 'Subsurface drip pipes delivering precise water directly to plant root zones.',
      benefits: [
        'Uses 70% less groundwater than flood irrigation',
        'Prevents nutrient leaching and salt crusting',
        'Maintains uniform crop vigor with minimal pumping cost'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Trees className="w-5 h-5 text-emerald-400" />
              <span>Agro-Ecological Farm Upgrades & Infrastructure</span>
            </h2>
            <p className="text-xs text-stone-400">
              Long-term investments in natural capital, water conservation, and soil biology
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upgrade Cards List */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          {upgrades.map((item) => {
            const isUnlocked = farm.unlockedUpgrades[item.key];
            const isYearLocked = farm.year < item.minYear;
            const canAfford = farm.cashBalance >= item.cost;

            return (
              <div 
                key={item.key}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked 
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-stone-200' 
                    : isYearLocked 
                    ? 'bg-stone-950/40 border-stone-800/60 opacity-60 text-stone-400' 
                    : 'bg-stone-950/80 border-stone-800 text-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-stone-100">{item.title}</h3>
                        {isUnlocked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Unlocked
                          </span>
                        )}
                        {isYearLocked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Unlocks Year {item.minYear}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>
                      
                      <ul className="mt-2 space-y-1">
                        {item.benefits.map((b, idx) => (
                          <li key={idx} className="text-[11px] text-stone-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  {!isUnlocked && (
                    <button
                      onClick={() => unlockUpgrade(item.key, item.cost)}
                      disabled={isYearLocked || !canAfford}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                        isYearLocked
                          ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? `Buy $${item.cost}` : `Need $${item.cost}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
